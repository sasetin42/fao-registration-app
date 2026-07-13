# Plan: Manage Registrations Redesign

## Goal
Redesign the "Manage Registrations" table, headers, and toolbars in the admin panel to implement a premium layout matching the specified columns and layouts.

---

## Phase 1: Analysis

1. **Current UI Structure (`public/pages/admin-dashboard.html`)**:
   - The registrations section (`#registrations-section`) contains a basic `.table-header` with a plain title `<h2>Manage Registrations</h2>`.
   - The toolbar contains search input (`#searchInput`), attendance mode dropdown (`#filterMode`), status dropdown (`#filterStatus`), and action buttons (`#exportCsvBtn`, `#syncOnlineBtn`).
   - The table headers are: `Checkbox`, `Name`, `Email`, `Type`, `Mode`, `Status`, `Actions`.
   
2. **Current JavaScript Logic (`public/assets/admin.js`)**:
   - `renderTable()` filters registrations based on search input, attendance mode, and approval status.
   - Generates rows with columns: checkbox, full name, email, type (text), mode (badge), status (badge), actions dropdown menu.
   - Action menu is a button labeled "Actions" with a chevron down SVG.

3. **Required Redesign Layout**:
   - **Header Redesign**:
     - Subtitle under the title showing the record count (e.g. "4 records").
     - Right-aligned heartbeat showing "Live [Timestamp]" and a "Refresh" button.
   - **Toolbar Redesign**:
     - Search input ("Search name or email...").
     - "All Types" select dropdown.
     - "All Countries" select dropdown.
     - "Export" button on the far right.
   - **Table Columns Redesign**:
     1. `Checkbox` + `NAME / EMAIL`: Initials avatar (e.g., "DM" for "Devon Lane" or "John Doe" -> "JD") + Bold display name (top) + small grey email (bottom).
     2. `TYPE`: Stylized colored badge/pill (e.g. Participant, Speaker, Exhibitor).
     3. `COUNTRY`: Text displaying participant's country.
     4. `AFFILIATION`: Text displaying participant's affiliation.
     5. `REGISTERED AT`: Formatted date/time (e.g., `Jul 13, 2026 5:46 PM`).
     6. `ACTIONS`: Vertical three-dots button triggering the action menu.

---

## Phase 2: Planning & Task Breakdown

- [ ] **Task 1: Update HTML Structure (`public/pages/admin-dashboard.html`)**
  - Add subtitle element for record count under the `<h2>` header.
  - Implement the right-side Live Heartbeat status and Refresh button.
  - Update filters toolbar: add country filter, customize placeholder, ensure proper layout classes/ids.
  - Update table headers to: Checkbox, `NAME / EMAIL`, `TYPE`, `COUNTRY`, `AFFILIATION`, `REGISTERED AT`, `ACTIONS`.
  - Verify: Load dashboard and check that static layout elements and headers are correct.

- [ ] **Task 2: Implement CSS Styles for Premium Layout (`public/assets/admin.css`)**
  - Add styles for the initials avatar (`.avatar-circle`).
  - Add styles for the name/email double-line cell layout.
  - Add styles for the stylized badges/pills for `TYPE`.
  - Add styles for the clean vertical three-dots action button (`.three-dots-btn`).
  - Style the Live heartbeat indicator and alignment.
  - Verify: Check stylesheet parses without errors.

- [ ] **Task 3: Update JavaScript Logic (`public/assets/admin.js`)**
  - Update `renderTable()` to:
    - Update record count subtitle based on filtered / total count.
    - Dynamically generate the initials avatar from the user's name.
    - Support search & filters for Name, Email, Type, and Country.
    - Format `created_at` or registration timestamp to `MMM DD, YYYY h:mm A`.
    - Populate country & affiliation fields.
    - Update the Actions column to render as a vertical three-dots button.
  - Populate the "All Countries" dropdown filter dynamically from the unique list of countries.
  - Verify: Table renders correctly, names have avatars, country/affiliation/time are shown.

---

## Phase 3: Solutioning (Architecture & Design Details)

### Avatar Generator
We will extract initials from `first_name` and `last_name`:
```javascript
const getInitials = (firstName, lastName) => {
    const f = (firstName || '').charAt(0).toUpperCase();
    const l = (lastName || '').charAt(0).toUpperCase();
    return `${f}${l}` || '?';
};
```

### Date/Time Formatter
Use native `Intl.DateTimeFormat` to achieve the target format (`Jul 13, 2026 5:46 PM`):
```javascript
const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
```

### Country Filter & Rendering
Generate unique country list for dropdown menu:
```javascript
const populateCountryFilter = (regs) => {
    const select = document.getElementById('filterCountry');
    if (!select) return;
    const countries = [...new Set(regs.map(r => r.country).filter(Boolean))].sort();
    select.innerHTML = '<option value="all">All Countries</option>' + 
        countries.map(c => `<option value="${c}">${c}</option>`).join('');
};
```

---

## Phase 4: Implementation & Verification Steps

### Automated & Manual Verification
1. **Verification of Layout (UX Audit)**
   - Run the UX Audit script:
     ```powershell
     python .agents/scripts/checklist.py .
     ```
2. **Interactive UI Verification**
   - Open the web application and navigate to the Registrations screen.
   - Verify the record count updates dynamically on search/filter.
   - Verify filters for "All Types" and "All Countries" filter rows correctly.
   - Verify Action menu opens correctly from the three-dots button.
