// ═══════════════════════════════════════════════════════════
//  Code Generator — replaces CodeGenerator.php
// ═══════════════════════════════════════════════════════════
import crypto from 'crypto';

const ATTENDANCE_SECRET = 'PCCP_ONLINE_SECRET';
const VISITOR_SECRET    = 'PCCP_VISITOR_SECRET';

export function generateVisitorCode(id, prefix = 'FAO') {
  const hash = crypto.createHmac('sha256', VISITOR_SECRET).update(String(id)).digest('hex');
  const code = BigInt(`0x${hash.slice(0, 12)}`).toString(36).slice(0, 6).toUpperCase();
  return `${prefix}-${code}`;
}

export function generateAttendanceKey(userId) {
  return crypto
    .createHmac('sha256', ATTENDANCE_SECRET)
    .update(String(userId))
    .digest('hex')
    .slice(0, 15)
    .toUpperCase();
}
