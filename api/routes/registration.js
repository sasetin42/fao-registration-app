import express from 'express';
import fs from 'fs';
import multer from 'multer';
import * as supabase from '../services/firebase.js';
import * as zoom from '../services/zoom.js';
import { generate as generateJWT } from '../services/jwt.js';
import { generateVisitorCode, generateAttendanceKey } from '../services/codegen.js';
import { generate as generateQR } from '../services/qr.js';
import * as settingsService from '../services/settings.js';

const router = express.Router();
const upload = multer();

// SSE Broadcast list (for admin panel realtime update)
export const sseClients = new Set();

export function broadcastToAdmins(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      // Ignore write errors (connection closed)
    }
  }
}

// ── GET /v1/qr & /v1/qr/logo ─────────────────────────────────
const handleQR = async (req, res) => {
  const key = req.query.attendance_key || '2510061';
  try {
    const buffer = await generateQR(key);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ success: false, message: 'Could not generate QR code' });
  }
};

router.get('/qr', handleQR);
router.get('/qr/logo', handleQR);

// ── POST /v1/validate-email ──────────────────────────────────
router.post('/validate-email', async (req, res) => {
  const email = (req.body.email_address || '').trim();
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }
  try {
    const existing = await supabase.select('registration_list', { email }, 'id');
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    return res.json({ success: true, message: 'Email is available' });
  } catch (err) {
    console.error('Email validation error:', err);
    return res.status(500).json({ success: false, message: 'Server error validating email' });
  }
});

// ── POST /v1/refresh-status ──────────────────────────────────
router.post('/refresh-status', async (req, res) => {
  const userId = req.body.user_id ? String(req.body.user_id).trim() : '';
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  try {
    const result = await supabase.select('registration_list', { id: userId }, 'approval_status');
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const approvalStatus = result[0].approval_status;
    const responseData = { approval_status: approvalStatus };

    if (parseInt(approvalStatus, 10) === 1) {
      const keys = await supabase.select('attendance_keys', { participant_id: userId }, 'visitor_code, attendance_key');
      responseData.attendance_key = keys?.[0]?.attendance_key || 'N/A';
    }
    return res.json({ success: true, message: 'Status fetched', data: responseData });
  } catch (err) {
    console.error('Refresh status error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching status' });
  }
});

// ── GET /v1/zoom-meetings ────────────────────────────────────
router.get('/zoom-meetings', async (req, res) => {
  try {
    // Zoom config fallback read
    let configMeetings = [];
    const meetingsFilePath = new URL('../../config/zoom_meetings.json', import.meta.url);
    try {
      configMeetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
    } catch (e) {
      // Ignore
    }

    const configMap = {};
    for (const cm of configMeetings) {
      configMap[cm.meeting_id] = cm;
    }

    try {
      const meetings = await zoom.listMeetings();
      if (!meetings || meetings.length === 0) {
        throw new Error("No live meetings returned");
      }
      const mappedMeetings = meetings.map(m => {
        const mId = String(m.id);
        const hasConfig = configMap[mId] !== undefined;
        return {
          meeting_id: mId,
          display_name: hasConfig ? configMap[mId].display_name : m.topic,
          image_url: (hasConfig && configMap[mId].image_url) ? configMap[mId].image_url : ''
        };
      });
      return res.json({ success: true, message: 'Active meetings fetched', data: { meetings: mappedMeetings } });
    } catch (err) {
      const activeMeetings = configMeetings.filter(m => m.is_active);
      return res.json({ success: true, message: 'Fallback active meetings fetched', data: { meetings: activeMeetings } });
    }
  } catch (err) {
    console.error('zoom-meetings route error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching zoom meetings' });
  }
});

// ── GET /v1/zoom-meetings/:meetingId ──────────────────────────
router.get('/zoom-meetings/:meetingId', async (req, res) => {
  const { meetingId } = req.params;
  try {
    let localPasscode = 'FAO2026';
    let configMeetings = [];
    const meetingsFilePath = new URL('../../config/zoom_meetings.json', import.meta.url);
    try {
      configMeetings = JSON.parse(await fs.promises.readFile(meetingsFilePath, 'utf8')) || [];
      const matched = configMeetings.find(m => String(m.meeting_id) === String(meetingId));
      if (matched && matched.passcode) {
        localPasscode = matched.passcode;
      }
    } catch (e) {
      // Ignore
    }

    const details = await zoom.getMeetingDetails(meetingId);
    if (!details || details.error) {
      const matched = configMeetings.find(m => String(m.meeting_id) === String(meetingId));
      return res.json({
        success: true,
        data: {
          meeting_id: String(meetingId),
          topic: matched ? matched.topic : `Session ${meetingId}`,
          passcode: localPasscode
        }
      });
    }

    return res.json({
      success: true,
      data: {
        meeting_id: String(details.id),
        topic: details.topic,
        passcode: details.password || localPasscode
      }
    });
  } catch (err) {
    console.error('Error fetching public meeting details:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Organization Normalization Rules
function normalizeOrganization(org) {
  if (!org) return null;
  let clean = org.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();
  
  // FAO variations
  if (
    lower === 'fao' ||
    lower === 'f.a.o.' ||
    lower === 'fao un' ||
    lower === 'fao-un' ||
    lower.includes('food and agriculture organization')
  ) {
    return 'FAO';
  }
  
  // United Nations variations
  if (
    lower === 'un' ||
    lower === 'u.n.' ||
    lower === 'united nations' ||
    lower.includes('united nations')
  ) {
    return 'United Nations';
  }

  // Capitalize first letter of each word as a general fallback for normalization
  return clean.split(' ').map(word => {
    if (word.length === 0) return '';
    // Check if it's already an acronym (all caps, length <= 4)
    if (word === word.toUpperCase() && word.length > 1 && word.length <= 4) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// ── POST /v1/register ────────────────────────────────────────
router.post('/register', upload.none(), async (req, res) => {
  try {
    const settings = await settingsService.loadSettings();
    if (!settings.registration_enabled) {
      return res.status(403).json({ success: false, message: 'Registration is currently closed.' });
    }
  } catch (err) {
    console.error('Settings load error in registration:', err);
  }

  const body = req.body || {};
  const fields = [
    'registration_type', 'prefix', 'speaker_type',
    'first_name', 'middle_initial', 'last_name', 'suffix', 'full_name',
    'age_range', 'gender', 'nationality',
    'affiliation', 'affiliation_sub', 'affiliation_specify',
    'designation', 'media_queries', 'company',
    'email', 'phone',
    'address_country', 'address_state', 'address_street', 'address_city', 'address_zip',
    'dietary', 'dietary_details', 'academic_type',
    'attendance_mode', 'attendance_days', 'visa_assistance', 'field_trip', 'seminar', 'zoom_meeting_id',
  ];

  const data = {};
  for (const field of fields) {
    let val = body[field];
    if (typeof val === 'string') {
      val = val.trim();
      // Simple htmlspecialchars-like sanitize
      val = val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    data[field] = val || null;
  }

  if (!data.email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const normalizedEmail = data.email.toLowerCase();

  try {
    // Check duplicate email (case-insensitive) and similar name
    const allRegs = await supabase.select('registration_list');
    
    const duplicateEmail = allRegs.find(r => (r.email || '').trim().toLowerCase() === normalizedEmail);
    if (duplicateEmail) {
      return res.status(400).json({ success: false, message: 'This email address is already registered. Please use a different email.' });
    }

    const duplicateName = allRegs.find(r => {
      const exFirst = (r.first_name || '').trim().toLowerCase();
      const exLast = (r.last_name || '').trim().toLowerCase();
      const newFirst = (data.first_name || '').trim().toLowerCase();
      const newLast = (data.last_name || '').trim().toLowerCase();
      return exFirst && exLast && newFirst && newLast && exFirst === newFirst && exLast === newLast;
    });
    if (duplicateName) {
      return res.status(400).json({ success: false, message: 'A registration with this name already exists. If this is a mistake, please contact the Administrator.' });
    }

    // Apply organization normalization rules
    if (data.company) {
      data.company = normalizeOrganization(data.company);
    }
    if (data.affiliation) {
      data.affiliation = normalizeOrganization(data.affiliation);
    }

    data.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Insert into Supabase
    const inserted = await supabase.insert('registration_list', data);
    if (!inserted || inserted.length === 0) {
      return res.status(400).json({ success: false, message: "We couldn't process your registration. Please try again." });
    }

    const userId = inserted[0].id;

    // Use try-catch to rollback insertion if any post-insert setup fails (prevents orphaned records/corruption)
    try {
      const visitorCode = generateVisitorCode(userId, 'FAO');
      const attendanceKey = generateAttendanceKey(userId);

      // Insert attendance keys
      await supabase.insert('attendance_keys', {
        participant_id: userId,
        visitor_code: visitorCode,
        attendance_key: attendanceKey
      });

      let joinUrl = null;
      if (data.attendance_mode === 'online' && data.zoom_meeting_id) {
        const meetingIds = String(data.zoom_meeting_id).split(',');
        const joinUrls = [];
        for (let mId of meetingIds) {
          mId = mId.trim();
          if (!mId) continue;
          const jUrl = await zoom.registerParticipant(mId, data.email, data.first_name, data.last_name);
          if (jUrl) {
            await supabase.saveZoomDetails(userId, jUrl);
            joinUrls.push(jUrl);
          }
        }
        if (joinUrls.length > 0) {
          joinUrl = joinUrls.join(', ');
        }
      }

      const tokenPayload = {
        ...data,
        user_id: userId,
        attendance_key: attendanceKey
      };
      if (joinUrl) {
        tokenPayload.zoom_join_url = joinUrl;
      }
      const token = generateJWT(tokenPayload);

      // Broadcast new registration to admin panel realtime table
      broadcastToAdmins('new_registration', { ...data, id: userId, visitor_code: visitorCode, attendance_key: attendanceKey, zoom_join_url: joinUrl });

      // Trigger webhook
      settingsService.triggerWebhook('new_registration', { ...data, id: userId, visitor_code: visitorCode, attendance_key: attendanceKey, zoom_join_url: joinUrl });

      return res.json({ status: 'success', success: true, message: 'Registration successful', data: { token } });

    } catch (innerErr) {
      console.error('Post-insert setup failed, rolling back registration:', innerErr);
      // Rollback inserted registration row to preserve database transactions integrity
      await supabase.remove('registration_list', { id: userId });
      throw innerErr;
    }

  } catch (err) {
    console.error('Registration API error:', err);
    return res.status(500).json({ success: false, message: "There's a problem submitting your form. Please try again or contact the Administrator." });
  }
});

// ── GET /v1/settings ─────────────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    const settings = await settingsService.loadSettings();
    return res.json({
      success: true,
      data: {
        site_name: settings.site_name,
        site_subtitle: settings.site_subtitle,
        registration_enabled: settings.registration_enabled
      }
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
