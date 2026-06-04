// ═══════════════════════════════════════════════════════════
//  Supabase Service — REST API client (replaces SupabaseService.php)
// ═══════════════════════════════════════════════════════════
import axios from 'axios';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

// ── INSERT ───────────────────────────────────────────────────
export async function insert(table, data) {
  const res = await axios.post(
    `${SUPABASE_URL}/rest/v1/${table}`,
    data,
    { headers: { ...headers(), Prefer: 'return=representation' } }
  );
  return Array.isArray(res.data) ? res.data : [res.data];
}

// ── SELECT ───────────────────────────────────────────────────
export async function select(table, match = {}, selectCols = '*', opts = {}) {
  const params = new URLSearchParams({ select: selectCols });
  for (const [k, v] of Object.entries(match)) params.append(k, `eq.${v}`);
  if (opts.order) params.append('order', opts.order);
  if (opts.limit) params.append('limit', String(opts.limit));

  const res = await axios.get(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    { headers: headers() }
  );
  return Array.isArray(res.data) ? res.data : [];
}

// ── UPDATE (single match) ────────────────────────────────────
export async function update(table, data, match) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(match)) params.append(k, `eq.${v}`);

  const res = await axios.patch(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    data,
    { headers: { ...headers(), Prefer: 'return=representation' } }
  );
  return Array.isArray(res.data) ? res.data : [];
}

// ── DELETE (single match) ────────────────────────────────────
export async function remove(table, match) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(match)) params.append(k, `eq.${v}`);

  await axios.delete(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    { headers: headers() }
  );
  return true;
}

// ── BATCH UPDATE (id IN list) ────────────────────────────────
export async function updateBatch(table, data, keyCol, values) {
  if (!values.length) return [];
  const ids = values.map(Number).join(',');
  const res = await axios.patch(
    `${SUPABASE_URL}/rest/v1/${table}?${keyCol}=in.(${ids})`,
    data,
    { headers: { ...headers(), Prefer: 'return=representation' } }
  );
  return Array.isArray(res.data) ? res.data : [];
}

// ── BATCH DELETE (id IN list) ────────────────────────────────
export async function removeBatch(table, keyCol, values) {
  if (!values.length) return true;
  const ids = values.map(Number).join(',');
  await axios.delete(
    `${SUPABASE_URL}/rest/v1/${table}?${keyCol}=in.(${ids})`,
    { headers: headers() }
  );
  return true;
}

// ── SAVE ZOOM DETAILS ────────────────────────────────────────
export async function saveZoomDetails(userId, joinUrl) {
  try {
    await axios.post(
      `${SUPABASE_URL}/rest/v1/zoom_registrations`,
      { user_id: userId, join_url: joinUrl },
      { headers: { ...headers(), Prefer: 'return=minimal' } }
    );
  } catch (err) {
    console.error('Supabase saveZoomDetails error:', err.message);
  }
}
