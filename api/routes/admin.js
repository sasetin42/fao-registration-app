import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAdmin } from '../services/jwt.js';
import * as supabase from '../services/supabase.js';
import * as zoom from '../services/zoom.js';
import { authMiddleware } from '../middleware/auth.js';
import { sseClients, broadcastToAdmins } from './registration.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsFilePath = path.join(__dirname, '../../config/zoom_settings.json');
const meetingsFilePath = path.join(__dirname, '../../config/zoom_meetings.json');

// --- SSE Realtime Stream ---
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// --- Login ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  if (username === adminUser && password === adminPass) {
    const token = generateAdmin();
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Use authorization middleware for all subsequent routes
router.use(authMiddleware);

// --- Stats ---
router.get('/stats', async (req, res) => {
  try {
    const registrations = await supabase.select('registration_list');
    const stats = {
      total: registrations.length,
      approved: 0,
      pending: 0,
      rejected: 0,
      inPerson: 0,
      virtual: 0
    };

    for (const r of registrations) {
      const status = parseInt(r.approval_status, 10);
      if (status === 1) stats.approved++;
      else if (status === -1) stats.rejected++;
      else stats.pending++;

      if (r.attendance_mode === 'in-person') stats.inPerson++;
      if (r.attendance_mode === 'online') stats.virtual++;
    }

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// --- Registrations ---
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await supabase.select('registration_list', {}, '*', { order: 'created_at.desc' });
    return res.json({ success: true, data: registrations });
  } catch (err) {
    console.error('Registrations error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching registrations' });
  }
});

// --- Batch Status Update ---
router.put('/registrations/batch-status', async (req, res) => {
  const { ids, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  try {
    await supabase.updateBatch('registration_list', { approval_status: status }, 'id', ids);
    // Broadcast updates to SSE
    ids.forEach(id => {
      broadcastToAdmins('status_update', { id, approval_status: status });
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Batch status update error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing batch status update' });
  }
});

// --- Batch Delete ---
router.post('/registrations/batch-delete', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  try {
    await supabase.removeBatch('registration_list', 'id', ids);
    ids.forEach(id => {
      broadcastToAdmins('registration_deleted', { id });
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Batch delete error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing batch delete' });
  }
});

// --- Single Status Update ---
router.put('/registrations/:id/status', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body || {};
  try {
    await supabase.update('registration_list', { approval_status: status }, { id });
    broadcastToAdmins('status_update', { id, approval_status: status });
    return res.json({ success: true });
  } catch (err) {
    console.error('Single status update error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// --- Single Delete ---
router.delete('/registrations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await supabase.remove('registration_list', { id });
    broadcastToAdmins('registration_deleted', { id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Single delete error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting registration' });
  }
});

// --- Zoom Settings ---
router.get('/zoom/settings', async (req, res) => {
  let settings = {};
  if (fs.existsSync(settingsFilePath)) {
    try {
      settings = JSON.parse(await fs.promises.readFile(settingsFilePath, 'utf8')) || {};
    } catch (e) {
      // Ignore
    }
  }
  if (Object.keys(settings).length === 0) {
    settings = {
      account_id: process.env.ZOOM_ACCOUNT_ID || '',
      client_id: process.env.ZOOM_CLIENT_ID || '',
      client_secret: process.env.ZOOM_CLIENT_SECRET || '',
      secret_token: process.env.ZOOM_SECRET_TOKEN || ''
    };
  }
  return res.json({ success: true, data: settings });
});

router.post('/zoom/settings', async (req, res) => {
  const { account_id, client_id, client_secret, secret_token } = req.body || {};
  const settings = {
    account_id: (account_id || '').trim(),
    client_id: (client_id || '').trim(),
    client_secret: (client_secret || '').trim(),
    secret_token: (secret_token || '').trim()
  };
  try {
    await fs.promises.mkdir(path.dirname(settingsFilePath), { recursive: true });
    await fs.promises.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    console.error('Save zoom settings error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving zoom settings' });
  }
});

// --- Zoom Live Meetings ---
router.get('/zoom/meetings', async (req, res) => {
  try {
    const meetings = await zoom.listMeetings();
    const registrations = await supabase.select('registration_list');
    const counts = {};
    for (const r of registrations) {
      if (r.zoom_meeting_id) {
        const ids = String(r.zoom_meeting_id).split(',');
        for (let mId of ids) {
          mId = mId.trim();
          if (!mId) continue;
          counts[mId] = (counts[mId] || 0) + 1;
        }
      }
    }

    const mapped = meetings.map(m => {
      const mId = String(m.id);
      return {
        ...m,
        registrants_count: counts[mId] || 0
      };
    });

    return res.json({ success: true, data: mapped });
  } catch (err) {
    console.error('Zoom list meetings error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching Zoom live meetings' });
  }
});

// --- Zoom Live Meeting Details ---
router.get('/zoom/meetings/:meetingId', async (req, res) => {
  const { meetingId } = req.params;
  try {
    const details = await zoom.getMeetingDetails(meetingId);
    if (!details || details.error) {
      return res.json({ success: false, message: details?.error || 'Meeting not found' });
    }
    const registrants = await zoom.getMeetingRegistrants(meetingId);
    const participants = await zoom.getMeetingParticipants(meetingId);

    return res.json({
      success: true,
      data: { details, registrants, participants }
    });
  } catch (err) {
    console.error('Zoom meeting details error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching Zoom details' });
  }
});

// --- Configured Meetings ---
router.get('/zoom/config', async (req, res) => {
  let meetings = [];
  if (fs.existsSync(meetingsFilePath)) {
    try {
      meetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
    } catch (e) {
      // Ignore
    }
  }

  try {
    const registrations = await supabase.select('registration_list');
    const counts = {};
    for (const r of registrations) {
      if (r.zoom_meeting_id) {
        const ids = String(r.zoom_meeting_id).split(',');
        for (let mId of ids) {
          mId = mId.trim();
          if (!mId) continue;
          counts[mId] = (counts[mId] || 0) + 1;
        }
      }
    }

    meetings.forEach(m => {
      m.registrants_count = counts[m.meeting_id] || 0;
    });
  } catch (e) {
    // Ignore db count error
  }

  return res.json({ success: true, data: meetings });
});

router.post('/zoom/config', async (req, res) => {
  const { meeting_id, topic, display_name, image_url, is_active } = req.body || {};
  const mId = (meeting_id || '').trim();
  const mTopic = (topic || '').trim();
  const dName = (display_name || '').trim();
  const imgUrl = (image_url || '/assets/event_1.png').trim();
  const active = is_active !== undefined ? !!is_active : true;

  if (!mId || !mTopic) {
    return res.status(400).json({ success: false, message: 'Meeting ID and Topic are required.' });
  }

  let meetings = [];
  if (fs.existsSync(meetingsFilePath)) {
    try {
      meetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
    } catch (e) {
      // Ignore
    }
  }

  let found = false;
  for (const m of meetings) {
    if (m.meeting_id === mId) {
      m.topic = mTopic;
      m.display_name = dName || `${mTopic} (${mId})`;
      m.image_url = imgUrl;
      m.is_active = active;
      found = true;
      break;
    }
  }

  if (!found) {
    meetings.push({
      meeting_id: mId,
      topic: mTopic,
      display_name: dName || `${mTopic} (${mId})`,
      image_url: imgUrl,
      is_active: active
    });
  }

  try {
    await fs.promises.mkdir(path.dirname(meetingsFilePath), { recursive: true });
    await fs.promises.writeFile(meetingsFilePath, JSON.stringify(meetings, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    console.error('Save config meeting error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving config meeting' });
  }
});

router.delete('/zoom/config/:meetingId', async (req, res) => {
  const { meetingId } = req.params;
  let meetings = [];
  if (fs.existsSync(meetingsFilePath)) {
    try {
      meetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
    } catch (e) {
      // Ignore
    }
  }

  const filtered = meetings.filter(m => m.meeting_id !== meetingId);

  try {
    await fs.promises.writeFile(meetingsFilePath, JSON.stringify(filtered, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete config meeting error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting config meeting' });
  }
});

export default router;
