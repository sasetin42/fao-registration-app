# Super Admin Authentication - Implementation Plan

## Goal
Configure the admin panel authentication system to recognize and authenticate the user "admin@gmail.com" (User ID: "6ef5eb76-57f4-48bd-a20e-9445a4e5564e") as a Super Admin by integrating Supabase Auth flows into the local credentials-based login routing and token authentication middleware.

## Project Type
**BACKEND** (Express.js API server, Supabase Integration)

---

## 1. Analysis (Phase 1)
- **Super Admin Identifiers:**
  - Email: `admin@gmail.com`
  - User ID: `6ef5eb76-57f4-48bd-a20e-9445a4e5564e`
- **Target Files:**
  - [api/routes/admin.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/routes/admin.js) (Intercept login for `admin@gmail.com` and authenticate with Supabase Auth)
  - [api/middleware/auth.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/middleware/auth.js) (Validate tokens locally first, fall back to verification against Supabase Auth `/auth/v1/user` if local fails)
- **Supabase Auth API Endpoints:**
  - Token endpoint: `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`
  - User endpoint: `${process.env.SUPABASE_URL}/auth/v1/user`
  - Required headers for endpoints: `apikey: process.env.SUPABASE_KEY`

---

## 2. Planning (Phase 2)
### Proposed File Structure Changes
No new files will be created. The implementation will modify:
```
api/
├── middleware/
│   └── auth.js (Extend authMiddleware to verify tokens with Supabase Auth if local decoding fails)
└── routes/
    └── admin.js (Update /login route to authenticate "admin@gmail.com" via Supabase Auth password flow)
```

---

## 3. Solutioning (Phase 3)

### Supabase Login Integration (`api/routes/admin.js`)
If `username === 'admin@gmail.com'`, we perform a POST request to `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password` using `axios`:
- **Payload:** `{ email: username, password }`
- **Headers:** `{ apikey: process.env.SUPABASE_KEY, 'Content-Type': 'application/json' }`
- **Validation:** If Supabase successfully returns an `access_token` and the user profile matches the ID `6ef5eb76-57f4-48bd-a20e-9445a4e5564e`, return `{ success: true, token: res.data.access_token }`.

### Supabase Middleware Validation (`api/middleware/auth.js`)
- Attempt to decode the token locally using `decode(token)`.
- If the token cannot be decoded locally (e.g. it is a Supabase JWT and throws an error or fails the local role assertion):
  - Send a GET request to `${process.env.SUPABASE_URL}/auth/v1/user`.
  - **Headers:** `{ apikey: process.env.SUPABASE_KEY, Authorization: `Bearer ${token}` }`
  - **Validation:** If Supabase returns success and the returned user's `id` is `6ef5eb76-57f4-48bd-a20e-9445a4e5564e` or `email` is `admin@gmail.com`, attach the user info to `req.user` with `role: 'admin'` and invoke `next()`.

---

## 4. Tasks & Implementation (Phase 4)

- [ ] **Task 1: Supabase Login Integration in /login Route**
  - **Description:** Modify `/login` inside [admin.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/routes/admin.js) to check if the incoming username/email is `admin@gmail.com`. If so, request a token from the Supabase password flow and return the `access_token` on success.
  - **Agent:** `backend-specialist`
  - **Skills:** `api-patterns`, `clean-code`
  - **Verify:** Ensure a mock login post request with `admin@gmail.com` communicates with Supabase and returns a token.

- [ ] **Task 2: Supabase Token Verification in authMiddleware**
  - **Description:** Update `authMiddleware` inside [auth.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/middleware/auth.js) to verify tokens against Supabase Auth when local decoding fails. Verify that the user ID or email matches the Super Admin identifiers.
  - **Agent:** `backend-specialist`
  - **Skills:** `api-patterns`, `clean-code`
  - **Verify:** Ensure valid Supabase tokens grant admin access and populate `req.user`.

---

## 5. Verification (Phase X)

### Success Criteria
- [ ] Regular credentials-based login for `ADMIN_USER` continues to work.
- [ ] Login using `admin@gmail.com` with the correct Supabase password succeeds and returns the Supabase token.
- [ ] Super Admin API requests made using the Supabase token bypass local JWT validation errors, verify successfully with Supabase Auth, and authorize access as `admin`.

### Verification Steps
1. Run local dev server (e.g. `npm run dev` or `node api/server.js`).
2. Send test login request via client or `curl`/`Postman` to verification routes.
3. Run the automated check:
   - `python .agents/skills/testing-patterns/scripts/test_runner.py .`
