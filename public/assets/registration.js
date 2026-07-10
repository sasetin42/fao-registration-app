/* ----- intl-tel-input initialization ----- */
const phoneInput = document.querySelector("#phone");
const phoneErr = document.getElementById("phone-error");
const phoneWrapper = document.getElementById("phoneWrapper");

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

const validators = {
  completeName: (el) => el.value.trim().length >= 2,
  email: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
  phone: () => iti.isValidNumber(),
  zoomMeetingId: (el) => el.value.trim() !== ""
};

function validateIfVisible(id) {
  const el = document.getElementById(id);
  const err = document.getElementById(`${id}-error`);
  if (!el || !err) return true;
  return validateField(el, err, validators[id]);
}

// Blur and input listeners for instant feedback
["completeName", "email"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("blur", () => validateIfVisible(id));
  el.addEventListener("input", () => {
    if (el.classList.contains("is-error")) validateIfVisible(id);
  });
});

const zoomMeetingIdHidden = document.getElementById("zoomMeetingId");
if (zoomMeetingIdHidden) {
  zoomMeetingIdHidden.addEventListener("change", () => validateIfVisible("zoomMeetingId"));
}

/* ----- Phone validation ----- */
if (phoneInput) {
  phoneInput.addEventListener("blur", () => {
    const valid = validators.phone();
    phoneInput.classList.toggle("is-error", !valid);
    phoneInput.classList.toggle("is-valid", valid);
    if (phoneWrapper) phoneWrapper.classList.toggle("is-error", !valid);
    if (phoneErr) phoneErr.classList.toggle("visible", !valid);
  });

  phoneInput.addEventListener("input", () => {
    if (phoneInput.classList.contains("is-error")) {
      const valid = validators.phone();
      phoneInput.classList.toggle("is-error", !valid);
      phoneInput.classList.toggle("is-valid", valid);
      if (phoneWrapper) phoneWrapper.classList.toggle("is-error", !valid);
      if (phoneErr) phoneErr.classList.toggle("visible", !valid);
    }
  });
}

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

/* ----- Error modal ----- */
const errModal = document.getElementById("errModal");
const errModalClose = document.getElementById("errModalClose");
const errModalDismiss = document.getElementById("errModalDismiss");

function showErrModal(msg) {
  const msgEl = document.getElementById("errModalMessage");
  if (msgEl) msgEl.textContent = msg;
  if (errModal) {
    errModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }
  if (errModalDismiss) errModalDismiss.focus();
}

function hideErrModal() {
  if (errModal) {
    errModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }
}

if (errModalClose) errModalClose.addEventListener("click", hideErrModal);
if (errModalDismiss) errModalDismiss.addEventListener("click", hideErrModal);
if (errModal) {
  errModal.addEventListener("click", function(e) {
    if (e.target === this) hideErrModal();
  });
}
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && errModal && !errModal.hasAttribute("hidden")) hideErrModal();
});

/* ----- Data privacy modal ----- */
const tcModal = document.getElementById("tcModal");
const tcCheckbox = document.getElementById("tcAccept");
const tcLink = document.getElementById("tcLink");
const tcErrMsg = document.getElementById("tcAccept-error");

function openTCModal() {
  if (tcModal) {
    tcModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    const confirmBtn = tcModal.querySelector(".tc-modal__confirm");
    if (confirmBtn) confirmBtn.focus();
  }
}

function closeTCModal() {
  if (tcModal) {
    tcModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }
  if (tcLink) {
    tcLink.focus();
  }
}

if (tcLink) {
  tcLink.addEventListener("click", (e) => {
    e.preventDefault();
    openTCModal();
  });
}

if (tcCheckbox) {
  tcCheckbox.addEventListener("click", (e) => {
    if (tcCheckbox.checked) {
      e.preventDefault();
      openTCModal();
    }
  });
}

const faoScrollBtn = document.getElementById("faoPrivacyScrollBtn");
if (faoScrollBtn) {
  faoScrollBtn.addEventListener("click", () => {
    const target = document.getElementById("faoDataPrivacyPolicy");
    const body   = document.getElementById("tcModalBody");
    if (target && body) {
      body.scrollTo({ top: target.offsetTop - body.offsetTop - 16, behavior: "smooth" });
    }
  });
}

const tcClose = document.getElementById("tcClose");
if (tcClose) tcClose.addEventListener("click", closeTCModal);

const tcCancel = document.getElementById("tcCancel");
if (tcCancel) tcCancel.addEventListener("click", closeTCModal);

const tcConfirm = document.getElementById("tcConfirm");
if (tcConfirm) {
  tcConfirm.addEventListener("click", () => {
    if (tcCheckbox) tcCheckbox.checked = true;
    if (tcErrMsg) tcErrMsg.classList.remove("visible");
    closeTCModal();
  });
}

if (tcModal) {
  tcModal.addEventListener("click", (e) => {
    if (e.target === tcModal) closeTCModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && tcModal && !tcModal.hasAttribute("hidden")) closeTCModal();
});

/* ----- Dynamic Zoom Meetings Loader ----- */
async function fetchZoomMeetings() {
  const container = document.getElementById("zoomSessionsContainer");
  const hiddenInput = document.getElementById("zoomMeetingId");
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

        const card = document.createElement("div");
        card.className = "zoom-session-card";
        card.dataset.id = m.meeting_id;
        card.dataset.label = m.display_name;

        card.innerHTML = `
          <span class="zoom-card-badge">Webinar Session</span>
          <div class="zoom-card-banner" style="background-image: url('${imgUrl}')">
            <div class="zoom-card-tick">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="zoom-card-body">
            <h4 class="zoom-card-title">${m.display_name}</h4>
            <p class="zoom-card-meta">Session ID: ${m.meeting_id}</p>
            <div class="zoom-card-checkbox-wrap" style="display: none;">
              <input type="checkbox" class="zoom-card-checkbox" value="${m.meeting_id}" data-label="${m.display_name}">
            </div>
          </div>
        `;

        // Handle card click (excluding direct checkbox click to avoid double-toggle)
        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("zoom-card-checkbox")) {
            return;
          }
          const checkbox = card.querySelector(".zoom-card-checkbox");
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change"));
          }
        });

        // Handle checkbox change
        const checkbox = card.querySelector(".zoom-card-checkbox");
        if (checkbox) {
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              card.classList.add("is-selected");
            } else {
              card.classList.remove("is-selected");
            }
            updateSelectedMeetings();
          });
        }

        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p class="conference-select__empty visible" style="color: var(--color-danger);">Failed to load online sessions.</p>';
    }
  } catch (err) {
    console.error("Error loading Zoom sessions:", err);
    container.innerHTML = '<p class="conference-select__empty visible" style="color: var(--color-danger);">Error loading online sessions.</p>';
  }
}

function updateSelectedMeetings() {
  const container = document.getElementById("zoomSessionsContainer");
  const hiddenInput = document.getElementById("zoomMeetingId");
  if (!container || !hiddenInput) return;

  const checkboxes = container.querySelectorAll(".zoom-card-checkbox");
  const selectedIds = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  hiddenInput.value = selectedIds.join(",");
  validateIfVisible("zoomMeetingId");
}

/* ----- Form submission ----- */
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  registrationForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const completeNameEl = document.getElementById("completeName");
    const emailEl = document.getElementById("email");
    const zoomMeetingIdEl = document.getElementById("zoomMeetingId");

    const results = [
      validateIfVisible("completeName"),
      validateIfVisible("email"),
      validateIfVisible("zoomMeetingId")
    ];

    const tcEl = document.getElementById("tcAccept");
    const tcErr = document.getElementById("tcAccept-error");
    if (tcEl && !tcEl.checked) {
      if (tcErr) tcErr.classList.add("visible");
      results.push(false);
    } else {
      if (tcErr) tcErr.classList.remove("visible");
      results.push(true);
    }

    const phoneValid = validators.phone();
    if (phoneInput) {
      phoneInput.classList.toggle("is-error", !phoneValid);
      phoneInput.classList.toggle("is-valid", phoneValid);
    }
    if (phoneWrapper) phoneWrapper.classList.toggle("is-error", !phoneValid);
    if (phoneErr) phoneErr.classList.toggle("visible", !phoneValid);
    results.push(phoneValid);

    if (results.includes(false)) {
      const firstErr = document.querySelector(".form-input.is-error");
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    const countryCode = "+" + iti.getSelectedCountryData().dialCode;

    // Parse completeName into first_name and last_name properties
    const nameParts = completeNameEl.value.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "Registrant";

    const fd = new FormData();
    fd.append("registration_type",   "participant");
    fd.append("prefix",              "");
    fd.append("speaker_type",        "");
    fd.append("first_name",          firstName);
    fd.append("middle_initial",      "");
    fd.append("last_name",           lastName);
    fd.append("suffix",              "");
    fd.append("full_name",           completeNameEl.value.trim());
    fd.append("age_range",           "");
    fd.append("gender",              "");
    fd.append("nationality",         "");
    fd.append("affiliation",         "");
    fd.append("affiliation_sub",     "");
    fd.append("affiliation_specify", "");
    fd.append("designation",         "");
    fd.append("media_queries",       "");
    fd.append("company",             "");
    fd.append("email",               emailEl.value.trim());
    fd.append("phone",               countryCode + phoneInput.value.trim());
    fd.append("attendance_mode",     "online");
    fd.append("attendance_days",     "");
    fd.append("address_country",     "");
    fd.append("address_state",       "");
    fd.append("address_street",      "");
    fd.append("address_city",        "");
    fd.append("address_zip",         "");
    fd.append("dietary",             "");
    fd.append("dietary_details",     "");
    fd.append("visa_assistance",     "0");
    fd.append("field_trip",          "");
    fd.append("seminar",             "");
    fd.append("zoom_meeting_id",     zoomMeetingIdEl.value);
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
}

/* ----- Reset ----- */
window.resetForm = function() {
  if (registrationForm) {
    registrationForm.reset();
    registrationForm.style.display = "block";
  }
  const confirmationPanel = document.getElementById("confirmationPanel");
  if (confirmationPanel) confirmationPanel.classList.remove("visible");

  document.querySelectorAll(".form-input").forEach(el => {
    el.classList.remove("is-error", "is-valid");
  });
  document.querySelectorAll(".form-error").forEach(el => el.classList.remove("visible"));
  if (phoneWrapper) phoneWrapper.classList.remove("is-error");

  const cards = document.querySelectorAll(".zoom-session-card");
  cards.forEach(c => c.classList.remove("is-selected"));
};

async function loadSystemSettings() {
  try {
    const res = await fetch('/v1/settings');
    const resData = await res.json();
    if (resData.success && resData.data) {
      const { site_name, site_subtitle, registration_enabled } = resData.data;

      // Update titles
      if (site_name) {
        document.title = `${site_name} Registration`;
        const siteNameTag = document.getElementById('siteNameTag');
        if (siteNameTag) siteNameTag.textContent = site_name;
      }
      if (site_subtitle) {
        const siteSubtitleText = document.getElementById('siteSubtitleText');
        if (siteSubtitleText) siteSubtitleText.textContent = site_subtitle;
      }

      // Check if registration is enabled
      if (!registration_enabled) {
        const form = document.getElementById('registrationForm');
        const closedNotice = document.getElementById('registrationClosedNotice');
        if (form) form.style.display = 'none';
        if (closedNotice) closedNotice.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Error loading public settings:', err);
  }
}

// Initial Call
loadSystemSettings();
fetchZoomMeetings();
initEventCountdown();

/* ----- Event Countdown Timer ----- */
function initEventCountdown() {
  const targetDate = new Date("2026-11-23T09:00:00+08:00").getTime();
  
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minsEl = document.getElementById("countdown-mins");
  const secsEl = document.getElementById("countdown-secs");
  
  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;
  
  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      clearInterval(timerInterval);
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minsEl.textContent = minutes.toString().padStart(2, '0');
    secsEl.textContent = seconds.toString().padStart(2, '0');
  }
  
  // Run immediately to avoid layout flashing
  updateCountdown();
  
  const timerInterval = setInterval(updateCountdown, 1000);
}

