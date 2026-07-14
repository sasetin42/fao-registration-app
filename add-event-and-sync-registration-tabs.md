# Plan: Add Event and Sync Registration Tabs

## Goal
Implement a functional, high-quality tabbed navigation layout in the "Manage Registrations" section of the admin panel to filter between:
1. **Online Event Registered**: Registrations submitted directly to this application.
2. **Online Sync Registered**: Registrations synced from the external Tiny Comet API.

---

## Phase 1: Analysis

1. **Database Schema & Distinguishing Records**:
   - Both direct registrations and synced registrations are stored in the same Firestore collection `registration_list`.
   - To distinguish them, we will introduce a `registration_source` field:
     - Direct registrations (created in `api/routes/registration.js`) will have `registration_source: 'local'`.
     - Synced registrations (processed in `api/services/onlineSync.js`) will have `registration_source: 'tiny_comet'`.
     - Backwards compatibility: Existing registrations that lack `registration_source` will be treated as `'local'` (direct).

2. **Frontend UI/UX (`public/pages/admin-dashboard.html` & `public/assets/admin.css`)**:
   - We need tabs above the table filters or inside the header to toggle the views.
   - Tabs should look premium, styled with transitions, active state indicator (e.g. underline, bold weight), and hover states matching the FAO Institutional Blue palette.

3. **Frontend JS Logic (`public/assets/admin.js`)**:
   - `renderTable()` needs to filter registrations by both the selected tab and the existing search/dropdown filters.
   - We should maintain an `activeTab` variable (e.g., `'all'`, `'local'`, `'tiny_comet'`).

---

## Phase 2: Planning & Task Breakdown

- [ ] **Task 1: Backend Source Tracking Setup**
  - **Modify `api/routes/registration.js`**: Update `/register` router payload to set `registration_source: 'local'` upon insertion.
  - **Modify `api/services/onlineSync.js`**: Update the mapped data in `syncOnlineRegistrations()` to set `registration_source: 'tiny_comet'` when inserting/updating synced records.
  - Verify: Register a new test user directly and run a sync, then inspect database payload values in Firestore.

- [ ] **Task 2: Frontend HTML Tab Layout (`public/pages/admin-dashboard.html`)**
  - In `#registrations-section`, insert a tab navigation container right before the `.table-filters-toolbar`.
  - Add buttons for:
    - **All Registrations**
    - **Online Event Registered**
    - **Online Sync Registered**
  - Verify: Load dashboard and check that static tabs are visible in the registrations section.

- [ ] **Task 5: CSS Styles for Premium Tabs (`public/assets/admin.css`)**
  - Add styles for the tab list container (`.registration-tabs-container`), tab buttons (`.tab-btn`), active indicator state (`.tab-btn.active`), and transitions.
  - Match theme variables (e.g., `--primary-blue`, `--fao-accent`, `--text-secondary`).
  - Verify: Styles render correctly with clean margins, padding, and hover actions.

- [ ] **Task 4: Frontend Javascript Filtering Logic (`public/assets/admin.js`)**
  - Add click listeners to the tab buttons to update the active tab state and call `renderTable()`.
  - Update `renderTable()`'s array filtering to account for the selected tab:
    - `all`: Include everything.
    - `local`: Include records where `registration_source === 'local'` or `!registration_source`.
    - `tiny_comet`: Include records where `registration_source === 'tiny_comet'`.
  - Verify: Switching tabs updates the table dynamically to display only matching registrations.

---

## Phase 3: Solutioning (Architecture & Design Details)

### Backend Modification Example
In `api/routes/registration.js` (`/register` endpoint):
```javascript
data.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
data.approval_status = 1;
data.registration_source = 'local'; // Added field
```

In `api/services/onlineSync.js`:
```javascript
const mappedData = {
  // ... existing fields ...
  created_at: item.created_at || new Date().toISOString(),
  approval_status: 1,
  registration_source: 'tiny_comet' // Added field
};
```

### Tab Filter Filtering Logic
In `public/assets/admin.js` (inside `renderTable()`):
```javascript
const filtered = allRegistrations.filter(r => {
    // 1. Tab Filter
    const source = r.registration_source || 'local';
    if (activeTab === 'local' && source !== 'local') return false;
    if (activeTab === 'tiny_comet' && source !== 'tiny_comet') return false;

    // 2. Search Filter
    const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const email = (r.email || '').toLowerCase();
    const matchSearch = name.includes(search) || email.includes(search);
    
    // 3. Dropdowns
    const rType = (r.registration_type || '').toLowerCase();
    const matchType = filterType === 'all' || rType === filterType.toLowerCase();

    const rCountry = r.address_country || r.nationality || '';
    const matchCountry = filterCountry === 'all' || rCountry === filterCountry;

    return matchSearch && matchType && matchCountry;
});
```

---

## Phase 4: Implementation & Verification Steps

### Manual Verification
1. **Direct Event Registration Test**:
   - Go to the public registration page and submit a new registration.
   - Access the admin panel under **Online Event Registered** tab. Verify the new registration shows up here.
2. **Sync Sync Online Test**:
   - Click "Sync Online" to fetch external registrations.
   - Go to the **Online Sync Registered** tab. Verify that the synced registrations show up here.
3. **Multi-Filter Test**:
   - Combine searching/type filters with the active tabs. Verify the search filters work contextually under each tab.
