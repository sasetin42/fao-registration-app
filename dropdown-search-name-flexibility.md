# Dropdown Search Name Flexibility Plan

## Goal
Modify the dropdown search widget for the name dropdown (`#completeName`) to support multi-word split matching and display a customized search placeholder for a more flexible user search experience.

## Affected Files
- [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js)
- [dropdown-threshold.test.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/tests/dropdown-threshold.test.js)

## Tasks
- [ ] **Task 1: Customize Search Placeholder**
  Modify [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js) where the search `input` element is created. Check if `select.id === "completeName"` and set the placeholder to `"Search by Name, First name or Last name..."`, defaulting to `"Search..."` for other dropdowns.
  *Verify*: Inspect the search input element when opening the `#completeName` dropdown.

- [ ] **Task 2: Implement Split-Word Matching**
  Update the search input filtering listener in [dropdown.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/public/assets/dropdown.js).
  - Split the trimmed lowercase search query by whitespace into individual words.
  - Filter out any empty strings from the resulting array.
  - Use `Array.prototype.every` to check that each word is present in the lowercase option text.
  *Verify*: Typing a query like `"Joanah Natoza"` correctly matches option `"Ms. Joanah Mae M. Natoza"`.

- [ ] **Task 3: Update Test Coverage**
  Add unit tests in [dropdown-threshold.test.js](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/FAO%20EVENT%20REGISTRATION/FAO%20REG%20APP/tests/dropdown-threshold.test.js) to assert that:
  - Custom placeholders are set correctly for `#completeName`.
  - Split-word queries (e.g. `"Joanah Natoza"`) successfully match options containing the words in a different order or with middle names present (e.g. `"Ms. Joanah Mae M. Natoza"`).
  *Verify*: Run the tests using `node --test tests/dropdown-threshold.test.js` and ensure all tests pass.

## Done When
- [ ] Custom search placeholder for the name dropdown is implemented.
- [ ] Search input filtering matches options when all query words are present, regardless of their order or middle names.
- [ ] Tests verify both conditions successfully.
