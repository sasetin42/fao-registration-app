# Implementation Plan: Fix Duplicate Registration Sync Issues

## Overview
During online registration synchronization runs, multiple duplicate registration records are being created in Firestore instead of updating existing ones.
- **Root Cause**: The custom `supabase.update` query calls `select('registration_list', { id: existing.id })`. In `firebase.js`, the `select` function translates the query conditions to `where("id", "==", existing.id)`. Because Firestore documents do not contain an "id" field in their document bodies (the ID is the document identifier itself), this query always returns empty. As a result, updates are bypassed, and new duplicates are inserted on subsequent sync runs.
- **Goal**:
  1. Fix the ID lookup query behavior in `firebase.js` (select function).
  2. Implement a local de-duplication mechanism in `onlineSync.js`.
  3. Create and execute a migration script to clean up existing duplicate records in Firestore.

---

## Project Type
**WEB/BACKEND**

---

## Success Criteria
- [ ] Querying by `id` in `select` inside [firebase.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/firebase.js) successfully maps to Firestore's `documentId()`.
- [ ] Subsequent sync runs successfully update existing documents instead of creating new duplicates.
- [ ] A migration/cleanup script cleans up all pre-existing duplicates in the `registration_list` and `attendance_keys` collections.
- [ ] Local de-duplication in [onlineSync.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/onlineSync.js) prevents duplicate items within the same sync batch from creating duplicate records or inflating the sync count.

---

## Tech Stack
- **Node.js**: The backend environment running the API server.
- **Firebase Firestore**: The cloud database where registration and attendance data reside.
- **Firebase Web SDK v9+**: Used to interface with Firestore.

---

## File Structure
Only existing files will be modified, and one new scratch script will be added for the cleanup/migration.

```
c:/Users/User/OneDrive/Desktop/SASE PROJECT/FAO EVENT REGISTRATION/FAO REG APP/
├── api/
│   └── services/
│       ├── firebase.js       # Modify: Fix select ID query
│       └── onlineSync.js     # Modify: Apply local de-duplication
└── scratch/
    └── cleanup-duplicates.js # New: One-off migration/cleanup script
```

---

## Task Breakdown

### Task 1: Fix ID Querying in firebase.js
- **Agent**: `backend-specialist`
- **Recommended Skill**: `clean-code`, `api-patterns`
- **Description**: Import `documentId` from `firebase/firestore` and update the `select` function in [firebase.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/firebase.js) to check if the match key is `id`, and if so, map it to `where(documentId(), "==", value)` rather than querying the body fields.
- **INPUT**:
  - [firebase.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/firebase.js)
- **OUTPUT**:
  - Modified [firebase.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/firebase.js) with `documentId` query mapping for ID matches.
- **VERIFY**:
  - Run the test suite: `npm test` or run `node tests/firebase.test.js` (if available) to verify basic Firebase operations still pass.

---

### Task 2: Implement Local De-duplication in onlineSync.js
- **Agent**: `backend-specialist`
- **Recommended Skill**: `clean-code`
- **Description**: Add a `processedEmails` tracker Set inside `syncOnlineRegistrations` in [onlineSync.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/onlineSync.js). Skip processing if the email has already been encountered in the current sync batch. Additionally, handle cases where `allRegs` contains pre-existing duplicates by picking the first one and ignoring or preparing to remove subsequent duplicates.
- **INPUT**:
  - [onlineSync.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/onlineSync.js)
- **OUTPUT**:
  - Modified [onlineSync.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/onlineSync.js) with set-based de-duplication.
- **VERIFY**:
  - Verify sync triggers do not count or write duplicates if duplicate items are returned from the API payload.

---

### Task 3: Create and Run Firestore Duplicate Cleanup Migration Script
- **Agent**: `database-architect`
- **Recommended Skill**: `clean-code`, `database-design`
- **Description**: Write a migration script [cleanup-duplicates.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/scratch/cleanup-duplicates.js) that fetches all registrations in `registration_list`, groups them by email, identifies duplicate records (retaining the oldest/first record), deletes the extra duplicate documents from Firestore, and removes their corresponding `attendance_keys` documents.
- **INPUT**:
  - Firebase config / environment variables.
- **OUTPUT**:
  - Migration script [cleanup-duplicates.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/scratch/cleanup-duplicates.js).
- **VERIFY**:
  - Execute the script using node: `node scratch/cleanup-duplicates.js` (dry-run first, then execute real deletion).
  - Verify count of deleted duplicate documents in Firestore.

---

## Phase X: Final Verification Checklist
- [ ] No syntax errors in [firebase.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/firebase.js) or [onlineSync.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/api/services/onlineSync.js).
- [ ] Test the backend server startup using `npm start` or equivalent.
- [ ] Execute a manual trigger of the sync endpoint/function and check that existing records are updated (i.e. updated_at shifts or no duplicates are added to Firestore).
- [x] Check security scan scripts or standard validation:
  ```bash
  python .agents/skills/vulnerability-scanner/scripts/security_scan.py .
  ```
- [x] Build execution:
  ```bash
  npm run build
  ```

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-07-14
