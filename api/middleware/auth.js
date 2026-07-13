import axios from 'axios';
import { decode } from '../services/jwt.js';

export async function authMiddleware(req, res, next) {
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

  let localVerifySuccess = false;
  try {
    const decoded = decode(token);
    if (decoded && decoded.role === 'admin') {
      req.user = decoded;
      localVerifySuccess = true;
      return next();
    }
  } catch (err) {
    // Local verification failed, fallback to Supabase verification below
  }

  if (!localVerifySuccess) {
    try {
      const response = await axios.get(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${token}`
        }
      });
      const user = response.data;
      if (user && (user.id === '6ef5eb76-57f4-48bd-a20e-9445a4e5564e' && user.email === 'admin@gmail.com')) {
        req.user = { role: 'admin', email: user.email, id: user.id };
        return next();
      }
    } catch (err) {
      console.error('Supabase token verification fallback error:', err.response?.data || err.message);
    }
  }

  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

