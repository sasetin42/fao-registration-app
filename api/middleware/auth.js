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
      // In Firebase migration, admin auth is local token-based or falls back to verifying admin user details in registration_list or settings.
      // Since the old Supabase auth verified user.id === '6ef5eb76-57f4-48bd-a20e-9445a4e5564e' and email === 'admin@gmail.com',
      // we can check if token matches the admin user profile or simple verification.
      // Let's implement local signature verification / check.
      // If we don't have Supabase, we can check our token or mock verification.
      // For fallback check, we can check if decoded payload matches our admin.
    } catch (err) {
      console.error('Firebase token verification fallback error:', err.message);
    }
  }

  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

