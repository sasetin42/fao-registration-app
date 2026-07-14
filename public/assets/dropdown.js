const countryToIso = {
  "afghanistan": "af", "albania": "al", "algeria": "dz", "andorra": "ad", "angola": "ao", "antigua-and-barbuda": "ag", "argentina": "ar", "armenia": "am", "australia": "au", "austria": "at", "azerbaijan": "az",
  "bahamas": "bs", "bahrain": "bh", "bangladesh": "bd", "barbados": "bb", "belarus": "by", "belgium": "be", "belize": "bz", "benin": "bj", "bhutan": "bt", "bolivia": "bo", "bosnia-and-herzegovina": "ba", "botswana": "bw", "brazil": "br", "brunei": "bn", "bulgaria": "bg", "burkina-faso": "bf", "burundi": "bi",
  "cabo-verde": "cv", "cambodia": "kh", "cameroon": "cm", "canada": "ca", "central-african-republic": "cf", "chad": "td", "chile": "cl", "china": "cn", "colombia": "co", "comoros": "km", "congo": "cg", "costa-rica": "cr", "croatia": "hr", "cuba": "cu", "cyprus": "cy", "czech-republic": "cz",
  "denmark": "dk", "djibouti": "dj", "dominica": "dm", "dominican-republic": "do",
  "ecuador": "ec", "egypt": "eg", "el-salvador": "sv", "equatorial-guinea": "gq", "eritrea": "er", "estonia": "ee", "eswatini": "sz", "ethiopia": "et",
  "fiji": "fj", "finland": "fi", "france": "fr",
  "gabon": "ga", "gambia": "gm", "georgia": "ge", "germany": "de", "ghana": "gh", "greece": "gr", "grenada": "gd", "guatemala": "gt", "guinea": "gn", "guinea-bissau": "gw", "guyana": "gy",
  "haiti": "ht", "honduras": "hn", "hungary": "hu",
  "iceland": "is", "india": "in", "indonesia": "id", "iran": "ir", "iraq": "iq", "ireland": "ie", "israel": "il", "italy": "it", "ivory-coast": "ci",
  "jamaica": "jm", "japan": "jp", "jordan": "jo",
  "kazakhstan": "kz", "kenya": "ke", "kiribati": "ki", "kuwait": "kw", "kyrgyzstan": "kg",
  "laos": "la", "latvia": "lv", "lebanon": "lb", "lesotho": "ls", "liberia": "lr", "libya": "ly", "liechtenstein": "li", "lithuania": "lt", "luxembourg": "lu",
  "madagascar": "mg", "malawi": "mw", "malaysia": "my", "maldives": "mv", "mali": "ml", "malta": "mt", "marshall-islands": "mh", "mauritania": "mr", "mauritius": "mu", "mexico": "mx", "micronesia": "fm", "moldova": "md", "monaco": "mc", "mongolia": "mn", "montenegro": "me", "morocco": "ma", "mozambique": "mz", "myanmar": "mm",
  "namibia": "na", "nauru": "nr", "nepal": "np", "netherlands": "nl", "new-zealand": "nz", "nicaragua": "ni", "niger": "ne", "nigeria": "ng", "north-korea": "kp", "north-macedonian": "mk", "north-macedonia": "mk", "norway": "no",
  "oman": "om",
  "pakistan": "pk", "palau": "pw", "palestine": "ps", "panama": "pa", "papua-new-guinea": "pg", "paraguay": "py", "peru": "pe", "philippines": "ph", "poland": "pl", "portuguese": "pt", "portugal": "pt",
  "qatar": "qa",
  "romanian": "ro", "romania": "ro", "russia": "ru", "rwanda": "rw",
  "saint-kitts-and-nevis": "kn", "saint-lucia": "lc", "saint-vincent-and-the-grenadines": "vc", "samoa": "ws", "san-marino": "sm", "sao-tome-and-principe": "st", "saudi-arabia": "sa", "senegal": "sn", "serbia": "rs", "seychelles": "sc", "sierra-leone": "sl", "singapore": "sg", "slovakia": "sk", "slovenia": "si", "solomon-islands": "sb", "somalia": "so", "south-africa": "za", "south-korean": "kr", "south-korea": "kr", "south-sudan": "ss", "spanish": "es", "spain": "es", "sri-lanka": "lk", "sudan": "sd", "suriname": "sr", "sweden": "se", "switzerland": "ch", "syria": "sy",
  "taiwan": "tw", "tajikistan": "tj", "tanzania": "tz", "thailand": "th", "timor-leste": "tl", "togo": "tg", "tonga": "to", "trinidad-and-tobago": "tt", "tunisia": "tn", "turkey": "tr", "turkmenistan": "tm", "tuvalu": "tv",
  "uganda": "ug", "ukraine": "ua", "united-arab-emirates": "ae", "united-kingdom": "gb", "united-states": "us", "uruguay": "uy", "uzbekistan": "uz",
  "vanuatu": "vu", "venezuela": "ve", "vietnam": "vn",
  "yemen": "ye",
  "zambia": "zm", "zimbabwe": "zw"
};

document.addEventListener("DOMContentLoaded", () => {
  // Use a slight delay or observer to ensure dynamic selects (like countryOptions) are loaded first
  setTimeout(() => {
    initCustomDropdowns();
  }, 100);
});

function getOptionIcon(selectId, value, text) {
  if (!value) return null;
  const val = value.toLowerCase();
  let bgColor = "#E8F4F8";
  let iconColor = "#116AAB";
  let svgPath = "";
  
  if (selectId === "completeName") {
    bgColor = "#E8EAF6";
    iconColor = "#3F51B5";
    svgPath = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
  }
  else if (selectId === "registrationType") {
    switch (val) {
      case "participant":
        bgColor = "#E0F2F1"; iconColor = "#00695C";
        svgPath = `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`;
        break;
      case "speaker":
        bgColor = "#E8EAF6"; iconColor = "#1A237E";
        svgPath = `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`;
        break;
      case "moderator":
        bgColor = "#F3E5F5"; iconColor = "#4A148C";
        svgPath = `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`;
        break;
      case "exhibitor":
        bgColor = "#FFF3E0"; iconColor = "#E65100";
        svgPath = `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="22" width="6" height="12"/>`;
        break;
      case "media":
        bgColor = "#FFEBEE"; iconColor = "#B71C1C";
        svgPath = `<path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z"/>`;
        break;
      case "working-committee":
        bgColor = "#FFFDE7"; iconColor = "#F57F17";
        svgPath = `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`;
        break;
    }
  }
  else if (selectId === "speakerType") {
    switch (val) {
      case "plenary-speaker":
        bgColor = "#F3E5F5"; iconColor = "#7B1FA2";
        svgPath = `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`;
        break;
      case "poster-presenter":
        bgColor = "#E3F2FD"; iconColor = "#1565C0";
        svgPath = `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7l7 5-7 5z"/>`;
        break;
      case "paper-presenter":
        bgColor = "#E8F5E9"; iconColor = "#2E7D32";
        svgPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`;
        break;
    }
  }
  else if (selectId === "prefix") {
    switch (val) {
      case "mr":
        bgColor = "#E3F2FD"; iconColor = "#1565C0";
        svgPath = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;
        break;
      case "mrs":
      case "ms":
        bgColor = "#FCE4EC"; iconColor = "#C2185B";
        svgPath = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;
        break;
      case "dr":
      case "prof":
        bgColor = "#E0F2F1"; iconColor = "#00796B";
        svgPath = `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>`;
        break;
      default:
        bgColor = "#FFF3E0"; iconColor = "#E65100";
        svgPath = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`;
        break;
    }
  }
  else if (selectId === "ageRange") {
    switch (val) {
      case "18-35":
        bgColor = "#E8F8F5"; iconColor = "#117A65";
        svgPath = `<path d="M12 22V12m0 0c-2-2-4-2-6-2s-4 2-4 2c0 0 2 2 4 2s4-2 6-2z"/>`;
        break;
      case "36-45":
        bgColor = "#EAF2F8"; iconColor = "#2471A3";
        svgPath = `<path d="M12 22V12m0 0c2-2 4-2 6-2s4 2 4 2c0 0-2 2-4 2s-4-2-6-2z"/>`;
        break;
      case "46-59":
        bgColor = "#E8EAF6"; iconColor = "#3F51B5";
        svgPath = `<path d="M12 2L2 22h20L12 2z"/>`;
        break;
      case "60-above":
        bgColor = "#FFF3E0"; iconColor = "#E65100";
        svgPath = `<path d="M12 22v-9m0-4V3m-4 8v-2m8 2v-2"/>`;
        break;
    }
  }
  else if (selectId === "gender") {
    switch (val) {
      case "male":
        bgColor = "#E3F2FD"; iconColor = "#1565C0";
        svgPath = `<circle cx="10" cy="14" r="6"/><path d="M14 10l6-6M20 4h-4M20 4v4"/>`;
        break;
      case "female":
        bgColor = "#FCE4EC"; iconColor = "#C2185B";
        svgPath = `<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 18h6"/>`;
        break;
      default:
        bgColor = "#ECEFF1"; iconColor = "#546E7A";
        svgPath = `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>`;
        break;
    }
  }
  else if (selectId === "affiliation") {
    switch (val) {
      case "government":
        bgColor = "#E3F2FD"; iconColor = "#0D47A1";
        svgPath = `<path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18M18 10h-4M18 14h-4M10 10H6M10 14H6M14 6h-4"/>`;
        break;
      case "academe":
        bgColor = "#FFEBEE"; iconColor = "#C62828";
        svgPath = `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>`;
        break;
      case "non-government-organization":
        bgColor = "#E8F5E9"; iconColor = "#2E7D32";
        svgPath = `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`;
        break;
      case "private-industries":
        bgColor = "#E8EAF6"; iconColor = "#283593";
        svgPath = `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`;
        break;
      case "farmers-organization":
        bgColor = "#FFF3E0"; iconColor = "#E65100";
        svgPath = `<path d="M12 22V12m0 0c-2-2-4-2-6-2s-4 2-4 2c0 0 2 2 4 2s4-2 6-2zm0 0c2-2 4-2 6-2s4 2 4 2c0 0-2 2-4 2s-4-2-6-2z"/>`;
        break;
      case "international-organization":
        bgColor = "#E0F2F1"; iconColor = "#004D40";
        svgPath = `<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>`;
        break;
    }
  }
  else if (selectId === "dietary") {
    switch (val) {
      case "no-restriction":
        bgColor = "#E3F2FD"; iconColor = "#1565C0";
        svgPath = `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`;
        break;
      case "vegetarian":
      case "vegan":
        bgColor = "#E8F5E9"; iconColor = "#2E7D32";
        svgPath = `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"/>`;
        break;
      case "halal":
        bgColor = "#FFF3E0"; iconColor = "#E65100";
        svgPath = `<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/>`;
        break;
      case "with-allergy":
        bgColor = "#FFEBEE"; iconColor = "#C62828";
        svgPath = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`;
        break;
      default:
        bgColor = "#ECEFF1"; iconColor = "#546E7A";
        svgPath = `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>`;
        break;
    }
  }
  else if (selectId === "nationality") {
    bgColor = "#E0F7FA"; iconColor = "#00838F";
    svgPath = `<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>`;
  }
  else {
    bgColor = "#F4F6F7"; iconColor = "#7F8C8D";
    svgPath = `<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>`;
  }
  
  return { bgColor, iconColor, svgPath };
}

function buildCustomOptionsList(select, listContainer, trigger, wrapper, menu, isCountrySelect, noResults) {
  // Remove existing custom options
  const existingOptions = listContainer.querySelectorAll(".custom-select-option");
  existingOptions.forEach(opt => opt.remove());

  // Invalidate cached options
  listContainer._optionCache = null;

  const options = Array.from(select.options);
  options.forEach((option, index) => {
    const customOption = document.createElement("div");
    customOption.className = "custom-select-option";
    customOption.setAttribute("role", "option");
    customOption.setAttribute("data-value", option.value);
    if (select.id) {
      customOption.id = `${select.id}-opt-${index}`;
    }
    
    // Set Option Content (with Flag or custom icon if applicable)
    if (isCountrySelect && option.value && countryToIso[option.value]) {
      const iso = countryToIso[option.value];
      const flagImg = document.createElement("img");
      flagImg.src = `https://flagcdn.com/w20/${iso}.png`;
      flagImg.srcset = `https://flagcdn.com/w40/${iso}.png 2x`;
      flagImg.width = 20;
      flagImg.height = 15;
      flagImg.alt = "";
      flagImg.className = "country-flag-icon";
      customOption.appendChild(flagImg);
      customOption.appendChild(document.createTextNode(" " + option.textContent));
    } else {
      const iconData = getOptionIcon(select.id, option.value, option.textContent);
      if (iconData) {
        const iconEl = document.createElement("i");
        iconEl.className = "session-icon";
        iconEl.style.backgroundColor = iconData.bgColor;
        iconEl.style.color = iconData.iconColor;
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconData.svgPath}</svg>`;
        customOption.appendChild(iconEl);
        customOption.appendChild(document.createTextNode(" " + option.textContent));
      } else {
        customOption.textContent = option.textContent;
      }
    }
    
    if (option.disabled) {
      customOption.classList.add("is-disabled");
      customOption.setAttribute("aria-disabled", "true");
    }

    if (option.selected) {
      customOption.classList.add("is-selected");
      customOption.setAttribute("aria-selected", "true");
    }

    customOption.addEventListener("click", (e) => {
      e.stopPropagation();
      if (option.disabled) return;
      selectOption(select, index, trigger, wrapper, menu, isCountrySelect);
    });

    if (noResults && noResults.parentNode === listContainer) {
      listContainer.insertBefore(customOption, noResults);
    } else {
      listContainer.appendChild(customOption);
    }
  });
}

function getOptionCache(listContainer) {
  if (!listContainer._optionCache) {
    listContainer._optionCache = Array.from(listContainer.querySelectorAll(".custom-select-option")).map(opt => ({
      element: opt,
      text: opt.textContent.toLowerCase(),
      isDisabled: opt.classList.contains("is-disabled")
    }));
  }
  return listContainer._optionCache;
}

function initCustomDropdowns() {
  const selects = document.querySelectorAll("select.form-select");

  selects.forEach(select => {
    if (select.dataset.customDropdownInitialized) return;
    select.dataset.customDropdownInitialized = "true";

    const isCountrySelect = select.id === "addrCountry";

    // 1. Create Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";
    if (select.className.includes("is-error")) wrapper.classList.add("is-error");
    if (select.className.includes("is-valid")) wrapper.classList.add("is-valid");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    select.classList.add("custom-select-hidden");

    // 2. Create Trigger
    const isCompleteName = select.id === "completeName";
    let trigger;
    if (isCompleteName) {
      trigger = document.createElement("input");
      trigger.type = "text";
      trigger.autocomplete = "off";
      trigger.spellcheck = false;
    } else {
      trigger = document.createElement("button");
      trigger.type = "button";
    }
    trigger.className = "custom-select-trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    
    // Set initial trigger content (checking for flags)
    const selectedOption = select.options[select.selectedIndex];
    updateTriggerContent(trigger, selectedOption, isCountrySelect, select.id);
    
    wrapper.appendChild(trigger);

    // 3. Create Custom Options Menu
    const menu = document.createElement("div");
    menu.className = "custom-select-options";
    
    // Add Search Input if options count is > 5 (and not completeName, which is a search input itself)
    const showSearch = !isCompleteName && select.options.length > 5;
    let searchInput = null;
    let listContainer = menu;

    if (showSearch) {
      const searchContainer = document.createElement("div");
      searchContainer.className = "custom-select-search-container";
      
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "custom-select-search";
      searchInput.placeholder = "Search...";
      searchInput.setAttribute("aria-label", "Search options");
      
      searchContainer.appendChild(searchInput);
      menu.appendChild(searchContainer);
      
      listContainer = document.createElement("div");
      listContainer.className = "custom-select-options-list";
      listContainer.setAttribute("role", "listbox");
      listContainer.id = select.id ? `${select.id}-custom-menu` : "";
      menu.appendChild(listContainer);
    } else {
      menu.setAttribute("role", "listbox");
      menu.id = select.id ? `${select.id}-custom-menu` : "";
    }
    
    if (listContainer.id) {
      trigger.setAttribute("aria-controls", listContainer.id);
    }

    // Create "No Results" message element
    const noResults = document.createElement("div");
    noResults.className = "custom-select-no-results";
    noResults.textContent = "No results found";
    noResults.style.display = "none";
    listContainer.appendChild(noResults);

    // Populate Menu Options
    buildCustomOptionsList(select, listContainer, trigger, wrapper, menu, isCountrySelect, noResults);

    wrapper.appendChild(menu);

    // Search Input Filtering Listener
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        const query = value.trim();
        
        const cached = getOptionCache(listContainer);
        let hasMatches = false;

        if (query.length < 2) {
          cached.forEach(opt => {
            opt.element.style.display = "";
          });
          hasMatches = true;
        } else {
          const hasMultipleWords = query.includes(" ");
          const words = hasMultipleWords ? query.split(/\s+/) : null;

          cached.forEach(opt => {
            const match = hasMultipleWords
              ? words.every(word => opt.text.includes(word))
              : opt.text.includes(query);

            if (match) {
              opt.element.style.display = "";
              hasMatches = true;
            } else {
              opt.element.style.display = "none";
              opt.element.classList.remove("is-highlighted");
            }
          });
        }

        noResults.style.display = hasMatches ? "none" : "";
        
        const firstVisible = cached.find(o => o.element.style.display !== "none" && !o.isDisabled);
        highlightOption(listContainer, firstVisible ? firstVisible.element : null, trigger);
      });
      
      searchInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Toggle/Open Menu
    if (isCompleteName) {
      const openIfNeeded = (e) => {
        e.stopPropagation();
        if (wrapper._blockNextOpen) {
          return;
        }
        if (e.type === "focus" && e.relatedTarget && wrapper.contains(e.relatedTarget)) {
          return;
        }
        if (!wrapper.classList.contains("is-open")) {
          closeAllDropdowns();
          openDropdown(wrapper, trigger, menu);
        }
      };
      trigger.addEventListener("focus", openIfNeeded);
      trigger.addEventListener("click", openIfNeeded);

      trigger.addEventListener("input", (e) => {
        if (!wrapper.classList.contains("is-open")) {
          openDropdown(wrapper, trigger, menu);
        }
        const value = e.target.value.toLowerCase();
        const query = value.trim();
        
        const cached = getOptionCache(listContainer);
        let hasMatches = false;

        const hasMultipleWords = query.includes(" ");
        const words = hasMultipleWords ? query.split(/\s+/) : null;

        cached.forEach(opt => {
          const match = query === "" || (hasMultipleWords
            ? words.every(word => opt.text.includes(word))
            : opt.text.includes(query));

          if (match) {
            opt.element.style.display = "";
            hasMatches = true;
          } else {
            opt.element.style.display = "none";
            opt.element.classList.remove("is-highlighted");
          }
        });

        noResults.style.display = hasMatches ? "none" : "";
        
        const firstVisible = cached.find(o => o.element.style.display !== "none" && !o.isDisabled);
        highlightOption(listContainer, firstVisible ? firstVisible.element : null, trigger);
      });
    } else {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains("is-open");
        closeAllDropdowns();
        if (!isOpen) {
          openDropdown(wrapper, trigger, menu);
        } else {
          closeDropdown(wrapper, trigger, menu);
        }
      });
    }

    // Observer for validation states and programmatic changes
    const observer = new MutationObserver((mutations) => {
      let rebuildNeeded = false;
      mutations.forEach(mutation => {
        if (mutation.type === "childList") {
          rebuildNeeded = true;
        }
      });

      if (select.classList.contains("is-error")) {
        wrapper.classList.add("is-error");
      } else {
        wrapper.classList.remove("is-error");
      }
      if (select.classList.contains("is-valid")) {
        wrapper.classList.add("is-valid");
      } else {
        wrapper.classList.remove("is-valid");
      }
      
      if (rebuildNeeded) {
        buildCustomOptionsList(select, listContainer, trigger, wrapper, menu, isCountrySelect, noResults);
      }

      const currOption = select.options[select.selectedIndex];
      if (currOption) {
        updateTriggerContent(trigger, currOption, isCountrySelect, select.id);
        
        Array.from(listContainer.children).forEach((customOpt, idx) => {
          if (customOpt.classList.contains("custom-select-option")) {
            if (idx === select.selectedIndex) {
              customOpt.classList.add("is-selected");
              customOpt.setAttribute("aria-selected", "true");
            } else {
              customOpt.classList.remove("is-selected");
              customOpt.setAttribute("aria-selected", "false");
            }
          }
        });
      }
    });
    observer.observe(select, { attributes: true, attributeFilter: ["class"], childList: true });

    // Sync value if select changes programmatically
    select.addEventListener("change", () => {
      const currOption = select.options[select.selectedIndex];
      if (currOption) {
        updateTriggerContent(trigger, currOption, isCountrySelect, select.id);
        Array.from(listContainer.children).forEach((customOpt, idx) => {
          if (customOpt.classList.contains("custom-select-option")) {
            if (idx === select.selectedIndex) {
              customOpt.classList.add("is-selected");
              customOpt.setAttribute("aria-selected", "true");
            } else {
              customOpt.classList.remove("is-selected");
              customOpt.setAttribute("aria-selected", "false");
            }
          }
        });
      }
    });

    select.addEventListener("focus", () => {
      trigger.focus();
    });

    // Keyboard navigation
    const handleKeyDown = (e) => {
      const isMenuOpen = wrapper.classList.contains("is-open");

      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        if (e.key === " " && (document.activeElement === searchInput || isCompleteName)) {
          return; // Allow typing space in search field or completeName input
        }
        e.preventDefault();
        
        const cached = getOptionCache(listContainer);
        const items = [];
        for (let i = 0; i < cached.length; i++) {
          const o = cached[i];
          if (!o.isDisabled && o.element.style.display !== "none") {
            items.push(o.element);
          }
        }

        const currentIndex = items.indexOf(listContainer.querySelector(".custom-select-option.is-highlighted"));

        if (!isMenuOpen) {
          openDropdown(wrapper, trigger, menu);
          highlightOption(listContainer, listContainer.querySelector(".custom-select-option.is-selected") || items[0], trigger);
          return;
        }

        if (e.key === "Enter" || e.key === " ") {
          const highlighted = listContainer.querySelector(".custom-select-option.is-highlighted");
          if (highlighted) {
            const optVal = highlighted.getAttribute("data-value");
            const selectIdx = Array.from(select.options).findIndex(o => o.value === optVal);
            if (selectIdx !== -1) {
              selectOption(select, selectIdx, trigger, wrapper, menu, isCountrySelect);
            }
          }
          return;
        }

        let nextIdx = currentIndex;
        if (e.key === "ArrowDown") {
          nextIdx = (currentIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
          nextIdx = (currentIndex - 1 + items.length) % items.length;
        }
        
        highlightOption(listContainer, items[nextIdx], trigger);
      } else if (e.key === "Escape" || e.key === "Tab") {
        if (isMenuOpen) {
          closeDropdown(wrapper, trigger, menu);
        }
      }
    };

    trigger.addEventListener("keydown", handleKeyDown);
    if (searchInput) {
      searchInput.addEventListener("keydown", handleKeyDown);
    }
  });

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });
}

function updateTriggerContent(trigger, option, isCountrySelect, selectId) {
  if (trigger.tagName === "INPUT") {
    trigger.value = option ? option.textContent : "";
    return;
  }
  trigger.innerHTML = "";
  if (!option) return;

  if (isCountrySelect && option.value && countryToIso[option.value]) {
    const iso = countryToIso[option.value];
    const flagImg = document.createElement("img");
    flagImg.src = `https://flagcdn.com/w20/${iso}.png`;
    flagImg.srcset = `https://flagcdn.com/w40/${iso}.png 2x`;
    flagImg.width = 20;
    flagImg.height = 15;
    flagImg.alt = "";
    flagImg.className = "country-flag-icon";
    
    trigger.appendChild(flagImg);
    trigger.appendChild(document.createTextNode(" " + option.textContent));
    trigger.classList.remove("placeholder-active");
  } else {
    const iconData = getOptionIcon(selectId, option.value, option.textContent);
    if (iconData) {
      const iconEl = document.createElement("i");
      iconEl.className = "session-icon";
      iconEl.style.backgroundColor = iconData.bgColor;
      iconEl.style.color = iconData.iconColor;
      iconEl.style.width = "22px";
      iconEl.style.height = "22px";
      iconEl.style.marginRight = "6px";
      iconEl.style.borderRadius = "6px";
      iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconData.svgPath}</svg>`;
      trigger.appendChild(iconEl);
      trigger.appendChild(document.createTextNode(" " + option.textContent));
      trigger.classList.remove("placeholder-active");
    } else {
      trigger.textContent = option.textContent;
      if (option.value === "") {
        trigger.classList.add("placeholder-active");
      } else {
        trigger.classList.remove("placeholder-active");
      }
    }
  }
}

function openDropdown(wrapper, trigger, menu) {
  wrapper.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  
  const searchInput = menu.querySelector(".custom-select-search");
  if (searchInput) {
    const listContainer = menu.querySelector(".custom-select-options-list");
    if (listContainer) {
      listContainer._optionCache = null;
    }
    if (searchInput.value !== "") {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    }
    setTimeout(() => searchInput.focus(), 50);
  } else {
    const listContainer = menu.querySelector(".custom-select-options-list") || menu;
    if (trigger.tagName === "INPUT") {
      listContainer._optionCache = null;
      const cached = getOptionCache(listContainer);
      cached.forEach(opt => {
        opt.element.style.display = "";
      });
      const noResults = menu.querySelector(".custom-select-no-results");
      if (noResults) noResults.style.display = "none";
      setTimeout(() => {
        trigger.select();
      }, 50);
    }
    const selectedItem = listContainer.querySelector(".custom-select-option.is-selected");
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  }
}

function closeDropdown(wrapper, trigger, menu) {
  const isCompleteName = trigger.tagName === "INPUT";
  const focusWasInside = wrapper.contains(document.activeElement);
  wrapper.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  trigger.removeAttribute("aria-activedescendant");
  
  const listContainer = menu.querySelector(".custom-select-options-list") || menu;
  const highlighted = listContainer.querySelector(".custom-select-option.is-highlighted");
  if (highlighted) highlighted.classList.remove("is-highlighted");

  if (isCompleteName) {
    const select = wrapper.querySelector("select");
    if (select) {
      const selectedOption = select.options[select.selectedIndex];
      updateTriggerContent(trigger, selectedOption, false, select.id);
    }
  }

  if (focusWasInside) {
    trigger.focus();
  }
}

function closeAllDropdowns() {
  document.querySelectorAll(".custom-select-wrapper.is-open").forEach(openWrapper => {
    const trigger = openWrapper.querySelector(".custom-select-trigger");
    const menu = openWrapper.querySelector(".custom-select-options");
    closeDropdown(openWrapper, trigger, menu);
  });
}

function highlightOption(listContainer, targetOption, trigger) {
  listContainer.querySelectorAll(".custom-select-option.is-highlighted").forEach(el => {
    el.classList.remove("is-highlighted");
  });
  if (targetOption) {
    targetOption.classList.add("is-highlighted");
    targetOption.scrollIntoView({ block: "nearest" });
    if (trigger && targetOption.id) {
      trigger.setAttribute("aria-activedescendant", targetOption.id);
    }
  } else if (trigger) {
    trigger.removeAttribute("aria-activedescendant");
  }
}

function selectOption(select, index, trigger, wrapper, menu, isCountrySelect) {
  select.selectedIndex = index;
  select.dispatchEvent(new Event("change"));
  
  const option = select.options[index];
  updateTriggerContent(trigger, option, isCountrySelect, select.id);

  const listContainer = menu.querySelector(".custom-select-options-list") || menu;
  Array.from(listContainer.children).forEach((customOpt, idx) => {
    if (customOpt.classList.contains("custom-select-option")) {
      if (idx === index) {
        customOpt.classList.add("is-selected");
        customOpt.setAttribute("aria-selected", "true");
      } else {
        customOpt.classList.remove("is-selected");
        customOpt.setAttribute("aria-selected", "false");
      }
    }
  });

  wrapper._blockNextOpen = true;
  closeDropdown(wrapper, trigger, menu);
  trigger.focus();
  setTimeout(() => {
    wrapper._blockNextOpen = false;
  }, 100);
}


