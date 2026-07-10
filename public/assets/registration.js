/* ----- intl-tel-input initialization ----- */
const phoneInput = document.querySelector("#phone");

const iti = window.intlTelInput(phoneInput, {
  initialCountry: "auto",
  geoIpLookup(callback) {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => callback(data.country_code))
      .catch(() => callback("us"));
  },
  preferredCountries: ["ph", "us", "gb", "fr", "cn", "in", "au", "jp", "de", "br"],
  separateDialCode: true,
  utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.5.3/build/js/utils.js"
});

/* ----- Helpers ----- */
function showError(input, errorEl) {
  input.classList.remove("is-valid");
  input.classList.add("is-error");
  errorEl.classList.add("visible");
}

function clearError(input, errorEl) {
  input.classList.remove("is-error");
  input.classList.add("is-valid");
  errorEl.classList.remove("visible");
}

function validateField(input, errorEl, validator) {
  const valid = validator(input);
  if (!valid) showError(input, errorEl);
  else clearError(input, errorEl);
  return valid;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nationalityOptions = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguan and Barbudan", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani",
  "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian",
  "Cabo Verdean", "Cambodian", "Cameroonian", "Canadian", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch",
  "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Eswatini", "Ethiopian",
  "Fijian", "Filipino", "Finnish", "French",
  "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinea-Bissauan", "Guyanese",
  "Haitian", "Honduran", "Hungarian",
  "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian",
  "Jamaican", "Japanese", "Jordanian",
  "Kazakh", "Kenyan", "Kiribati", "Kittitian and Nevisian", "Kuwaiti", "Kyrgyz",
  "Lao", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger",
  "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican",
  "Namibian", "Nauruan", "Nepali", "New Zealander", "Nicaraguan", "Nigerien", "Nigerian", "North Korean", "North Macedonian", "Norwegian",
  "Omani",
  "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese",
  "Qatari",
  "Romanian", "Russian", "Rwandan",
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian and Tobagonian", "Tunisian", "Turkish", "Turkmen",
  "Tuvaluan",
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbek",
  "Vanuatuan", "Venezuelan", "Vietnamese",
  "Yemeni",
  "Zambian", "Zimbabwean",
  "Other"
];

const countryOptions = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  "Other"
];

const nationalityEl = document.getElementById("nationality");
countryOptions.forEach(label => {
  const option = document.createElement("option");
  option.value = slugify(label);
  option.textContent = label;
  nationalityEl.appendChild(option);
});

const addrCountryEl = document.getElementById("addrCountry");
countryOptions.forEach(label => {
  const option = document.createElement("option");
  option.value = slugify(label);
  option.textContent = label;
  addrCountryEl.appendChild(option);
});

const validators = {
  firstName: (el) => el.value.trim().length >= 2,
  lastName: (el) => el.value.trim().length >= 2,
  email: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
  emailConfirm: (el) => el.value.trim() !== "" && el.value.trim() === document.getElementById("email").value.trim(),
  registrationType: (el) => el.value !== "",
  speakerType: (el) => el.value !== "",
  ageRange: (el) => el.value !== "",
  gender: (el) => el.value !== "",
  nationality: (el) => el.value !== "",
  affiliation: (el) => el.value !== "",
  affiliationSub: (el) => el.value !== "",
  affiliationSpecify: (el) => el.value.trim().length >= 2,
  designation: (el) => el.value.trim().length >= 2,
  addrCountry: (el) => el.value !== "",
  dietary: (el) => el.value !== "",
  dietarySpecify: (el) => el.value.trim().length >= 2,
  phone: () => iti.isValidNumber(),
  zoomMeetingId: (el) => el.value !== ""
};

function isHidden(el) {
  return !el || el.closest("[hidden]");
}

function validateIfVisible(id) {
  const el = document.getElementById(id);
  const err = document.getElementById(`${id}-error`);
  if (!el || !err || isHidden(el)) {
    if (el) el.classList.remove("is-error");
    if (err) err.classList.remove("visible");
    return true;
  }
  return validateField(el, err, validators[id]);
}

[
  "firstName", "lastName", "email", "emailConfirm", "affiliationSpecify", "designation",
  "dietarySpecify"
].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const eventName = el.tagName === "SELECT" ? "change" : "input";
  el.addEventListener("blur", () => validateIfVisible(id));
  el.addEventListener(eventName, () => {
    if (el.classList.contains("is-error")) validateIfVisible(id);
  });
});

["registrationType", "speakerType", "ageRange", "gender", "nationality", "affiliation", "affiliationSub", "addrCountry", "dietary", "zoomMeetingId"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("change", () => validateIfVisible(id));
});

document.getElementById("email").addEventListener("input", () => {
  const confirmEl = document.getElementById("emailConfirm");
  if (confirmEl.value.trim() !== "" || confirmEl.classList.contains("is-error")) {
    validateIfVisible("emailConfirm");
  }
});

/* ----- Conditional registration fields ----- */
const registrationTypeEl = document.getElementById("registrationType");
const workingCommitteeNotice = document.getElementById("workingCommitteeNotice");
const mainFormFields = document.getElementById("mainFormFields");
const formActions = document.getElementById("formActions");
const speakerTypeGroup = document.getElementById("speakerTypeGroup");
const speakerTypeEl = document.getElementById("speakerType");
const mediaSection = document.getElementById("mediaSection");
const mediaQueriesGroup = document.getElementById("mediaQueriesGroup");
const mediaNote = document.getElementById("mediaNote");
const affiliationEl = document.getElementById("affiliation");
const affiliationSubGroup = document.getElementById("affiliationSubGroup");
const affiliationSubEl = document.getElementById("affiliationSub");
const designationGroup = document.getElementById("designationGroup");
const designationEl = document.getElementById("designation");
const affiliationSpecifyGroup = document.getElementById("affiliationSpecifyGroup");
const affiliationSpecifyEl = document.getElementById("affiliationSpecify");
const attendanceModeRadios = document.querySelectorAll('input[name="attendanceMode"]');
const attendanceModeSection = document.getElementById("attendanceModeSection");
const attendanceModeGroup = document.getElementById("attendanceModeGroup");
const attendanceModeErr = document.getElementById("attendanceMode-error");
const attendanceAllDays = document.getElementById("attendanceAllDays");
const attendanceDayCheckboxes = Array.from(document.querySelectorAll(".attendance-day"));
const attendanceDayCheckboxesAll = Array.from(document.querySelectorAll('input[name="attendanceDays[]"]'));
const attendanceDaysSection = document.getElementById("attendanceDaysSection");
const attendanceDaysGroup = document.getElementById("attendanceDaysGroup");
const attendanceDaysErr = document.getElementById("attendanceDays-error");
const conferenceGroup = document.getElementById("conferenceGroup");
const conferenceSelect = document.getElementById("conferenceSelect");
const conferenceToggle = document.getElementById("conferenceToggle");
const conferencePanel = document.getElementById("conferencePanel");
const conferenceSummary = document.getElementById("conferenceSummary");
const conferenceCount = document.getElementById("conferenceCount");
const conferenceSearch = document.getElementById("conferenceSearch");
const conferenceSelected = document.getElementById("conferenceSelected");
const conferenceCheckboxes = document.querySelectorAll('input[name="conference[]"]');
const conferenceCheckGroup = document.getElementById("conferenceCheckGroup");
const conferenceErr = document.getElementById("conference-error");
const visaAssistanceEl = document.getElementById("visaAssistance");
const dietaryGroup = document.getElementById("dietaryGroup");
const dietaryEl = document.getElementById("dietary");
const dietaryErr = document.getElementById("dietary-error");
const dietarySpecifyGroup = document.getElementById("dietarySpecifyGroup");
const dietarySpecifyEl = document.getElementById("dietarySpecify");
const fieldTripGroup = document.getElementById("fieldTripGroup");
const fieldTripEl = document.getElementById("fieldTrip");
const fieldTripCheckGroup = document.getElementById("fieldTripCheckGroup");
const fieldTripCheckboxes = document.querySelectorAll('input[name="fieldTrip[]"]');
const fieldTripErr = document.getElementById("fieldTrip-error");
const zoomMeetingGroup = document.getElementById("zoomMeetingGroup");
const zoomMeetingIdEl = document.getElementById("zoomMeetingId");
const zoomMeetingIdErr = document.getElementById("zoomMeetingId-error");

const affiliationSubOptions = {
  government: [
    ["local-government", "Local Government"],
    ["national-government-agency", "National Government Agency"]
  ],
  academe: [
    ["student", "Student"],
    ["faculty", "Faculty"],
    ["researcher", "Researcher"],
    ["others", "Others"]
  ]
};

function setGroupHidden(group, hidden) {
  if (!group) return;
  group.toggleAttribute("hidden", hidden);
  group.querySelectorAll("input, select, textarea").forEach(el => {
    el.setAttribute("aria-required", hidden ? "false" : "true");
    if (hidden) {
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
      el.classList.remove("is-error", "is-valid");
    }
  });
  if (hidden) group.querySelectorAll(".form-error").forEach(el => el.classList.remove("visible"));
}

function updateWorkingCommittee() {
  const isWC = registrationTypeEl.value === "working-committee";
  workingCommitteeNotice.toggleAttribute("hidden", !isWC);
  mainFormFields.toggleAttribute("hidden", isWC);
  formActions.toggleAttribute("hidden", isWC);
}

function updateSpeakerType() {
  const isSpeaker = registrationTypeEl.value === "speaker";
  setGroupHidden(speakerTypeGroup, !isSpeaker);
  if (isSpeaker && speakerTypeEl.classList.contains("is-error")) validateIfVisible("speakerType");
}

function updateMediaQueries() {
  const isMedia = registrationTypeEl.value === "media";
  mediaSection.toggleAttribute("hidden", !isMedia);

  // For media: hide attendance mode, auto-select in-person
  attendanceModeSection.toggleAttribute("hidden", isMedia);
  if (isMedia) {
    const inPersonRadio = document.querySelector('input[name="attendanceMode"][value="in-person"]');
    if (inPersonRadio) inPersonRadio.checked = true;
  }
  updateAttendanceModeSections();
}

function updateAffiliationSubOptions() {
  const options = affiliationSubOptions[affiliationEl.value] || [];
  affiliationSubEl.innerHTML = '<option value="" disabled selected>&mdash; Select category &mdash;</option>';
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    affiliationSubEl.appendChild(option);
  });

  setGroupHidden(affiliationSubGroup, options.length === 0);
  updateAffiliationSpecify();
}

function updateAffiliationSpecify() {
  const isGovernmentWithSub = affiliationEl.value === "government" && affiliationSubEl.value !== "";
  const isAcademeOthers = (affiliationEl.value === "academe" && affiliationSubEl.value === "others") || affiliationEl.value === "international-organization";
  setGroupHidden(designationGroup, !isGovernmentWithSub);
  setGroupHidden(affiliationSpecifyGroup, !isAcademeOthers);
}

function validateAttendanceMode() {
  const valid = getAttendanceMode() !== "";
  attendanceModeGroup.querySelectorAll(".form-radio").forEach(item => item.classList.toggle("is-error", !valid));
  attendanceModeErr.classList.toggle("visible", !valid);
  return valid;
}

function getAttendanceMode() {
  const checked = document.querySelector('input[name="attendanceMode"]:checked');
  return checked ? checked.value : "";
}

function updateAttendanceDays(changed) {
  if (changed === attendanceAllDays) {
    attendanceDayCheckboxes.forEach(cb => { cb.checked = attendanceAllDays.checked; });
  } else {
    if (attendanceAllDays.checked && attendanceDayCheckboxes.some(cb => !cb.checked)) {
      attendanceAllDays.checked = false;
    }
    if (attendanceDayCheckboxes.every(cb => cb.checked)) {
      attendanceAllDays.checked = true;
    }
  }

  if (attendanceDayCheckboxesAll.some(cb => cb.checked)) {
    attendanceDaysGroup.classList.remove("is-error");
    attendanceDaysErr.classList.remove("visible");
  }
}

function validateAttendanceDays() {
  if (attendanceDaysSection.hasAttribute("hidden")) return true;
  const valid = attendanceDayCheckboxesAll.some(cb => cb.checked);
  attendanceDaysGroup.classList.toggle("is-error", !valid);
  attendanceDaysErr.classList.toggle("visible", !valid);
  return valid;
}

function getSelectedAttendanceDays() {
  return attendanceDayCheckboxesAll.filter(cb => cb.checked).map(cb => cb.value);
}

function getSelectedConferenceItems() {
  return Array.from(conferenceCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => ({
      value: cb.value,
      label: cb.closest(".form-check-item")?.querySelector("span")?.textContent.trim() || cb.value
    }));
}

function openConferencePanel() {
  conferencePanel.removeAttribute("hidden");
  conferenceToggle.classList.add("is-open");
  conferenceToggle.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => conferenceSearch.focus());
}

function closeConferencePanel() {
  conferencePanel.setAttribute("hidden", "");
  conferenceToggle.classList.remove("is-open");
  conferenceToggle.setAttribute("aria-expanded", "false");
}

function renderConferenceSummary() {
  const selected = getSelectedConferenceItems();
  if (selected.length === 0) {
    conferenceSummary.textContent = "Select one or more sessions";
    conferenceCount.textContent = "0 selected";
    conferenceCount.setAttribute("hidden", "");
    conferenceSelected.innerHTML = "";
    conferenceSelected.setAttribute("hidden", "");
    return;
  }

  const preview = selected.slice(0, 2).map(item => item.label).join(", ");
  conferenceSummary.textContent = selected.length > 2 ? `${preview} +${selected.length - 2} more` : preview;
  conferenceCount.textContent = `${selected.length} selected`;
  conferenceCount.removeAttribute("hidden");
  conferenceSelected.innerHTML = selected.map(item =>
    `<span class="conference-select__tag">${item.label}<button type="button" class="conference-select__tag-remove" data-conference-remove="${item.value}" aria-label="Remove ${item.label}">&times;</button></span>`
  ).join("");
  conferenceSelected.removeAttribute("hidden");
}

function filterConferenceOptions() {
  const query = conferenceSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  Array.from(conferenceCheckGroup.querySelectorAll(".form-check-item")).forEach(item => {
    const label = item.textContent.trim().toLowerCase();
    const visible = query === "" || label.includes(query);
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  let emptyState = conferencePanel.querySelector(".conference-select__empty");
  if (!emptyState) {
    emptyState = document.createElement("p");
    emptyState.className = "conference-select__empty";
    emptyState.textContent = "No sessions match your search.";
    conferencePanel.appendChild(emptyState);
  }
  emptyState.classList.toggle("visible", visibleCount === 0);
}

function validateConference() {
  const valid = Array.from(conferenceCheckboxes).some(cb => cb.checked);
  conferenceCheckGroup.classList.toggle("is-error", !valid);
  conferenceToggle.classList.toggle("is-error", !valid);
  conferenceErr.classList.toggle("visible", !valid);
  return valid;
}

function clearConference() {
  conferenceCheckboxes.forEach(cb => { cb.checked = false; });
  conferenceSearch.value = "";
  conferenceCheckGroup.classList.remove("is-error");
  conferenceToggle.classList.remove("is-error");
  conferenceErr.classList.remove("visible");
  filterConferenceOptions();
  renderConferenceSummary();
  closeConferencePanel();
}

function updateAttendanceModeSections() {
  const mode = getAttendanceMode();
  const isMedia = registrationTypeEl.value === "media";
  attendanceModeGroup.querySelectorAll(".form-radio").forEach(item => item.classList.remove("is-error"));
  attendanceModeErr.classList.remove("visible");

  if (mode === "online") {
    attendanceDaysSection.setAttribute("hidden", "");
    attendanceDayCheckboxesAll.forEach(cb => { cb.checked = false; });
    attendanceDaysGroup.classList.remove("is-error");
    attendanceDaysErr.classList.remove("visible");
    conferenceGroup.setAttribute("hidden", "");
    clearConference();
    setGroupHidden(zoomMeetingGroup, false);
    setGroupHidden(dietaryGroup, true);
    setGroupHidden(dietarySpecifyGroup, true);
    return;
  }

  if (mode === "in-person") {
    if (isMedia) {
      attendanceDaysSection.setAttribute("hidden", "");
      attendanceDayCheckboxesAll.forEach(cb => { cb.checked = false; });
      attendanceDaysGroup.classList.remove("is-error");
      attendanceDaysErr.classList.remove("visible");
    } else {
      attendanceDaysSection.removeAttribute("hidden");
    }
    conferenceGroup.removeAttribute("hidden");
    renderConferenceSummary();
    setGroupHidden(zoomMeetingGroup, true);
    setGroupHidden(dietaryGroup, false);
    updateDietarySpecify();
    return;
  }

  if (isMedia) {
    attendanceDaysSection.setAttribute("hidden", "");
    attendanceDayCheckboxesAll.forEach(cb => { cb.checked = false; });
    attendanceDaysGroup.classList.remove("is-error");
    attendanceDaysErr.classList.remove("visible");
  } else {
    attendanceDaysSection.removeAttribute("hidden");
  }
  conferenceGroup.setAttribute("hidden", "");
  clearConference();
  setGroupHidden(zoomMeetingGroup, true);
  setGroupHidden(dietaryGroup, true);
  setGroupHidden(dietarySpecifyGroup, true);
}

function updateVisaDetails() {
  const helper = document.getElementById("visa-helper");
  helper.style.opacity = "0";
  setTimeout(() => {
    if (visaAssistanceEl.checked) {
      helper.innerHTML = 'Need help with your visa? Email <a href="mailto:apsam.secretariat@fao.org">apsam.secretariat@fao.org</a> or call <a href="tel:+6328521000">+63 2 8521-0000</a>.';
    } else {
      helper.textContent = 'Assistance is available only within 60 days before the event. After this deadline, assistance is no longer available.';
    }
    helper.style.opacity = "1";
  }, 180);
}

function updateDietarySpecify() {
  const needsDetails = dietaryEl.value === "with-allergy" || dietaryEl.value === "other";
  const label = dietarySpecifyGroup.querySelector("label");
  if (label) {
    label.textContent = dietaryEl.value === "with-allergy" ? "Please specify your allergy" : "Please specify your preference";
  }
  setGroupHidden(dietarySpecifyGroup, !needsDetails);
  if (dietaryEl.classList.contains("is-error")) validateField(dietaryEl, dietaryErr, validators.dietary);
}

function updateFieldTripVisibility() {
  const isForeignDelegate = addrCountryEl.value !== "" && addrCountryEl.value !== "philippines";
  fieldTripGroup.toggleAttribute("hidden", !isForeignDelegate);
  if (!isForeignDelegate) clearFieldTrips();
}

function getSelectedFieldTrips() {
  return Array.from(fieldTripCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
}

function validateFieldTrip() {
  if (fieldTripGroup.hasAttribute("hidden")) return true;
  const valid = getSelectedFieldTrips().length > 0;
  fieldTripCheckGroup.classList.toggle("is-error", !valid);
  fieldTripErr.classList.toggle("visible", !valid);
  return valid;
}

function clearFieldTrips() {
  fieldTripCheckboxes.forEach(cb => { cb.checked = false; });
  fieldTripCheckGroup.classList.remove("is-error");
  fieldTripErr.classList.remove("visible");
  fieldTripEl.value = "";
}

registrationTypeEl.addEventListener("change", () => {
  updateWorkingCommittee();
  updateSpeakerType();
  updateMediaQueries();
  updateAttendanceModeSections();
});
affiliationEl.addEventListener("change", updateAffiliationSubOptions);
affiliationSubEl.addEventListener("change", updateAffiliationSpecify);
attendanceModeRadios.forEach(radio => radio.addEventListener("change", updateAttendanceModeSections));
attendanceDayCheckboxesAll.forEach(cb => cb.addEventListener("change", () => updateAttendanceDays(cb)));
conferenceCheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    renderConferenceSummary();
    if (conferenceErr.classList.contains("visible")) validateConference();
  });
});
conferenceToggle.addEventListener("click", () => {
  if (conferencePanel.hasAttribute("hidden")) openConferencePanel();
  else closeConferencePanel();
});
conferenceSearch.addEventListener("input", filterConferenceOptions);
conferenceSelected.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-conference-remove]");
  if (!removeBtn) return;
  const target = Array.from(conferenceCheckboxes).find(cb => cb.value === removeBtn.getAttribute("data-conference-remove"));
  if (!target) return;
  target.checked = false;
  renderConferenceSummary();
  filterConferenceOptions();
  if (conferenceErr.classList.contains("visible")) validateConference();
});
fieldTripCheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    if (cb.value === "not-joining" && cb.checked) {
      fieldTripCheckboxes.forEach(item => {
        if (item.value !== "not-joining") item.checked = false;
      });
    } else if (cb.value !== "not-joining" && cb.checked) {
      const notJoining = Array.from(fieldTripCheckboxes).find(item => item.value === "not-joining");
      if (notJoining) notJoining.checked = false;
    }

    fieldTripEl.value = getSelectedFieldTrips().join(",");
    if (fieldTripErr.classList.contains("visible")) validateFieldTrip();
  });
});
document.addEventListener("click", (e) => {
  if (!conferenceSelect.contains(e.target)) closeConferencePanel();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !conferencePanel.hasAttribute("hidden")) {
    closeConferencePanel();
    conferenceToggle.focus();
  }
});
visaAssistanceEl.addEventListener("change", updateVisaDetails);

dietaryEl.addEventListener("change", updateDietarySpecify);
addrCountryEl.addEventListener("change", updateFieldTripVisibility);

updateWorkingCommittee();
updateSpeakerType();
updateMediaQueries();
updateAffiliationSubOptions();
renderConferenceSummary();
filterConferenceOptions();
updateAttendanceModeSections();
updateVisaDetails();
updateDietarySpecify();
updateFieldTripVisibility();

/* ----- Phone ----- */
const phoneErr = document.getElementById("phone-error");
const phoneWrapper = document.getElementById("phoneWrapper");

phoneInput.addEventListener("blur", () => {
  const valid = validators.phone();
  phoneInput.classList.toggle("is-error", !valid);
  phoneInput.classList.toggle("is-valid", valid);
  phoneWrapper.classList.toggle("is-error", !valid);
  phoneErr.classList.toggle("visible", !valid);
});

phoneInput.addEventListener("input", () => {
  if (phoneInput.classList.contains("is-error")) phoneInput.dispatchEvent(new Event("blur"));
});

/* ----- Submit button helpers ----- */
function setButtonLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>Processing Registration…';
    btn.setAttribute("aria-busy", "true");
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
    btn.removeAttribute("aria-busy");
  }
}

function showErrModal(msg) {
  document.getElementById("errModalMessage").textContent = msg;
  document.getElementById("errModal").removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  document.getElementById("errModalDismiss").focus();
}

function hideErrModal() {
  document.getElementById("errModal").setAttribute("hidden", "");
  document.body.style.overflow = "";
}

/* ----- Form submission ----- */
document.getElementById("registrationForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  const ageRangeEl = document.getElementById("ageRange");
  const genderEl = document.getElementById("gender");
  const emailEl = document.getElementById("email");
  const emailConfirmEl = document.getElementById("emailConfirm");
  const addrCountryFieldEl = document.getElementById("addrCountry");
  const prefixEl = document.getElementById("prefix");
  const middleInitialEl = document.getElementById("middleInitial");
  const suffixEl = document.getElementById("suffix");

  const results = [
    validateIfVisible("registrationType"),
    validateIfVisible("speakerType"),
    validateIfVisible("firstName"),
    validateIfVisible("lastName"),
    validateIfVisible("email"),
    validateIfVisible("emailConfirm"),
    validateIfVisible("ageRange"),
    validateIfVisible("gender"),
    validateIfVisible("nationality"),
    validateIfVisible("affiliation"),
    validateIfVisible("affiliationSub"),
    validateIfVisible("designation"),
    validateIfVisible("affiliationSpecify"),
    validateIfVisible("addrCountry"),
    validateIfVisible("dietary"),
    validateIfVisible("dietarySpecify")
  ];

  const isMedia = registrationTypeEl.value === "media";
  if (!isMedia) results.push(validateAttendanceMode());
  results.push(validateAttendanceDays());

  const attendanceMode = getAttendanceMode();
  if (attendanceMode === "online") {
    results.push(validateIfVisible("zoomMeetingId"));
  }

  results.push(validateFieldTrip());

  const tcEl = document.getElementById("tcAccept");
  const tcErr = document.getElementById("tcAccept-error");
  if (!tcEl.checked) {
    tcErr.classList.add("visible");
    results.push(false);
  } else {
    tcErr.classList.remove("visible");
    results.push(true);
  }

  const phoneValid = validators.phone();
  phoneInput.classList.toggle("is-error", !phoneValid);
  phoneInput.classList.toggle("is-valid", phoneValid);
  phoneWrapper.classList.toggle("is-error", !phoneValid);
  phoneErr.classList.toggle("visible", !phoneValid);
  results.push(phoneValid);

  if (results.includes(false)) {
    const firstErr = document.querySelector(".form-input.is-error, .form-select.is-error, .form-textarea.is-error");
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (attendanceModeErr.classList.contains("visible")) {
      document.getElementById("attendanceMode-label").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (attendanceDaysErr.classList.contains("visible")) {
      document.getElementById("attendanceDays-label").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (conferenceErr.classList.contains("visible")) {
      conferenceGroup.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  const countryCode = "+" + iti.getSelectedCountryData().dialCode;
  const prefixText = prefixEl && prefixEl.value ? prefixEl.options[prefixEl.selectedIndex].text : "";
  const middleInitialVal = middleInitialEl ? middleInitialEl.value.trim() : "";
  const suffixVal = suffixEl ? suffixEl.value.trim() : "";
  const fullName = [prefixText, firstNameEl.value.trim(), middleInitialVal, lastNameEl.value.trim(), suffixVal].filter(Boolean).join(" ");
  const selectedAttendanceDays = getSelectedAttendanceDays();
  const selectedConferences = Array.from(conferenceCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  const fd = new FormData();
  fd.append("registration_type",   registrationTypeEl.value);
  fd.append("prefix",              prefixEl ? prefixEl.value : "");
  fd.append("speaker_type",        registrationTypeEl.value === "speaker" ? speakerTypeEl.value : "");
  fd.append("first_name",          firstNameEl.value.trim());
  fd.append("middle_initial",      middleInitialVal);
  fd.append("last_name",           lastNameEl.value.trim());
  fd.append("suffix",              suffixVal);
  fd.append("full_name",           fullName);
  fd.append("age_range",           ageRangeEl.value);
  fd.append("gender",              genderEl.value);
  fd.append("nationality",         nationalityEl.value);
  fd.append("affiliation",         affiliationEl.value);
  fd.append("affiliation_sub",     isHidden(affiliationSubEl) ? "" : affiliationSubEl.value);
  fd.append("affiliation_specify", isHidden(affiliationSpecifyEl) ? "" : affiliationSpecifyEl.value.trim());
  fd.append("designation",         isHidden(designationEl) ? "" : designationEl.value.trim());
  fd.append("media_queries",       !mediaSection.hasAttribute("hidden") ? document.getElementById("mediaQueries").value.trim() : "");
  fd.append("company",             affiliationSpecifyEl.value.trim() || affiliationEl.value);
  fd.append("email",               emailEl.value.trim());
  fd.append("phone",               countryCode + phoneInput.value.trim());
  fd.append("attendance_mode",     isMedia ? "in-person" : attendanceMode);
  fd.append("attendance_days",     selectedAttendanceDays.join(","));
  fd.append("address_country",     addrCountryFieldEl.value);
  fd.append("address_state",       "");
  fd.append("address_street",      "");
  fd.append("address_city",        "");
  fd.append("address_zip",         "");
  fd.append("dietary",             attendanceMode === "in-person" ? dietaryEl.value : "");
  fd.append("dietary_details",     attendanceMode === "in-person" && !isHidden(dietarySpecifyEl) ? dietarySpecifyEl.value.trim() : "");
  fd.append("visa_assistance",     visaAssistanceEl.checked ? "1" : "0");
  fd.append("field_trip",          getSelectedFieldTrips().join(","));
  fd.append("seminar",             attendanceMode === "online" ? selectedConferences.join(",") : "");
  fd.append("zoom_meeting_id",     attendanceMode === "online" && !isHidden(zoomMeetingIdEl) ? zoomMeetingIdEl.value : "");
  fd.append("academic_type",       "");

  setButtonLoading(submitBtn, true);

  fetch("/v1/register", {
    method: "POST",
    body: fd
  })
    .then(function(res) {
      if (!res.ok) {
        return res.json()
          .catch(function() { return {}; })
          .then(function(body) {
            throw new Error(body.message || `Registration failed (${res.status}). Please try again.`);
          });
      }
      return res.json();
    })
    .then(function(res) {
      window.location.href = "/confirmation?token=" + encodeURIComponent(res.data.token);
    })
    .catch(function(err) {
      setButtonLoading(submitBtn, false);
      showErrModal(err.message || "An unexpected error occurred. Please try again.");
    });
});

/* ----- Reset ----- */
function resetForm() {
  document.getElementById("registrationForm").reset();
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("confirmationPanel").classList.remove("visible");
  document.querySelectorAll(".form-input, .form-select, .form-textarea").forEach(el => {
    el.classList.remove("is-error", "is-valid");
  });
  document.querySelectorAll(".form-error").forEach(el => el.classList.remove("visible"));
  phoneWrapper.classList.remove("is-error");
  attendanceModeGroup.classList.remove("is-error");
  attendanceDaysGroup.classList.remove("is-error");
  updateSpeakerType();
  updateMediaQueries();
  updateAffiliationSubOptions();
  updateAttendanceModeSections();
  updateVisaDetails();
  updateDietarySpecify();
  updateFieldTripVisibility();
}

/* ----- Hamburger / Mobile Nav ----- */
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

function closeMobileNav() {
  if (navToggle && mobileNav) {
    navToggle.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    mobileNav.setAttribute("hidden", "");
  }
}

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.classList.toggle("is-open");
    mobileNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    if (isOpen) mobileNav.removeAttribute("hidden");
    else mobileNav.setAttribute("hidden", "");
  });

  document.addEventListener("click", (e) => {
    if (!navToggle.contains(e.target) && !mobileNav.contains(e.target)) closeMobileNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navToggle.classList.contains("is-open")) {
      closeMobileNav();
      navToggle.focus();
    }
  });
}

const desktopMQ = window.matchMedia("(min-width: 769px)");
function onBreakpoint(e) {
  if (e.matches) closeMobileNav();
}
if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", onBreakpoint);
else desktopMQ.addListener(onBreakpoint);

/* ----- Data privacy modal ----- */
const tcModal = document.getElementById("tcModal");
const tcCheckbox = document.getElementById("tcAccept");
const tcLink = document.getElementById("tcLink");
const tcErrMsg = document.getElementById("tcAccept-error");

function openTCModal() {
  tcModal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  tcModal.querySelector(".tc-modal__confirm").focus();
}

function closeTCModal() {
  tcModal.setAttribute("hidden", "");
  document.body.style.overflow = "";
  tcLink.focus();
}

tcLink.addEventListener("click", (e) => {
  e.preventDefault();
  openTCModal();
});

tcCheckbox.addEventListener("click", (e) => {
  if (tcCheckbox.checked) {
    e.preventDefault();
    openTCModal();
  }
});

/* Scroll to FAO Data Protection policy section inside the modal */
document.getElementById("faoPrivacyScrollBtn").addEventListener("click", () => {
  const target = document.getElementById("faoDataPrivacyPolicy");
  const body   = document.getElementById("tcModalBody");
  if (target && body) {
    body.scrollTo({ top: target.offsetTop - body.offsetTop - 16, behavior: "smooth" });
  }
});

document.getElementById("tcClose").addEventListener("click", closeTCModal);
document.getElementById("tcCancel").addEventListener("click", closeTCModal);
document.getElementById("tcConfirm").addEventListener("click", () => {
  tcCheckbox.checked = true;
  tcErrMsg.classList.remove("visible");
  closeTCModal();
});

tcModal.addEventListener("click", (e) => {
  if (e.target === tcModal) closeTCModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !tcModal.hasAttribute("hidden")) closeTCModal();
});

/* ----- Error modal ----- */
document.getElementById("errModalClose").addEventListener("click", hideErrModal);
document.getElementById("errModalDismiss").addEventListener("click", hideErrModal);
document.getElementById("errModal").addEventListener("click", function(e) {
  if (e.target === this) hideErrModal();
});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && !document.getElementById("errModal").hasAttribute("hidden")) hideErrModal();
});

const zoomSelect = document.getElementById("zoomSelect");
const zoomToggle = document.getElementById("zoomToggle");
const zoomPanel = document.getElementById("zoomPanel");
const zoomSummary = document.getElementById("zoomSummary");
const zoomCount = document.getElementById("zoomCount");
const zoomSearch = document.getElementById("zoomSearch");
const zoomSelected = document.getElementById("zoomSelected");
const zoomSessionsContainer = document.getElementById("zoomSessionsContainer");
const zoomMeetingIdHidden = document.getElementById("zoomMeetingId");

function openZoomPanel() {
  zoomPanel.removeAttribute("hidden");
  zoomToggle.classList.add("is-open");
  zoomToggle.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => zoomSearch.focus());
}

function closeZoomPanel() {
  zoomPanel.setAttribute("hidden", "");
  zoomToggle.classList.remove("is-open");
  zoomToggle.setAttribute("aria-expanded", "false");
}

function getSelectedZoomItems() {
  const checkboxes = zoomSessionsContainer.querySelectorAll(".zoom-card-checkbox");
  return Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => ({
      value: cb.value,
      label: cb.dataset.label || cb.value
    }));
}

function renderZoomSummary() {
  const selected = getSelectedZoomItems();
  if (selected.length === 0) {
    zoomSummary.textContent = "Select one or more sessions";
    zoomCount.textContent = "0 selected";
    zoomCount.setAttribute("hidden", "");
    zoomSelected.innerHTML = "";
    zoomSelected.setAttribute("hidden", "");
    return;
  }

  const preview = selected.slice(0, 2).map(item => item.label).join(", ");
  zoomSummary.textContent = selected.length > 2 ? `${preview} +${selected.length - 2} more` : preview;
  zoomCount.textContent = `${selected.length} selected`;
  zoomCount.removeAttribute("hidden");
  zoomSelected.innerHTML = selected.map(item =>
    `<span class="conference-select__tag">${item.label}<button type="button" class="conference-select__tag-remove" data-zoom-remove="${item.value}" aria-label="Remove ${item.label}">&times;</button></span>`
  ).join("");
  zoomSelected.removeAttribute("hidden");
}

function filterZoomOptions() {
  const query = zoomSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  Array.from(zoomSessionsContainer.querySelectorAll(".form-check-item")).forEach(item => {
    const label = item.textContent.trim().toLowerCase();
    const visible = query === "" || label.includes(query);
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  let emptyState = zoomPanel.querySelector(".conference-select__empty");
  if (!emptyState) {
    emptyState = document.createElement("p");
    emptyState.className = "conference-select__empty";
    emptyState.textContent = "No sessions match your search.";
    zoomPanel.appendChild(emptyState);
  }
  emptyState.classList.toggle("visible", visibleCount === 0);
}

function clearZoom() {
  const checkboxes = zoomSessionsContainer.querySelectorAll(".zoom-card-checkbox");
  checkboxes.forEach(cb => { cb.checked = false; });
  zoomSearch.value = "";
  zoomSessionsContainer.classList.remove("is-error");
  zoomToggle.classList.remove("is-error");
  document.getElementById("zoomMeetingId-error").classList.remove("visible");
  filterZoomOptions();
  renderZoomSummary();
  closeZoomPanel();
  zoomMeetingIdHidden.value = "";
}

// Add Event Listeners for Zoom Dropdown
if (zoomToggle) {
  zoomToggle.addEventListener("click", () => {
    if (zoomPanel.hasAttribute("hidden")) openZoomPanel();
    else closeZoomPanel();
  });
  zoomSearch.addEventListener("input", filterZoomOptions);
  zoomSelected.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-zoom-remove]");
    if (!removeBtn) return;
    const checkboxes = zoomSessionsContainer.querySelectorAll(".zoom-card-checkbox");
    const target = Array.from(checkboxes).find(cb => cb.value === removeBtn.getAttribute("data-zoom-remove"));
    if (!target) return;
    target.checked = false;
    renderZoomSummary();
    filterZoomOptions();
    
    // update hidden input
    const ids = getSelectedZoomItems().map(item => item.value);
    zoomMeetingIdHidden.value = ids.join(",");
    validateIfVisible("zoomMeetingId");
  });
  document.addEventListener("click", (e) => {
    if (!zoomSelect.contains(e.target)) closeZoomPanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !zoomPanel.hasAttribute("hidden")) {
      closeZoomPanel();
      zoomToggle.focus();
    }
  });
}

// Dynamic Zoom Meetings Loader
async function fetchZoomMeetings() {
  const container = zoomSessionsContainer;
  const hiddenInput = zoomMeetingIdHidden;
  if (!container || !hiddenInput) return;

  try {
    const res = await fetch("/v1/zoom-meetings");
    const data = await res.json();

    if (data.success && data.data && data.data.meetings) {
      const meetings = data.data.meetings;
      container.innerHTML = "";
      if (meetings.length === 0) {
        container.innerHTML = '<p class="conference-select__empty visible">No active online sessions available at this time.</p>';
        return;
      }

      let imgIndex = 1;
      meetings.forEach(m => {
        const imgUrl = m.image_url || `/assets/event_${imgIndex}.png`;
        if (!m.image_url) {
          imgIndex = (imgIndex % 4) + 1; // cycle 1 to 4
        }

        const labelEl = document.createElement("label");
        labelEl.className = "form-check-item zoom-card-dropdown-item";
        labelEl.innerHTML = `
          <div class="zoom-dropdown-img" style="background-image: url('${imgUrl}')"></div>
          <div class="zoom-dropdown-content">
            <h4 class="zoom-dropdown-title">${m.display_name}</h4>
            <p class="zoom-dropdown-desc">Session ID: ${m.meeting_id}</p>
          </div>
          <input type="checkbox" class="form-check-item__input zoom-card-checkbox" value="${m.meeting_id}" data-label="${m.display_name}" style="margin-left: auto;">
        `;
        
        // Handle checkbox change event
        const checkbox = labelEl.querySelector(".zoom-card-checkbox");
        checkbox.addEventListener("change", () => {
          renderZoomSummary();
          const ids = getSelectedZoomItems().map(item => item.value);
          hiddenInput.value = ids.join(",");
          validateIfVisible("zoomMeetingId");
        });

        container.appendChild(labelEl);
      });
    } else {
      container.innerHTML = '<p class="conference-select__empty visible" style="color: var(--color-danger);">Failed to load online sessions.</p>';
    }
  } catch (err) {
    console.error("Error loading Zoom sessions:", err);
    container.innerHTML = '<p class="conference-select__empty visible" style="color: var(--color-danger);">Error loading online sessions.</p>';
  }
}

fetchZoomMeetings();

