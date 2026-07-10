# Zoom Cards Border Glow & UX Enhancements Plan

## Goal
Enhance the user experience of the Zoom Meeting cards inside the FAO Event Registration Application by adding a premium, continuous rotating conic-gradient border animation on selected cards, a visual checkbox/tick indicator in the banner, and dynamic status badges.

---

## Success Criteria
1. **Premium Rotating Border**: When a Zoom session card is selected (`.is-selected`), a `2px` thick border animated with a smooth, continuous rotating color circle appears.
2. **Visual Checkmark Overlay**: A clean, premium checkmark/tick icon overlay appears in the top-right corner of the card banner only when the card is selected.
3. **Status Badges**: A "Zoom Session" status tag/badge is rendered clearly within the card layout (e.g. badge inside the banner or card body).
4. **Zero Collateral Layout Shifts**: The cards preserve exact grid alignments and do not shift or jump in pixel dimensions when switching states.
5. **No Regressions**: Standard registration logic (meeting ID selection/validation) remains intact.

---

## Tech Stack
- **Styling**: Vanilla CSS (CSS3 custom animations, `@keyframes`, custom properties, `conic-gradient`, and pseudo-element masking).
- **Interactions**: Vanilla JavaScript (dynamic card generation, DOM manipulation).

---

## Target Files
- [public/assets/index.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/index.css) (CSS animations, layout styles, and card rules)
- [public/assets/registration.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/registration.js) (Zoom cards DOM renderer)

---

## Phase 1: Analysis & Technical Approach

### 1. Rotating Conic-Gradient Border
To create a clean rotating border of `2px` without shifting layout:
- Set `.zoom-session-card` to `position: relative` and `z-index: 1`. Remove standard border styles or set `border: 2px solid transparent;` to maintain consistent sizing.
- Add a pseudo-element `.zoom-session-card::before` when `.is-selected` is present. This element will:
  - Be centered and sized larger than the card (e.g., `width: 150%; height: 150%; top: -25%; left: -25%;`).
  - Have a `background` with a beautiful `conic-gradient` cycling through primary theme colors (e.g., FAO gold/orange, red, dark grey).
  - Use `animation: spin 4s linear infinite;`.
  - Have `z-index: -2;`.
- Add a pseudo-element `.zoom-session-card::after` when `.is-selected` is present. This acts as a content mask overlay:
  - Sized at `inset: 2px` (matching the desired 2px border thickness).
  - Set `background: var(--color-card)` (or the light selection background).
  - Have `border-radius: calc(var(--radius-md) - 2px)` so it perfectly matches the card's curves.
  - Have `z-index: -1;`.
- Set all other children of `.zoom-session-card` (`.zoom-card-banner`, `.zoom-card-body`) to `position: relative; z-index: 2;` so they display on top of the mask.

### 2. Checkmark/Tick Overlay
- Add a `.zoom-card-tick` indicator inside the `.zoom-card-banner` template.
- Style it using CSS:
  - `position: absolute; top: 12px; right: 12px;`
  - Style as a circular badge (e.g., white background, containing a SVG/Unicode checkmark `✓` or similar).
  - Display it with `opacity: 0; transform: scale(0.8); transition: all 0.2s ease;` by default.
  - Set `opacity: 1; transform: scale(1);` when `.is-selected` is present on the card.

### 3. Status Badges
- Add a badge container like `<div class="zoom-badge">Zoom Session</div>` inside the card body or banner.
- Style it with high-contrast text, matching the FAO base styling colors, with rounded borders and a clean typography weight.

---

## Phase 2: Implementation Steps

### Task 1: Update Card Markup in JavaScript
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`
- **Input**: [public/assets/registration.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/registration.js)
- **Output**: Enhanced HTML template inside the `fetchZoomMeetings()` function containing:
  - A status badge (`.zoom-card-badge`) in the card.
  - A checkmark indicator container (`.zoom-card-tick`) inside the banner.
- **Verify**: Check that the generated DOM elements exist in the card structure.

### Task 2: Create CSS Keyframes and Glow Styles
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Input**: [public/assets/index.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/index.css)
- **Output**:
  - `@keyframes spin` definition.
  - Styling rules for `.zoom-session-card::before` and `::after` when `.is-selected` is active.
  - Z-indexing fixes for card inner components to show above the mask.
- **Verify**: Inspect card styles in the browser to ensure the pseudo-elements exist and are layered correctly.

### Task 3: Style the Badge and Checkmark Elements
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Input**: [public/assets/index.css](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/index.css)
- **Output**: Styles for `.zoom-card-badge` and `.zoom-card-tick` with transition states.
- **Verify**: Visual check of badge rendering and tick animation scaling in when card is selected.

---

## Phase X: Verification Protocol

Before final sign-off, execute the following validation steps:
1. **Visual UX Check**: Start the local preview server (`npm run dev`) and test card selection behavior.
2. **UX Audit Script**: Run the UX checking tool to verify WCAG compliance and design consistency:
   ```bash
   python .agents/skills/frontend-design/scripts/ux_audit.py .
   ```
3. **No Layout Shift Check**: Confirm that card selection/deselection causes zero layout shifts or pixel width changes.
4. **Verification Complete**: Add confirmation marker below.

---

## Done When
- [ ] Rotating conic-gradient border glow renders smoothly on selection without shifting dimensions.
- [ ] "Zoom Session" status badge is visible on all Zoom cards.
- [ ] Tick indicator transitions in and out on select/deselect.
- [ ] Registration form validation continues working correctly with the selected meetings.
