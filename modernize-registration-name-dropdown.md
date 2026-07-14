# Modernize Registration Name Dropdown Implementation Plan

## Goal
Enhance the registration name select dropdown (`#completeName`) to adopt the modern custom design system, support smooth interactions, add a custom avatar icon, dynamically update options, and capitalize names to Title Case instead of all-caps.

## Affected Files
1. **HTML:** [registration.html](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/pages/registration.html)
2. **Custom Dropdown Script:** [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js)
3. **Registration Page Script:** [registration.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/registration.js)

---

## Tasks

- [ ] **Task 1: Update Dropdown Styling & Placeholders in HTML**
  - **Action:** 
    - Change class of `#completeName` `<select>` from `form-input` to `form-select` in `registration.html` (to trigger custom select wrapper generation).
    - Update the label text "SELECT YOUR NAME" to "Select Your Name" (Title Case).
    - Update the default placeholder option `<option value="" disabled selected>SELECT YOUR NAME</option>` to use "Select Your Name".
  - **Verify:** Verify that `#completeName` element in `registration.html` has class `form-select` and text elements are capitalized.

- [ ] **Task 2: Map User Avatar Icon in Custom Dropdown Builder**
  - **Action:** 
    - Edit `getOptionIcon` in `dropdown.js` to add a handler for `selectId === "completeName"`.
    - Return config: `bgColor = "#E8EAF6"`, `iconColor = "#3F51B5"`, and `svgPath = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'` (standard user avatar SVG).
  - **Verify:** Check that calling `getOptionIcon("completeName", ...)` returns the correct avatar styling object.

- [ ] **Task 3: Implement Dynamic MutationObserver in Custom Dropdowns**
  - **Action:**
    - Refactor `initCustomDropdowns` in `dropdown.js` to handle dynamic option updates.
    - Update the `MutationObserver` on the select elements to observe `childList: true`.
    - When mutations occur, clear old custom option nodes inside the custom wrapper's dropdown list, re-populate the list elements based on the new native `<option>` tags, and re-bind event listeners.
  - **Verify:** Dynamically adding option elements to a `.form-select` updates the custom UI dropdown list items instantly.

- [ ] **Task 4: Update Member Name Formatting to Title Case**
  - **Action:**
    - Add a helper function `toTitleCase(str)` in `registration.js` that converts names from uppercase to Title Case (e.g. `"Mr. S .M. Ataur Rahman"`).
    - In `fetchAndPopulateMembers()`, convert `member.full_name` to Title Case when populating the dropdown options' value and textContent.
  - **Verify:** Verify that names loaded from `/v1/members` are capitalized properly in the custom dropdown instead of being in all-caps.

- [ ] **Task 5: Verify & Run UX Checks**
  - **Action:** Load the page, check dropdown click behavior, visual styling, icon alignment, and run `ux_audit.py` to ensure it complies with modern UI design guidelines.
  - **Verify:** Dropdown displays smoothly, contains user avatar icon, and is fully functional.
