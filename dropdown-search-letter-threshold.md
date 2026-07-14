# Implementation Plan: Dropdown Search Letter Threshold

Introduce a minimum character threshold (2 characters) to the search input event listener in the custom dropdown widget. This prevents search-filtering from triggering immediately on a single keypress, displaying all options initially and only showing filtered suggestions once the user has entered at least 2 characters.

## Goal
Modify the custom dropdown search logic in [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js) so that searching/filtering only begins when the input length is at least 2 characters.

## Tasks

- [ ] **Task 1: Update Search Event Listener in `dropdown.js`**
  - Inspect the input query length in the `input` event listener under `initCustomDropdowns()`.
  - If `query.length < 2`, show all custom option elements (reset `style.display = ""` and clear `is-highlighted`).
  - If `query.length >= 2`, perform standard text matching and display only matched options.
  - Verify that the first visible element is highlighted and the "No results found" container is hidden/shown appropriately.
  - *File to edit:* [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js) (lines 364-384)

- [ ] **Task 2: Manual Verification**
  - Run the application dev server.
  - Open the page containing a custom dropdown with search enabled (e.g., event registration page).
  - Open the dropdown and verify that typing 1 character keeps all options visible.
  - Verify that typing 2 or more characters filters the list correctly.
  - Verify that clearing the search input (0 or 1 character remaining) restores the full options list.

## Done When
- The custom dropdown option list does not filter options when the search input has fewer than 2 characters.
- The list successfully filters options once the query length is 2 or more characters.
