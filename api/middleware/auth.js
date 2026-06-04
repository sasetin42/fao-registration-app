import { decode } from '../services/jwt.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const decoded = decode(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
