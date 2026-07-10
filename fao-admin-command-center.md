# Implementation Plan: FAO APSAM 2026 Event Command Center

This document outlines the detailed, step-by-step implementation plan to transform the existing FAO APSAM 2026 Admin Portal into a premium, enterprise-grade **Event Command Center**.

---

## 🧭 Open Questions & Design Choices
*Below are the default assumptions selected to move forward. If you wish to change these, please let us know before Phase 4 begins.*

1. **Design Theme & Color Palette:** 
   * **Selected:** Refined FAO Institutional Blue Theme with dark/light system compliance as specified in the master prompt.
2. **Executive KPIs & Metrics:**
   * **Selected:** Registration pipeline status, geographic/regional representation, real-time Zoom session sync status, email communication throughput, and attendance check-in velocity.
3. **Zoom Integration Depth:**
   * **Selected:** Read-only account sync, meeting configuration mapping, and live attendee logs/participation records display.

---

## 🛠️ Phase 1: Analysis & System Mapping

### 1.1 Existing Codebase & Asset Inventory
* **Styling Sheet:** [admin.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/admin.css) — Custom styling, needs clean-up and expansion to support the new design tokens.
* **Logic/State Script:** [admin.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/admin.js) — Handles API routing, credentials, rendering, and modals.
* **HTML Interfaces:**
  * [admin-login.html](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/pages/admin-login.html) — Basic split hero + login form.
  * [admin-dashboard.html](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/pages/admin-dashboard.html) — Current sidebar layout, statistics grid, registrations list, Zoom settings, and QR scanner.

### 1.2 Supabase Database Schemas
* `registration_list`: Main attendee database table containing user profile, type, attendance mode, country/region, and status.
* `attendance_keys`: Generated security/attendance confirmation records.
* `zoom_registrations`: Maps locally-approved virtual attendees to Zoom API registration database.
* `attendance_logs`: Real-time audit trails of QR scans and badge approvals.

---

## 🎨 Phase 2: Design System & Shared Tokens

We will inject a cohesive, high-end CSS variable set in `admin.css` using modern typography (`Maven Pro` + `Inter`) and vibrant, tailormade HSL color variables.

```css
:root {
  /* Color Palette - FAO Institutional Blue Theme */
  --primary: #0B5FA5;
  --primary-deep: #073B66;
  --dark-navy: #0B1F33;
  --accent-blue: #168DD1;
  --info: #2563EB;
  --success: #15803D;
  --warning: #D97706;
  --critical: #DC2626;
  --purple-accent: #7C3AED;
  
  --bg-main: #F4F7FA;
  --bg-secondary: #EDF2F7;
  --bg-card: #FFFFFF;
  
  --text-primary: #172033;
  --text-secondary: #667085;
  --text-muted: #98A2B3;
  
  --border: #E4E7EC;
  --border-strong: #D0D5DD;
  
  /* Visual Effects */
  --radius-lg: 12px;
  --radius-md: 8px;
  --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Key Tasks:
- [ ] **Define Typography:** Import and standardise fonts in `admin.css`.
- [ ] **Set Utility Classes:** Create standardized spacing, flex layout, and component state patterns.

---

## 🧱 Phase 3: Component Redesign & Enhancements

### 3.1 Sleek Navigation Sidebar
* **Goal:** Transform the static panel into an active, collapsible navigation sidebar with responsive indicator badges.
* **Features:** Icon animations, live registration counter bubble (real-time badge count next to the "Registrations" tab), and collapsibility.

### 3.2 Command Header
* **Goal:** Modernize top dashboard menu.
* **Features:** Search bar, event status heartbeat monitor (connected to system health API), timezone selector, and quick action launcher.

### 3.3 Interactive Toast Notifications & Custom Dialogs
* **Goal:** Replace default alerts with sleek, non-blocking UI notifications.
* **Features:** Smooth entrance/exit animations, progress indicators, action buttons (e.g., "Undo" action for batch status updates).

---

## 📊 Phase 4: Page Transformations & Dynamic Data Integration

### 4.1 Executive Dashboard (KPIs & Pipeline)
* **Visuals:** Grid layout of interactive glassmorphism KPI widgets showing registration funnel, check-in velocity, and region breakdown.
* **Interactive Elements:** Detail modals popup on click, direct PDF/CSV exports.

### 4.2 Registrations Command Panel & Advanced Filters
* **Goal:** Enhance [admin-dashboard.html#registrations-section](file:///c:/Users/User/OneDrive/Desktop/SASE PROJECT/FAO EVENT REGISTRATION/FAO REG APP/public/pages/admin-dashboard.html#L126-L180).
* **Features:** Fuzzy text searching, multi-select checkboxes for batch updates, dynamic columns selection.

### 4.3 Participant 360 Profile Tab
* **Goal:** Interactive details modal replacing basic text list.
* **Features:** Tabbed interface inside detail modal:
  * **General Info:** Full personal data, country/region, registration date.
  * **Attendance Status:** Physical check-in timestamps, Badge generation, QR code image preview.
  * **Zoom Metadata:** Webinar/meeting registration links, matching status, and join metrics.

### 4.4 Zoom Control Center & Live Sync
* **Goal:** Upgrade [admin-dashboard.html#zoom-section](file:///c:/Users/User/OneDrive/Desktop/SASE PROJECT/FAO EVENT REGISTRATION/FAO REG APP/public/pages/admin-dashboard.html#L181-L296).
* **Features:** Form validations, credential health checks, scheduled vs live attendees tracker.

### 4.5 Live Activity Stream & Attendance Logger
* **Goal:** Upgraded real-time checklist and scanner interface.
* **Features:** Sound feedback options, clear success/failure animations, auto-updating log list.

---

## 🏁 Done When (Verification Criteria)
- [ ] Design theme looks modern and complies with FAO's visual expectations.
- [ ] Sidebar registration counter dynamically updates via server event/long polling.
- [ ] Participant modal displays general profile info, check-in status, and Zoom details.
- [ ] Export features run smoothly and correctly output formatted CSV datasets.
- [ ] Final project audits (`checklist.py`, `ux_audit.py`, `seo_checker.py`) return success status.
