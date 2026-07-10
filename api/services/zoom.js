// ═══════════════════════════════════════════════════════════
//  Zoom Service — replaces ZoomService.php
// ═══════════════════════════════════════════════════════════
import axios   from 'axios';
import fs      from 'fs';
import path    from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '../../config/zoom_settings.json');

import { loadSettings } from './settings.js';

async function getAccessToken() {
  const settings = await loadSettings();
  const accountId = settings.zoom_account_id;
  const clientId = settings.zoom_client_id;
  const clientSecret = settings.zoom_client_secret;
  if (!accountId || !clientId || !clientSecret) return null;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const res = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      null,
      {
        headers: {
          Authorization  : `Basic ${credentials}`,
          'Content-Type' : 'application/x-www-form-urlencoded',
        },
      }
    );
    return res.data.access_token || null;
  } catch (err) {
    console.error('Zoom getAccessToken error:', err.response?.data || err.message);
    return null;
  }
}

// ── Register participant → returns personal join URL ─────────
export async function registerParticipant(meetingId, email, firstName, lastName) {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await axios.post(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
      { email, first_name: firstName, last_name: lastName },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return res.data.join_url || null;
  } catch (err) {
    console.error(`Zoom registerParticipant (${meetingId}) error:`, err.response?.data || err.message);
    return null;
  }
}

// ── List scheduled meetings ──────────────────────────────────
export async function listMeetings() {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const res = await axios.get(
      'https://api.zoom.us/v2/users/me/meetings?type=scheduled&page_size=300',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.meetings || [];
  } catch (err) {
    console.error('Zoom listMeetings error:', err.response?.data || err.message);
    return [];
  }
}

// ── Meeting details ──────────────────────────────────────────
export async function getMeetingDetails(meetingId) {
  const token = await getAccessToken();
  if (!token) return { error: 'Could not retrieve Zoom access token. Please verify credentials.' };
  try {
    const res = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || `Zoom API error (${err.response?.status})`;
    return { error: msg };
  }
}

// ── Registrants list ─────────────────────────────────────────
export async function getMeetingRegistrants(meetingId) {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const res = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants?page_size=300`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.registrants || [];
  } catch (err) {
    console.error('Zoom getMeetingRegistrants error:', err.response?.data || err.message);
    return [];
  }
}

// ── Participants (live + past) ────────────────────────────────
export async function getMeetingParticipants(meetingId) {
  const token = await getAccessToken();
  if (!token) return [];

  // Try live report first
  try {
    const res = await axios.get(
      `https://api.zoom.us/v2/report/meetings/${meetingId}/participants?page_size=300`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.participants?.length) return res.data.participants;
  } catch { /* try past */ }

  // Fallback: past meeting
  try {
    const res = await axios.get(
      `https://api.zoom.us/v2/past_meetings/${meetingId}/participants?page_size=300`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.participants || [];
  } catch (err) {
    console.error('Zoom getMeetingParticipants error:', err.response?.data || err.message);
    return [];
  }
}
