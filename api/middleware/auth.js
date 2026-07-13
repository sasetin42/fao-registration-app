import { decode } from '../services/jwt.js';
import axios from 'axios';
import { firebaseConfig } from '../services/firebase.js';

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
    // Local verification failed, fallback to Firebase verification below
  }

  if (!localVerifySuccess) {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        { idToken: token },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const userData = response.data?.users?.[0];
      if (userData && (userData.localId === 'gL3USbzAy3ftjvWK2uzbXYiYxDy1' || userData.email === 'admin@gmail.com')) {
        req.user = {
          id: userData.localId,
          email: userData.email,
          role: 'admin'
        };
        return next();
      }
    } catch (err) {
      console.error('Firebase token verification fallback error:', err.response?.data || err.message);
    }
  }

  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

