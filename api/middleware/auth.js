import { decode } from '../services/jwt.js';
import axios from 'axios';

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
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      const response = await axios.get(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`
        }
      });

      const userData = response.data;
      if (userData && (userData.id === 'gL3USbzAy3ftjvWK2uzbXYiYxDy1' || userData.email === 'admin@gmail.com')) {
        req.user = {
          id: userData.id,
          email: userData.email,
          role: 'admin'
        };
        return next();
      }
    } catch (err) {
      console.error('Supabase token verification fallback error:', err.message);
    }
  }

  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

