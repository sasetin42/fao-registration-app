# Implementation Plan: Premium Countdown Timer with Rotating Border Animation

This plan outlines the implementation of a modern, premium countdown timer to replace the existing basic countdown in the registration page sidebar, complete with a rotating conic-gradient border animation.

---

## 🤖 Applying knowledge of `@project-planner`...
## 📚 Using skill: `@plan-writing`...

---

## Phase 1: ANALYSIS

### 1. Target Files Analysis
- **[registration.html](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/pages/registration.html)**: The container `div.sidebar-countdown` is located right below the location meta item (`Manila, Philippines`). We need to update its HTML markup to support the nested structure required for the animated rotating border.
- **[index.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/index.css)**: Existing styles for `.sidebar-countdown`, `.countdown-grid`, `.countdown-card`, `.countdown-val`, and `.countdown-label` are defined here. We will refactor these styles to design a premium, glassmorphic card container with a continuous moving rotating border outline (conic-gradient animation).
- **[registration.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/registration.js)**: The function `initEventCountdown` targets `2026-11-23T09:00:00+08:00` (which is exactly `November 23, 2026, 09:00:00 AM UTC+8`, Asia/Manila time). We will verify the timezone offset handling and ensure the UI handles transition states elegantly when the timer hits zero.

### 2. Rotating Border Animation Technique
To achieve a rotating conic-gradient border animation without layout distortion and with smooth performance:
1. **Container Styling**: The timer card container will have `position: relative`, `overflow: hidden`, and a border-radius.
2. **Pseudo-element Background**: A `::before` pseudo-element will be absolute-positioned, centered, and oversized (e.g., width/height at `150%` to cover corners), utilizing a `conic-gradient` background (colors matching the FAO premium palette, e.g., blues/accent golds or custom gradients).
3. **Keyframe Animation**: An `@keyframes spin` animation rotating the `::before` element `from { transform: rotate(0deg); } to { transform: rotate(360deg); }`.
4. **Foreground Overlay**: An inner card or `::after` element with a solid dark background slightly smaller (inset by `1px` or `2px`) to mask the center of the conic gradient, leaving only a thin `1px` or `2px` rotating border visible.

---

## Phase 2: PLANNING

### Task Breakdown & Dependencies

- [ ] **Task 1: HTML Markup Refactoring**
  - Update `public/pages/registration.html` to restructure the countdown container so it has an outer wrapper to hold the animated border canvas and an inner content card for the grids.
  - *Verify*: Element structure contains `<div class="sidebar-countdown-container">` containing `<div class="sidebar-countdown">`.

- [ ] **Task 2: CSS Animation and Layout Design**
  - Define custom CSS properties for the animation.
  - Implement the conic-gradient rotating background on `::before` with the `@keyframes spin` rotation.
  - Mask the center using an inner background color corresponding to the sidebar background (`#0A1D37` or equivalent theme color).
  - Style the countdown cards with premium typographic hierarchies, slight glassmorphism, and clear spacing.
  - *Verify*: Preview registration page to see the rotating animated border running smoothly.

- [ ] **Task 3: JavaScript Timer Update & Robustness**
  - Ensure `initEventCountdown` is cleanly initialized.
  - Verify that the target timestamp `2026-11-23T09:00:00+08:00` corresponds precisely to Manila time and doesn't drift.
  - Ensure that when the timer reaches zero, it swaps content gracefully.
  - *Verify*: Modify target date in local developer console to 10 seconds in the future and observe the zero-state transition.

- [ ] **Task 4: Quality & Visual Verification**
  - Run the visual/UX checks to ensure layout and alignment in the sidebar are correct.
  - Execute checking script `ux_audit.py` and `accessibility_checker.py`.
  - *Verify*: Successful completion of audits without warnings.

---

## Phase 3: SOLUTIONING

### 1. Proposed HTML Structure
We will modify the countdown block in `public/pages/registration.html` to:
```html
<div class="sidebar-countdown-container">
  <div class="sidebar-countdown-border"></div>
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
</div>
```

### 2. Proposed CSS Styles
```css
/* Animated Rotating Border Container */
.sidebar-countdown-container {
  position: relative;
  margin-top: 28px;
  padding: 1px; /* The border width */
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

/* Conic gradient rotation backing */
.sidebar-countdown-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    transparent 40%,
    #009688 50%,
    #00bcd4 60%,
    transparent 70%,
    transparent 100%
  );
  animation: rotate-border 4s linear infinite;
  z-index: 1;
}

@keyframes rotate-border {
  100% {
    transform: rotate(360deg);
  }
}

/* Inner Foreground Card */
.sidebar-countdown {
  position: relative;
  z-index: 2;
  background: #0f2440; /* Solid color to match sidebar background and mask center */
  border-radius: 11px; /* Slightly smaller than outer wrapper radius */
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}

.countdown-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.countdown-card:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
}

.countdown-val {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.countdown-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### 3. JavaScript Event Target & Logic
- Target Date: `2026-11-23T09:00:00+08:00`.
- This ensures the date is accurately parsed with Asia/Manila offset (+08:00).
- Fallback/Expiry State: Replace contents with a elegant notice or simply hide/show start state.

---

## Phase 4: IMPLEMENTATION

### Action Plan
1. Edit [registration.html](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/pages/registration.html) to apply the restructured `.sidebar-countdown-container` markup.
2. Edit [index.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/index.css) to add the CSS variables, animation keyframes, and rotating border styling.
3. Edit [registration.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/registration.js) to ensure exact timezone handling and fallback states.
4. Run validation checks:
   ```bash
   python .agents/skills/frontend-design/scripts/ux_audit.py .
   python .agents/skills/frontend-design/scripts/accessibility_checker.py .
   ```
