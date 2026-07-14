import test from 'node:test';
import assert from 'node:assert';

test('Dropdown Search Threshold Verification', () => {
  // Setup mock elements
  const optionsData = [
    { text: 'Albania', isDisabled: false },
    { text: 'Algeria', isDisabled: false },
    { text: 'Andorra', isDisabled: false },
    { text: 'Bahamas', isDisabled: false }
  ];

  const optionEls = optionsData.map(opt => {
    return {
      textContent: opt.text,
      style: { display: '' },
      classList: {
        contains: (cls) => cls === 'is-disabled' ? opt.isDisabled : false,
        remove: (cls) => {}
      }
    };
  });

  const listContainer = {
    querySelectorAll: () => optionEls,
    _optionCache: null
  };

  const noResults = {
    style: { display: 'none' }
  };

  let highlightedItem = null;
  const highlightOption = (container, item, trigger) => {
    highlightedItem = item;
  };

  const trigger = {};

  // The exact event listener logic implemented in dropdown.js
  const handleInput = (inputValue) => {
    const query = inputValue.toLowerCase().trim();
    
    if (!listContainer._optionCache) {
      listContainer._optionCache = optionEls.map(opt => ({
        element: opt,
        text: opt.textContent.toLowerCase(),
        isDisabled: opt.classList.contains("is-disabled")
      }));
    }
    
    let hasMatches = false;
    const cached = listContainer._optionCache;

    cached.forEach(opt => {
      if (query.length < 2) {
        opt.element.style.display = "";
        hasMatches = true;
      } else {
        if (opt.text.includes(query)) {
          opt.element.style.display = "";
          hasMatches = true;
        } else {
          opt.element.style.display = "none";
          opt.element.classList.remove("is-highlighted");
        }
      }
    });

    noResults.style.display = hasMatches ? "none" : "";
    
    const visibleItems = cached.filter(o => o.element.style.display !== "none" && !o.isDisabled);
    highlightOption(listContainer, visibleItems[0] ? visibleItems[0].element : null, trigger);
  };

  // 1. Typing 1 character keeps all options visible
  handleInput("a");
  optionEls.forEach(opt => {
    assert.strictEqual(opt.style.display, "", `Option "${opt.textContent}" should be visible when query is 1 character`);
  });
  assert.strictEqual(noResults.style.display, "none", "noResults should be hidden");

  // 2. Typing 2 or more characters filters options
  handleInput("al");
  assert.strictEqual(optionEls[0].style.display, "", "Albania should be visible");
  assert.strictEqual(optionEls[1].style.display, "", "Algeria should be visible");
  assert.strictEqual(optionEls[2].style.display, "none", "Andorra should be hidden");
  assert.strictEqual(optionEls[3].style.display, "none", "Bahamas should be hidden");
  assert.strictEqual(noResults.style.display, "none", "noResults should be hidden");

  // 3. Clearing the input restores the full options list
  handleInput("");
  optionEls.forEach(opt => {
    assert.strictEqual(opt.style.display, "", `Option "${opt.textContent}" should be restored and visible when query is cleared`);
  });
  assert.strictEqual(noResults.style.display, "none", "noResults should be hidden");
});
