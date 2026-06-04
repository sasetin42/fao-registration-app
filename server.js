// ═══════════════════════════════════════════════════════════
//  FAO APSAM 2026 — Registration App Server (Node.js/Express)
//  Replaces PHP/Slim backend. All API routes served from here.
// ═══════════════════════════════════════════════════════════
import 'dotenv/config';
import express from 'express';
import path    from 'path';
import { fileURLToPath } from 'url';
import cors    from 'cors';

import registrationRoutes from './api/routes/registration.js';
import adminRoutes        from './api/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 8000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Assets ────────────────────────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ── Page Routes (serve HTML directly — preserves query strings) ─
app.get('/', (_req, res) =>
  res.redirect('/fao_registration'));

app.get('/fao_registration', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public/pages/registration.html')));

// ✅ KEY FIX: serve confirmation.html directly — NO redirect
// This preserves ?token= so confirmation.js can decode the JWT
app.get('/confirmation', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public/pages/confirmation.html')));

app.get('/admin', (_req, res) =>
  res.redirect('/admin/login'));

app.get('/admin/login', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public/pages/admin-login.html')));

app.get('/admin/dashboard', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public/pages/admin-dashboard.html')));

// ── API Routes ───────────────────────────────────────────────
app.use('/v1', registrationRoutes);
app.use('/v1/admin', adminRoutes);

// ── 404 fallback ─────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FAO APSAM 2026 App running at http://localhost:${PORT}`);
  console.log(`   Registration : http://localhost:${PORT}/fao_registration`);
  console.log(`   Admin Panel  : http://localhost:${PORT}/admin/dashboard`);
  console.log(`   Environment  : ${process.env.APP_ENV || 'development'}\n`);
});

export default app;
