import test from 'node:test';
import assert from 'node:assert';

test('Dropdown Name Search & Fields Update Logic Verification', () => {
  // 1. Setup sample members with middle names, different casings
  const members = [
    { full_name: 'Joanah Mae M. Natoza', email: 'joanah.natoza@example.com', phone: '+639123456789' },
    { full_name: 'John Paul Smith', email: 'john.smith@example.com', phone: '+12025550143' },
    { full_name: 'Maria Clara Santos', email: 'maria.clara@example.com', phone: '+639876543210' }
  ];

  // 2. Mock option elements mirroring native HTML select options populated from database
  const selectOptions = [
    { value: '', textContent: 'Select a name...', dataset: {} },
    ...members.map(member => ({
      value: member.full_name,
      textContent: member.full_name,
      dataset: {
        email: member.email,
        phone: member.phone
      }
    }))
  ];

  // Mock native select element
  const completeNameSelect = {
    id: 'completeName',
    options: selectOptions,
    selectedIndex: 0,
    listeners: {},
    addEventListener(event, callback) {
      this.listeners[event] = callback;
    },
    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type]();
      }
    }
  };

  // Mock other target inputs
  const emailInput = { value: '' };
  const phoneInput = {
    value: '',
    classList: {
      toggle(cls, condition) {
        this[cls] = condition;
      }
    }
  };

  // Mock global/scoped variables used in registration.js
  let setNumberCalledWith = null;
  const iti = {
    setNumber(number) {
      setNumberCalledWith = number;
    }
  };

  // Bind the change listener logic to the select
  completeNameSelect.addEventListener('change', () => {
    const selectedOption = completeNameSelect.options[completeNameSelect.selectedIndex];
    if (selectedOption && selectedOption.value !== '') {
      const email = selectedOption.dataset.email || '';
      const phone = selectedOption.dataset.phone || '';

      emailInput.value = email;

      if (phone) {
        iti.setNumber(phone);
      }
    }
  });

  // 3. Mock the custom dropdown option list container and cache
  const customOptions = selectOptions.map(opt => ({
    textContent: opt.textContent,
    style: { display: '' },
    classList: {
      contains: (cls) => false,
      remove: (cls) => {}
    }
  }));

  const listContainer = {
    _optionCache: customOptions.map(opt => ({
      element: opt,
      text: opt.textContent.toLowerCase(),
      isDisabled: false
    }))
  };

  // Search filter implementation matching dropdown.js (split-word & case-insensitive matching)
  const handleSearch = (inputValue) => {
    const query = inputValue.toLowerCase().trim();
    const words = query.split(/\s+/).filter(w => w.length > 0);
    const cached = listContainer._optionCache;
    let hasMatches = false;

    cached.forEach(opt => {
      if (query.length < 2) {
        opt.element.style.display = '';
        hasMatches = true;
      } else {
        const match = words.every(word => opt.text.includes(word));
        if (match) {
          opt.element.style.display = '';
          hasMatches = true;
        } else {
          opt.element.style.display = 'none';
        }
      }
    });
    return hasMatches;
  };

  // Test Case A: Search by first name ("Joanah")
  let matchFound = handleSearch('Joanah');
  assert.strictEqual(matchFound, true);
  assert.strictEqual(customOptions[1].style.display, '', 'Joanah Mae M. Natoza should match');
  assert.strictEqual(customOptions[2].style.display, 'none', 'John Paul Smith should not match');
  assert.strictEqual(customOptions[3].style.display, 'none', 'Maria Clara Santos should not match');

  // Test Case B: Search by last name ("Natoza")
  handleSearch('Natoza');
  assert.strictEqual(customOptions[1].style.display, '', 'Joanah Mae M. Natoza should match');
  assert.strictEqual(customOptions[2].style.display, 'none', 'John Paul Smith should not match');

  // Test Case C: Search by combined first+last name containing middle name ("Joanah Natoza")
  handleSearch('Joanah Natoza');
  assert.strictEqual(customOptions[1].style.display, '', 'Joanah Mae M. Natoza should match "Joanah Natoza"');
  assert.strictEqual(customOptions[2].style.display, 'none', 'John Paul Smith should not match');

  // Test Case D: Search by out-of-order words ("Natoza Joanah")
  handleSearch('Natoza Joanah');
  assert.strictEqual(customOptions[1].style.display, '', 'Joanah Mae M. Natoza should match out-of-order query "Natoza Joanah"');
  assert.strictEqual(customOptions[2].style.display, 'none', 'John Paul Smith should not match');

  // Test Case E: Verify selecting a name updates email and phone fields correctly
  // Select "Joanah Mae M. Natoza" (index 1)
  completeNameSelect.selectedIndex = 1;
  completeNameSelect.dispatchEvent({ type: 'change' });

  assert.strictEqual(emailInput.value, 'joanah.natoza@example.com', 'Email input should update with correct email address');
  assert.strictEqual(setNumberCalledWith, '+639123456789', 'Phone input should update with correct phone number');

  // Select "John Paul Smith" (index 2)
  completeNameSelect.selectedIndex = 2;
  completeNameSelect.dispatchEvent({ type: 'change' });

  assert.strictEqual(emailInput.value, 'john.smith@example.com', 'Email input should update with John\'s email');
  assert.strictEqual(setNumberCalledWith, '+12025550143', 'Phone input should update with John\'s phone');
});
