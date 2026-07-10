# Implementation Plan: Registration UI Simplification

This document details the step-by-step implementation plan to simplify the main registration page layout to focus exclusively on **Zoom Meeting Sessions** registration.

---

## Goal
Simplify `registration.html` to keep only the Complete Name, Email, Phone Number, Zoom Meeting Session Cards, Data Privacy Notice checkbox, and the Confirm Registration button. Remove all other fields and style the Zoom sessions list as a card layout grid instead of a dropdown.

---

## Project Type
- **WEB** (Frontend HTML/CSS/JS + Backend Integration)

---

## Success Criteria
- The page shows only: Complete Name, Email Address, Phone Number, Zoom Meeting Sessions cards grid, Data Privacy Notice checkbox, and the Confirm Registration button.
- The main title is changed to "Zoom Meeting Sessions" and description explains selecting events for Zoom.
- Zoom sessions are rendered dynamically as a card layout list (with topic, display name, banner image, and a checkbox).
- Multiple selected Zoom sessions are mapped to a comma-separated list of meeting IDs (e.g. `123,456`) and submitted via POST `/v1/register` alongside `attendance_mode: "online"`.
- Form validation restricts submission if any mandatory field (Complete Name, Email, Phone, at least one selected Zoom session card, and Privacy Notice checkbox) is missing or invalid.

---

## Component Modifications

### 1. Style Integration (`public/assets/index.css`)
We need to design a responsive card grid for the Zoom Meeting Sessions:
- Define `.zoom-cards-grid` as a CSS grid layout:
  ```css
  .zoom-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 16px;
    margin-bottom: 24px;
  }
  ```
- Define `.zoom-session-card` as a clickable, interactive card with hover effects:
  - White background (or matching theme), border radius, shadow, transition.
  - Hover states: Subtle translation up (`translateY(-4px)`), custom shadow, and border color change.
  - Selected state: Active border color (`var(--color-primary)`) and subtle background highlight.
- Style subcomponents inside the card:
  - Banner image: `.zoom-card-banner` (fixed height, cover position, rounded top).
  - Info section: `.zoom-card-body` (padding, flexible spacing).
  - Title and Session details: `.zoom-card-title`, `.zoom-card-meta`.
  - Checkbox: A styling container mapping the checkbox state to the card visual state.

### 2. Page Structure Modifications (`public/pages/registration.html`)
- Update document `<title>` to "Zoom Meeting Sessions Registration".
- In `<aside class="split-sidebar">`, update heading/theme/dates as necessary to match the virtual/online focus.
- In `<main class="split-content">`:
  - Change `.registration-card__title` to "Zoom Meeting Sessions".
  - Change `.registration-card__desc` to "Select the Zoom meeting sessions you wish to attend and complete your registration."
- In `<form id="registrationForm">`:
  - Keep/rename fields:
    - Complete Name: Single `<input type="text" id="completeName" name="completeName" ... />`.
    - Email Address: `<input type="email" id="email" ... />`.
    - Confirm Email: Remove or update to match simplicity. (We will keep it simplified under email input or keep a basic validator if required).
    - Phone Number: `<input type="tel" id="phone" ... />`.
  - Remove all extra fields:
    - Remove/hide `registrationType` select.
    - Remove/hide speaker types, media sections, attendance mode radio buttons, attendance days checkboxes, prefix, first name, middle initial, last name, suffix, age range, gender, nationality, affiliation group, address country/state/street/city/zip, visa assistance, dietary preferences, and field trip group.
  - Replace the Zoom dropdown select with:
    - A dedicated container `<div class="zoom-cards-grid" id="zoomSessionsContainer"></div>` and a hidden input `<input type="hidden" id="zoomMeetingId" name="zoomMeetingId" />`.
  - Keep the Data Privacy Notice checkbox and CTA button container.

### 3. JavaScript Logic Updates (`public/assets/registration.js`)
- **Initialization**:
  - Remove reference to removed inputs (prefix, speakerType, ageRange, gender, nationality, affiliation, etc.).
- **Complete Name Parsing**:
  - Since the backend expects `first_name` and `last_name`, split the `completeName` input:
    ```javascript
    const nameParts = completeNameEl.value.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "Registrant";
    ```
- **Dynamic Session Card Loader**:
  - Update `fetchZoomMeetings()` to construct and append cards using the new `.zoom-session-card` markup layout (instead of dropdown items).
  - Update checked event listener of card checkboxes to toggle a `.is-selected` class on the parent card element and update the hidden `#zoomMeetingId` input with a comma-separated string of selected IDs.
- **Form Validation**:
  - Simplify the validation rules to check only:
    - Name (minimum length of 2 characters).
    - Email address pattern.
    - Phone number validation (`iti.isValidNumber()`).
    - At least one Zoom session selected (`#zoomMeetingId` is not empty).
    - Terms & conditions checkbox checked.
- **Payload Submission**:
  - Set hardcoded/default values for backend-required fields:
    - `attendance_mode = "online"`
    - `registration_type = "participant"`
    - `first_name` and `last_name` parsed from Complete Name.
    - `full_name` as the raw value of Complete Name.
    - `attendance_days = ""` (or a placeholder if required).
    - Set defaults or null for all other removed columns (dietary, visa_assistance, address_country, affiliation, age_range, gender, nationality).

---

## Tasks

- [ ] **Task 1**: Update `public/assets/index.css` with grid and card layout styling for Zoom meeting session cards.
  - *Verify*: Check index.css has the new classes and clean grid/card rules.
- [ ] **Task 2**: Modify `public/pages/registration.html` to simplify layout, change header titles/description, remove extra fields, and add `#zoomSessionsContainer` card grid.
  - *Verify*: Open registration.html, confirm the visual layout has only Name, Email, Phone, Zoom card container, T&C check, and the submit button.
- [ ] **Task 3**: Update `public/assets/registration.js` to dynamically load Zoom meetings into the card grid, parse "Complete Name" into first/last names, validate simplified fields, and format payload for `/v1/register`.
  - *Verify*: Ensure the client-side validation logic works, selected meeting IDs are saved as comma-separated values, and defaults are mapped to the submit event payload.

---

## Phase X: Verification Criteria
1. **Lint and Syntax Check**: Run linting on modified HTML and JS files.
2. **Visual Audit**: Verify the registration page renders the cards in a grid layout (not a dropdown) on different screen sizes.
3. **Form Validation Test**: Verify that trying to submit without Name, Email, Phone, selected card, or T&C checkbox fails with proper error indicators.
4. **Registration Integration Test**: Register a user with multiple Zoom cards selected. Verify a `POST /v1/register` request is fired containing the correct fields and that it redirects to the confirmation page.
