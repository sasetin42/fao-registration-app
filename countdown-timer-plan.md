# Event Countdown Timer - Implementation Plan

## Goal
Implement a beautiful, responsive, and accessible event countdown timer in the sidebar of the event registration page, counting down to the conference start date (November 23, 2026) in Manila.

## Project Type
**WEB** (Vanilla HTML/CSS/JS web application)

---

## 1. Analysis (Phase 1)
- **Target Event Date:** November 23, 2026, 09:00:00 AM (Manila Time, UTC+8).
- **Target Files:**
  - `public/pages/registration.html` (Markup insertion)
  - `public/assets/index.css` (Glassmorphic card styling)
  - `public/assets/registration.js` (Countdown calculation & DOM update logic)
- **Visual Design Rules:**
  - Glassmorphism: Use semi-transparent background pills (`rgba(255, 255, 255, 0.08)`), subtle white borders (`rgba(255, 255, 255, 0.15)`), and backdrop filters (`backdrop-filter: blur(12px)`).
  - Colors: High-contrast white text for numbers, slightly muted/opacity-reduced text for labels. Strictly avoid purple or violet tones in compliance with the theme.
  - Position: Directly underneath the "Manila, Philippines" metadata item in the sidebar.

---

## 2. Planning (Phase 2)
### Proposed File Structure Changes
No new files will be created. The implementation will modify:
```
public/
├── assets/
│   ├── index.css (Styles for the timer grid, glassmorphic pill cards, and transitions)
│   └── registration.js (Timer calculation logic, window load event hooks, zero-state transition)
└── pages/
    └── registration.html (HTML structure for the countdown timer inside the .info-meta container)
```

---

## 3. Solutioning (Phase 3)

### HTML Markup (Design Preview)
We will insert the following structure under the location meta item:
```html
<div class="sidebar-countdown" id="eventCountdown" aria-live="off" aria-label="Event countdown timer">
  <p class="countdown-title">Event Starts In</p>
  <div class="countdown-grid">
    <div class="countdown-card">
      <span class="countdown-val" id="countdown-days">00</span>
      <span class="countdown-label">Days</span>
    </div>
    <div class="countdown-card">
      <span class="countdown-val" id="countdown-hours">00</span>
      <span class="countdown-label">Hours</span>
    </div>
    <div class="countdown-card">
      <span class="countdown-val" id="countdown-mins">00</span>
      <span class="countdown-label">Mins</span>
    </div>
    <div class="countdown-card">
      <span class="countdown-val" id="countdown-secs">00</span>
      <span class="countdown-label">Secs</span>
    </div>
  </div>
</div>
```

### CSS Styling Strategy
- Style `.sidebar-countdown` with proper padding, margins, and transition capabilities.
- Create `.countdown-grid` using a CSS Grid or Flexbox wrapper with spacing/gaps.
- Style `.countdown-card` as glassmorphic pills:
  - `background: rgba(255, 255, 255, 0.07);`
  - `border: 1px solid rgba(255, 255, 255, 0.12);`
  - `border-radius: var(--radius-md, 8px);`
  - `backdrop-filter: blur(8px);`
  - `transition: transform 0.3s ease, background 0.3s ease;`
- Hover state for micro-interactions:
  - Slight scale up (`transform: translateY(-2px);`)
  - Elevated background opacity (`background: rgba(255, 255, 255, 0.12);`)

### JS Logic Strategy
- Define target date: `new Date("2026-11-23T09:00:00+08:00").getTime()`
- Create interval function running every 1000ms:
  - Calculate remaining time.
  - Update `#countdown-days`, `#countdown-hours`, `#countdown-mins`, and `#countdown-secs` with padded values (e.g. `String(val).padStart(2, '0')`).
  - Add simple fade-in transitions on load once the initial values are calculated to prevent layout flashes.
  - Handle expiration (when difference <= 0): Clear interval, display "Event Started" or transition layout to a clean badge.

---

## 4. Tasks & Implementation (Phase 4)

- [ ] **Task 1: Sidebar HTML Structure Insertion**
  - **Description:** Edit `public/pages/registration.html` to add the timer markup containing containers for Days, Hours, Minutes, and Seconds directly below the location `info-meta-item`.
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`
  - **Verify:** View `public/pages/registration.html` and verify the HTML layout has correct IDs and is in the correct place.

- [ ] **Task 2: Glassmorphic Timer Styling**
  - **Description:** Append styles for `.sidebar-countdown`, `.countdown-grid`, `.countdown-card`, `.countdown-val`, and `.countdown-label` to `public/assets/index.css`.
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`
  - **Verify:** Confirm class properties are added without any color rule violations (no purple/violet tones, high contrast numbers).

- [ ] **Task 3: Countdown Logic Implementation**
  - **Description:** Implement the timer calculation logic in `public/assets/registration.js` that counts down to November 23, 2026, 09:00:00 UTC+8 (Manila) and updates the innerHTML/innerText of the countdown values.
  - **Agent:** `frontend-specialist`
  - **Skills:** `clean-code`
  - **Verify:** Ensure no layout jumps occur when changing digits, values decrement every second, and initial load displays correctly.

---

## 5. Verification (Phase X)

### Success Criteria
- [ ] Countdown timer displays correct remaining duration corresponding to November 23, 2026.
- [ ] Aesthetics are premium: Glassmorphic cards have subtle animations on hover, distinct text hierarchies, and fit seamlessly into the existing sidebar theme.
- [ ] No purple or violet color palette elements used.
- [ ] Mobile-responsiveness holds: Layout adjusts gracefully when sidebar stacks on smaller viewports.

### Verification Steps
1. Run local dev server: `npm run dev` (or appropriate dev script).
2. Manually test and inspect layout color choices and responsive scaling in different screen width emulations.
3. Execute validation and quality checks:
   - `python .agents/skills/frontend-design/scripts/ux_audit.py .`
   - `python .agents/skills/frontend-design/scripts/accessibility_checker.py .`
