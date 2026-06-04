// ═══════════════════════════════════════════════════════════
//  JWT Service — replaces JwtService.php
// ═══════════════════════════════════════════════════════════
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const ALGO   = process.env.JWT_ALGO   || 'HS512';
const ISSUER = process.env.JWT_ISSUER || 'localhost';

export function generate(payload) {
  return jwt.sign(
    { iss: ISSUER, iat: Math.floor(Date.now() / 1000), ...payload },
    SECRET,
    { algorithm: ALGO }
  );
}

export function decode(token) {
  return jwt.verify(token, SECRET, { algorithms: [ALGO] });
}

// Generate admin token (7-day expiry)
export function generateAdmin() {
  return generate({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 * 7 });
}
