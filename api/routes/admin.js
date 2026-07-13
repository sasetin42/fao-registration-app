import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAdmin } from '../services/jwt.js';
import * as supabase from '../services/supabase.js';
import * as zoom from '../services/zoom.js';
import { authMiddleware } from '../middleware/auth.js';
import { sseClients, broadcastToAdmins } from './registration.js';
import { loadSettings, saveSettings } from '../services/settings.js';
import * as settingsService from '../services/settings.js';
import axios from 'axios';

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

  if (username === 'admin@gmail.com') {
    try {
      const response = await axios.post(
        `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email: username, password },
        {
          headers: {
            apikey: process.env.SUPABASE_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      const user = response.data?.user;
      if (user && (user.id === '6ef5eb76-57f4-48bd-a20e-9445a4e5564e' && user.email === 'admin@gmail.com')) {
        return res.json({ success: true, token: response.data.access_token });
      }
      return res.status(401).json({ success: false, message: 'Unauthorized user ID or email' });
    } catch (err) {
      console.error('Supabase login fallback error:', err.response?.data || err.message);
      return res.status(401).json({ success: false, message: 'Invalid credentials or login failed' });
    }
  }

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

  // Securely validate status
  let finalStatus;
  let statusName;
  if (status === 1 || status === '1' || status === 'approved') {
    finalStatus = '1';
    statusName = 'Approved';
  } else if (status === -1 || status === '-1' || status === 'rejected') {
    finalStatus = '-1';
    statusName = 'Rejected';
  } else if (status === 0 || status === '0' || status === 'pending') {
    finalStatus = 'pending';
    statusName = 'Pending';
  } else {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    // Retrieve currently existing records to check transitions and find names
    const allParticipants = await supabase.select('registration_list');
    const participantsToUpdate = allParticipants.filter(p => ids.map(Number).includes(Number(p.id)));

    // Execute batch update in database
    await supabase.updateBatch('registration_list', { approval_status: finalStatus }, 'id', ids);

    // Build timeline logs for status changes
    const logsToInsert = [];
    const nowStr = new Date().toISOString();
    
    for (const p of participantsToUpdate) {
      const oldStatus = p.approval_status;
      if (String(oldStatus) !== String(finalStatus)) {
        const oldStatusName = oldStatus === '1' ? 'Approved' : (oldStatus === '-1' ? 'Rejected' : 'Pending');
        logsToInsert.push({
          participant_id: p.id,
          scanned_at: nowStr,
          scanned_by: `Status changed from ${oldStatusName} to ${statusName} (Admin)`
        });
      }
    }

    // Insert audit logs as a batch transaction to prevent corruption
    if (logsToInsert.length > 0) {
      await supabase.insert('attendance_logs', logsToInsert);
    }

    // Broadcast status updates to SSE
    ids.forEach(id => {
      broadcastToAdmins('status_update', { id, approval_status: finalStatus });
    });
    
    // Broadcast check-in reload if logs changed
    if (logsToInsert.length > 0) {
      broadcastToAdmins('attendance_checkin', { id: Date.now() });
    }

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

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid registration ID' });
  }

  // Securely validate status
  let finalStatus;
  let statusName;
  if (status === 1 || status === '1' || status === 'approved') {
    finalStatus = '1';
    statusName = 'Approved';
  } else if (status === -1 || status === '-1' || status === 'rejected') {
    finalStatus = '-1';
    statusName = 'Rejected';
  } else if (status === 0 || status === '0' || status === 'pending') {
    finalStatus = 'pending';
    statusName = 'Pending';
  } else {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const participants = await supabase.select('registration_list', { id });
    if (!participants || participants.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    const participant = participants[0];
    const oldStatus = participant.approval_status;

    // Only update and log if status actually changed
    if (String(oldStatus) !== String(finalStatus)) {
      await supabase.update('registration_list', { approval_status: finalStatus }, { id });

      // Log status change transition
      const oldStatusName = oldStatus === '1' ? 'Approved' : (oldStatus === '-1' ? 'Rejected' : 'Pending');
      const logData = {
        participant_id: id,
        scanned_at: new Date().toISOString(),
        scanned_by: `Status changed from ${oldStatusName} to ${statusName} (Admin)`
      };
      await supabase.insert('attendance_logs', logData);
      
      broadcastToAdmins('status_update', { id, approval_status: finalStatus });
      // Broadcast check-in reload
      broadcastToAdmins('attendance_checkin', {
        id: Date.now(),
        participant_id: id,
        full_name: participant.full_name || `${participant.first_name} ${participant.last_name}`,
        email: participant.email,
        scanned_at: logData.scanned_at
      });
    }

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

// --- Attendance Scan ---
router.post('/attendance/scan', async (req, res) => {
  const { attendance_key } = req.body || {};
  if (!attendance_key) {
    return res.status(400).json({ success: false, message: 'Attendance key is required' });
  }

  try {
    const keys = await supabase.select('attendance_keys', { attendance_key });
    if (!keys || keys.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid QR Code / Attendance Key' });
    }

    const participantId = keys[0].participant_id;
    const participants = await supabase.select('registration_list', { id: participantId });
    if (!participants || participants.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const participant = participants[0];

    if (participant.approval_status !== '1' && participant.approval_status !== 1) {
      return res.status(400).json({ 
        success: false, 
        message: `Check-in denied: registration status is '${participant.approval_status}' (not approved).` 
      });
    }

    const logData = {
      participant_id: participantId,
      scanned_at: new Date().toISOString(),
      scanned_by: 'Admin Panel'
    };

    const inserted = await supabase.insert('attendance_logs', logData);
    
    broadcastToAdmins('attendance_checkin', {
      id: inserted?.[0]?.id || Date.now(),
      participant_id: participantId,
      full_name: participant.full_name || `${participant.first_name} ${participant.last_name}`,
      email: participant.email,
      scanned_at: logData.scanned_at
    });

    return res.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        participant: {
          id: participant.id,
          full_name: participant.full_name || `${participant.first_name} ${participant.last_name}`,
          email: participant.email,
          attendance_mode: participant.attendance_mode,
          company: participant.company
        },
        scanned_at: logData.scanned_at
      }
    });

  } catch (err) {
    console.error('Attendance scan error:', err);
    if (err.response?.data?.code === 'PGRST205') {
      return res.status(400).json({ 
        success: false, 
        message: 'Scan failed: The attendance_logs table is missing from your Supabase database. Please create it in your Supabase SQL Editor.' 
      });
    }
    return res.status(500).json({ success: false, message: 'Server error processing check-in' });
  }
});

// --- Attendance Logs ---
router.get('/attendance/logs', async (req, res) => {
  try {
    const logs = await supabase.select('attendance_logs', {}, '*', { order: 'scanned_at.desc' });
    if (!logs || logs.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const participants = await supabase.select('registration_list');
    const participantMap = {};
    for (const p of participants) {
      participantMap[p.id] = p;
    }

    const mappedLogs = logs.map(l => {
      const p = participantMap[l.participant_id] || {};
      return {
        id: l.id,
        participant_id: l.participant_id,
        full_name: p.full_name || `${p.first_name || 'N/A'} ${p.last_name || ''}`.trim(),
        email: p.email || 'N/A',
        attendance_mode: p.attendance_mode || 'N/A',
        scanned_at: l.scanned_at,
        scanned_by: l.scanned_by
      };
    });

    return res.json({ success: true, data: mappedLogs });
  } catch (err) {
    console.error('Attendance logs error:', err);
    if (err.response?.data?.code === 'PGRST205') {
      return res.json({ 
        success: true, 
        data: [], 
        warning: 'The attendance_logs table is missing from your Supabase database. Please run the SQL from schema.sql to configure it.' 
      });
    }
    return res.status(500).json({ success: false, message: 'Server error fetching attendance logs' });
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

  // Mask sensitive technical credentials
  const maskedSettings = {
    account_id: settings.account_id || '',
    client_id: settings.client_id || '',
    client_secret: settings.client_secret ? '●●●●●●●●' : '',
    secret_token: settings.secret_token ? '●●●●●●●●' : ''
  };

  return res.json({ success: true, data: maskedSettings });
});

router.post('/zoom/settings', async (req, res) => {
  const { account_id, client_id, client_secret, secret_token } = req.body || {};

  // Read existing settings to preserve masked fields if not updated
  let existingSettings = {};
  if (fs.existsSync(settingsFilePath)) {
    try {
      existingSettings = JSON.parse(await fs.promises.readFile(settingsFilePath, 'utf8')) || {};
    } catch (e) {
      // Ignore
    }
  }
  if (Object.keys(existingSettings).length === 0) {
    existingSettings = {
      account_id: process.env.ZOOM_ACCOUNT_ID || '',
      client_id: process.env.ZOOM_CLIENT_ID || '',
      client_secret: process.env.ZOOM_CLIENT_SECRET || '',
      secret_token: process.env.ZOOM_SECRET_TOKEN || ''
    };
  }

  const final_client_secret = (client_secret === '●●●●●●●●' || !client_secret)
    ? (existingSettings.client_secret || '')
    : client_secret.trim();

  const final_secret_token = (secret_token === '●●●●●●●●' || !secret_token)
    ? (existingSettings.secret_token || '')
    : secret_token.trim();

  const settings = {
    account_id: (account_id || '').trim(),
    client_id: (client_id || '').trim(),
    client_secret: final_client_secret,
    secret_token: final_secret_token
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
    let details = await zoom.getMeetingDetails(meetingId);
    let registrants = [];
    let participants = [];
    let zoomError = null;

    if (!details || details.error) {
      zoomError = details?.error || 'Could not retrieve Zoom details';
      // Load fallback details from configured meetings
      let configMeetings = [];
      if (fs.existsSync(meetingsFilePath)) {
        try {
          configMeetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
        } catch (e) {}
      }
      const matched = configMeetings.find(m => String(m.meeting_id) === String(meetingId));
      details = {
        id: meetingId,
        topic: matched ? matched.topic : `Zoom Session (${meetingId})`,
        status: 'Offline / Local Only',
        fallback: true
      };
    } else {
      registrants = await zoom.getMeetingRegistrants(meetingId);
      participants = await zoom.getMeetingParticipants(meetingId);
    }

    // Get local database registrants for this meetingId
    let localRegistrants = [];
    try {
      const localRegs = await supabase.select('registration_list');
      localRegistrants = localRegs.filter(r => {
        if (!r.zoom_meeting_id) return false;
        const ids = String(r.zoom_meeting_id).split(',').map(id => id.trim());
        return ids.includes(String(meetingId));
      }).map(r => ({
        first_name: r.first_name || '',
        last_name: r.last_name || r.full_name || '',
        email: r.email,
        status: parseInt(r.approval_status, 10) === 1 ? 'Approved' : (parseInt(r.approval_status, 10) === -1 ? 'Rejected' : 'Pending'),
        create_time: r.created_at,
        is_local: true
      }));
    } catch (dbErr) {
      console.error('Database fetch error in zoom inspect:', dbErr);
    }

    return res.json({
      success: true,
      data: { 
        details, 
        registrants, 
        participants,
        localRegistrants,
        zoomError
      }
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
  const { meeting_id, topic, display_name, image_url, passcode, is_active } = req.body || {};
  const mId = (meeting_id || '').trim();
  const mTopic = (topic || '').trim();
  const dName = (display_name || '').trim();
  const imgUrl = (image_url || '/assets/event_1.png').trim();
  const passVal = (passcode || '').trim();
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
      m.passcode = passVal;
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
      passcode: passVal,
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

// --- General Settings ---
router.get('/settings', async (req, res) => {
  try {
    const settings = await settingsService.loadSettings();
    // Mask sensitive fields
    const masked = {
      ...settings,
      zoom_client_secret: settings.zoom_client_secret ? '●●●●●●●●' : ''
    };
    return res.json({ success: true, data: masked });
  } catch (err) {
    console.error('Get system settings error:', err);
    return res.status(500).json({ success: false, message: 'Server error loading settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const saved = await settingsService.saveSettings(req.body || {});
    const masked = {
      ...saved,
      zoom_client_secret: saved.zoom_client_secret ? '●●●●●●●●' : ''
    };
    return res.json({ success: true, data: masked });
  } catch (err) {
    console.error('Save system settings error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving settings' });
  }
});

export default router;
