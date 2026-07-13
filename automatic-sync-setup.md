# Implementation Plan: Automatic Online Registration Sync

This document outlines the detailed plan to integrate automatic, real-time syncing of online registrations when loading dashboard statistics or registrations in the admin panel.

---

## 📋 Overview
- **Objective:** Automatically invoke the online registration sync service (`syncOnlineRegistrations()`) when the admin panel dashboard loads or refreshes.
- **Problem Statement:** Syncing is currently manual. For a real-time experience, the sync should trigger automatically on dashboard/list fetch operations. However, concurrent requests could trigger multiple overlapping sync runs, leading to database lock contention, double inserts, or unnecessary network traffic.
- **Solution:** 
  1. Add a concurrency lock (promise-based reuse) to `api/services/onlineSync.js` to ensure only one sync runs at a time, resolving concurrent calls to the same execution promise.
  2. Modify `api/routes/admin.js` to run the sync automatically inside the `GET /registrations` and `GET /stats` routes before database reads.
  3. Ensure network failure resilience: if the remote sync API fails, the backend should log the error and proceed to serve cached/local data instead of throwing a 500 error.

---

## 🎯 Success Criteria
1. **Concurrency Control:** Initiating multiple concurrent sync calls executes exactly one HTTP request to the remote API. All concurrent callers await the same operation and resolve cleanly.
2. **Automated Triggering:** Accessing `GET /registrations` or `GET /stats` triggers the sync operation automatically.
3. **Resilience:** If the external API `api-tiny-comet-wjk.ptscph.com` is offline or returns an error, the admin routes handle it gracefully (log the warning, then proceed to fetch and return the local Firestore data).
4. **Build and Test Integrity:** The application starts and compiles successfully post-implementation.

---

## 🛠️ Tech Stack & Architecture
- **Environment:** Node.js (Express)
- **Database/Storage:** Firestore (wrapped via local helper `api/services/firebase.js`)
- **HTTP Client:** Axios (for remote API calls)
- **Concurrency Strategy:** Module-level promise-based lock mechanism

---

## 📂 Target File Structure
```
api/
├── services/
│   └── onlineSync.js     <-- Implement Concurrency Lock & Promise Reuse
└── routes/
    └── admin.js          <-- Add trigger inside GET /registrations and GET /stats
```

---

## 📝 Task Breakdown

### Phase 1: Analysis & Concurrency Design
- **Task ID:** `sync-concurrency-design`
- **Name:** Concurrency Lock Design for Sync Service
- **Agent:** `backend-specialist`
- **Skills:** `clean-code`, `api-patterns`
- **Priority:** P1
- **Dependencies:** None
- **INPUT:** `api/services/onlineSync.js`
- **OUTPUT:** Design specification for in-memory locking (e.g., using `activeSyncPromise`).
- **VERIFY:** Confirm promise reuse logic behaves correctly under simultaneous invocations.

---

### Phase 2: Implementation of Locking Mechanism
- **Task ID:** `sync-implement-lock`
- **Name:** Implement Concurrency Locking in `onlineSync.js`
- **Agent:** `backend-specialist`
- **Skills:** `clean-code`
- **Priority:** P1
- **Dependencies:** `sync-concurrency-design`
- **INPUT:** `api/services/onlineSync.js`
- **OUTPUT:** Modified `api/services/onlineSync.js` containing an in-memory lock variable `activeSyncPromise`.
- **VERIFY:**
  - Verify that if `activeSyncPromise` is null, a new promise is created and assigned.
  - Verify that if `activeSyncPromise` is already set, subsequent calls return this same promise.
  - Verify that `activeSyncPromise` is set back to `null` in a `finally` block when the sync completes.

---

### Phase 3: Integration into Admin Routes
- **Task ID:** `sync-integrate-routes`
- **Name:** Integrate Sync in `GET /registrations` and `GET /stats` Routes
- **Agent:** `backend-specialist`
- **Skills:** `clean-code`
- **Priority:** P1
- **Dependencies:** `sync-implement-lock`
- **INPUT:** `api/routes/admin.js`
- **OUTPUT:** Modified `api/routes/admin.js` calling `syncOnlineRegistrations()` inside the handlers.
- **VERIFY:**
  - Verify that the call to `syncOnlineRegistrations()` is wrapped in a `try...catch` block.
  - Verify that on error, the catch block logs the error and allows the route handler to proceed to query the local database.

---

## 🧪 Phase X: Verification Checklist

### 1. Build & Lint Verification
Run lint checks and syntax checks on the modified files to verify no errors were introduced:
```powershell
node --check api/services/onlineSync.js
node --check api/routes/admin.js
```

### 2. Runtime Verification
Start the development server and verify the admin routes load successfully and trigger the sync:
```powershell
npm run dev
```
Perform manual validation using API clients or by loading the admin panel dashboard.

### 3. Rule Compliance Checks
- [ ] Concurrency locking prevents double execution.
- [ ] Network errors on sync do not crash the admin dashboard endpoints.
- [ ] No purple or violet color palette changes or visual regression checks required for this backend integration.
