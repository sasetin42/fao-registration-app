/* ═══════════════════════════════════════════════════════════
   CONFIRMATION PAGE — confirmation.js
   Reads registration data directly from the JWT token
   passed as ?token= in the URL query string.
═══════════════════════════════════════════════════════════ */

/* ── JWT decoder (client-side, display only — no verification) ── */
function parseJWT(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/* ── Guard: no token or invalid → back to registration ── */
const rawToken = new URLSearchParams(window.location.search).get("token");

if (!rawToken) {
  window.location.replace("/fao_registration");
}

const data = parseJWT(rawToken);

if (!data) {
  window.location.replace("/fao_registration");
}

/* ── XSS helper ── */
function escapeHTML(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str ?? "")));
  return d.innerHTML;
}

function formatText(value) {
  return String(value ?? "")
    .split("-")
    .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(" ");
}

/* ── Attendance mode label map ── */
const attendanceModeLabels = {
  "in-person" : "In-Person",
  "online"    : "Online / Virtual",
};

function formatAttendanceMode(slug) {
  return attendanceModeLabels[slug] ?? slug;
}

/* ── Seminar label map ── */
const seminarLabels = {
  "food-security-nutrition"  : "Food Security and Nutrition",
  "sustainable-agriculture"  : "Sustainable Agriculture Practices",
  "climate-smart-farming"    : "Climate-Smart Farming",
  "digital-agriculture"      : "Digital Agriculture and Innovation",
  "rural-development"        : "Rural Development and Livelihoods",
  "water-land-management"    : "Water and Land Management",
  "agroforestry"             : "Agroforestry and Biodiversity",
  "fisheries-aquaculture"    : "Fisheries and Aquaculture",
};

function formatSeminar(slug) {
  return seminarLabels[slug] ?? slug;
}

function formatSeminars(value) {
  if (!value) return "";
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(formatSeminar)
    .join(", ");
}

/* ── Dietary label map (slug → display) ── */
const dietaryLabels = {
  "no-preference" : "No Preference",
  "vegan"         : "Vegan",
  "vegetarian"    : "Vegetarian",
  "halal"         : "Halal",
  "kosher"        : "Kosher",
  "gluten-free"   : "Gluten-Free",
  "meat"          : "Meat / Standard",
  "pescatarian"   : "Pescatarian",
  "dairy-free"    : "Dairy-Free",
};

function formatDietary(slug) {
  return dietaryLabels[slug] ?? slug;
}

/* ── Format address block (Country first per form order) ── */
const addrParts = [
  data.address_country,
  data.address_street,
  [data.address_city, data.address_state].filter(Boolean).join(", "),
  data.address_zip,
].filter(Boolean);
const addrBlock = addrParts.join("\n");

/* ── Populate QR code + reference ── */
const qrSrc = `/v1/qr?attendance_key=${encodeURIComponent(data.attendance_key)}`;

document.getElementById("confirmationRef").innerHTML = `
  <span class="confirmation-ref__label">Your Check-in QR Code</span>
  <img class="confirmation-ref__qr" src="${qrSrc}" alt="QR code for attendance check-in" />
  <span class="confirmation-ref__note">Present this QR code at the event entrance for check-in</span>
`;

/* ── Success Registration Modal & Calendar Functions ── */
const successModal = document.getElementById("successModal");
const successModalClose = document.getElementById("successModalClose");
const successModalDismiss = document.getElementById("successModalDismiss");
const successModalZoomContainer = document.getElementById("successModalZoomContainer");

function getGoogleCalendarUrl(meeting) {
  let dates = "20261123T010000Z/20261123T090000Z"; // Default Day 1
  let schedule = "Monday, November 23, 2026 | 09:00 AM - 05:00 PM (PST / UTC+8)";
  let desc = "Day 1 Session: Food Security and Nutrition";

  if (meeting.meeting_id === "98765432102" || String(meeting.topic).includes("Day 2")) {
    dates = "20261124T010000Z/20261124T090000Z";
    schedule = "Tuesday, November 24, 2026 | 09:00 AM - 05:00 PM (PST / UTC+8)";
    desc = "Day 2 Session: Sustainable Agriculture Practices";
  } else if (meeting.meeting_id === "98765432103" || String(meeting.topic).includes("Day 3")) {
    dates = "20261125T010000Z/20261125T090000Z";
    schedule = "Wednesday, November 25, 2026 | 09:00 AM - 05:00 PM (PST / UTC+8)";
    desc = "Day 3 Session: Digital Agriculture and Innovation";
  }

  const title = encodeURIComponent(`APSAM 2026 - ${meeting.topic || meeting.display_name}`);
  const details = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `Session: ${meeting.display_name}\n` +
    `Zoom Meeting ID: ${meeting.meeting_id}\n` +
    `Join Link: ${meeting.join_url}\n\n` +
    `Please join the Zoom session using your personal access link above.\n\n` +
    `Food and Agriculture Organization (FAO) of the United Nations.`
  );
  const location = encodeURIComponent("Online via Zoom");
  return {
    url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`,
    schedule,
    desc
  };
}

function showSuccessModal(meetings) {
  if (!successModal || !successModalZoomContainer) return;

  successModalZoomContainer.innerHTML = "";
  meetings.forEach((m, idx) => {
    const calendarData = getGoogleCalendarUrl(m);
    const imgIndex = (idx % 4) + 1;
    const imgUrl = `/assets/event_${imgIndex}.png`;

    const card = document.createElement("div");
    card.className = "zoom-card-modal";
    card.style.cssText = "background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 12px; transition: all 0.2s ease;";
    card.innerHTML = `
      <div style="display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--color-border-light);">
        <div style="width: 72px; height: 72px; border-radius: var(--radius-sm); background-image: url('${imgUrl}'); background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"></div>
        <div style="flex: 1; min-width: 0; text-align: left;">
          <h4 style="font-size: 14.5px; font-weight: 700; color: var(--color-primary-dark); margin: 0 0 4px;">${escapeHTML(m.display_name)}</h4>
          <p style="font-size: 12.5px; color: var(--color-primary); font-weight: 600; margin: 0 0 4px; display: flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${calendarData.schedule}
          </p>
          <p style="font-size: 12px; color: var(--color-text-muted); margin: 0;">Meeting ID: <strong style="font-family: monospace; color: var(--color-text);">${escapeHTML(m.meeting_id)}</strong></p>
        </div>
      </div>
      <div style="background-color: var(--color-bg); padding: 12px 16px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-start;">
        <a href="${escapeHTML(m.join_url)}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin: 0; padding: 6px 12px; font-size: 12px; background-color: #2D8CFF; border: none; display: inline-flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
          Join Zoom
        </a>
        <a href="${calendarData.url}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin: 0; padding: 6px 12px; font-size: 12px; background-color: var(--color-success); border: none; display: inline-flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Add to Calendar
        </a>
        <button type="button" class="btn-copy" data-link="${escapeHTML(m.join_url)}" style="margin: 0; padding: 6px 12px; font-size: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: #fff; cursor: pointer; color: var(--color-text); font-weight: 600; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy Link
        </button>
        <button type="button" class="btn-toggle-details" style="margin-left: auto; background: none; border: none; font-size: 12px; font-weight: 600; color: var(--color-primary); cursor: pointer; text-decoration: underline;">
          More Details
        </button>
      </div>
      <div class="card-details-panel" style="display: none; padding: 16px; background-color: #fff; border-top: 1px solid var(--color-border-light); font-size: 13px; line-height: 1.6; text-align: left;">
        <p style="margin-bottom: var(--spacing-sm);"><strong>Session Description:</strong> ${calendarData.desc}</p>
        <p style="margin-bottom: var(--spacing-sm);"><strong>Zoom Password:</strong> <code style="background-color: var(--color-border-light); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Not Required / Automated Join</code></p>
        <p style="margin-bottom: 0;"><strong>Dial-in Numbers:</strong> Available in the Zoom confirmation email sent to <strong style="color: var(--color-primary-dark);">${escapeHTML(data.email)}</strong>.</p>
      </div>
    `;

    // Hook copy button
    const copyBtn = card.querySelector(".btn-copy");
    copyBtn.addEventListener("click", () => {
      const link = copyBtn.getAttribute("data-link");
      navigator.clipboard.writeText(link).then(() => {
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
          <span style="color: var(--color-success)">Copied!</span>
        `;
        setTimeout(() => { copyBtn.innerHTML = origText; }, 2000);
      });
    });

    // Hook toggle details
    const toggleBtn = card.querySelector(".btn-toggle-details");
    const detailsPanel = card.querySelector(".card-details-panel");
    toggleBtn.addEventListener("click", () => {
      const isVisible = detailsPanel.style.display !== "none";
      detailsPanel.style.display = isVisible ? "none" : "block";
      toggleBtn.textContent = isVisible ? "More Details" : "Hide Details";
    });

    successModalZoomContainer.appendChild(card);
  });

  successModal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}function closeSuccessModal() {
  if (successModal) {
    successModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }
}

function showInPersonSuccessModal() {
  if (!successModal || !successModalZoomContainer) return;

  const dates = "20261123T010000Z/20261126T090000Z";
  const title = encodeURIComponent("Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)");
  const details = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `You are registered for IN-PERSON attendance.\n` +
    `Venue: Manila, Philippines\n` +
    `Dates: 23-26 November 2026\n\n` +
    `Please present your check-in QR code at the event entrance for admission.\n\n` +
    `Food and Agriculture Organization (FAO) of the United Nations.`
  );
  const location = encodeURIComponent("Manila, Philippines");
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

  // Get selected days
  const daysText = data.attendance_days ? formatText(data.attendance_days) : "All Days";

  successModalZoomContainer.innerHTML = `
    <div class="zoom-card-modal" style="background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 12px; transition: all 0.2s ease;">
      <div style="display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--color-border-light); align-items: flex-start;">
        <div style="width: 72px; height: 72px; border-radius: var(--radius-sm); background-image: url('/assets/01-apsam-main-visual-landscape.jpg'); background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"></div>
        <div style="flex: 1; min-width: 0; text-align: left;">
          <h4 style="font-size: 14.5px; font-weight: 700; color: var(--color-primary-dark); margin: 0 0 4px;">In-Person Participant Access</h4>
          <p style="font-size: 12.5px; color: var(--color-primary); font-weight: 600; margin: 0 0 4px; display: flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            23-26 November 2026 | Manila, Philippines
          </p>
          <p style="font-size: 12px; color: var(--color-text-muted); margin: 0;">Registered Days: <strong style="color: var(--color-text);">${escapeHTML(daysText)}</strong></p>
        </div>
      </div>
      <div style="background-color: var(--color-bg); padding: 12px 16px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-start;">
        <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin: 0; padding: 6px 12px; font-size: 12px; background-color: var(--color-success); border: none; display: inline-flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Add to Google Calendar
        </a>
        <button type="button" class="btn-toggle-details" style="margin-left: auto; background: none; border: none; font-size: 12px; font-weight: 600; color: var(--color-primary); cursor: pointer; text-decoration: underline;">
          More Details
        </button>
      </div>
      <div class="card-details-panel" style="display: none; padding: 16px; background-color: #fff; border-top: 1px solid var(--color-border-light); font-size: 13px; line-height: 1.6; text-align: left;">
        <p style="margin-bottom: var(--spacing-sm);"><strong>Attendee:</strong> ${escapeHTML(data.full_name || (data.first_name + ' ' + data.last_name))}</p>
        <p style="margin-bottom: var(--spacing-sm);"><strong>Dietary Preference:</strong> ${escapeHTML(formatDietary(data.dietary))}${data.dietary_details ? ' (' + escapeHTML(data.dietary_details) + ')' : ''}</p>
        <p style="margin-bottom: var(--spacing-sm);"><strong>Visa Assistance:</strong> ${data.visa_assistance == "1" ? "Requested (Our team will contact you)" : "Not Requested"}</p>
        <p style="margin-bottom: 0;"><strong>Check-in Requirement:</strong> Please present the QR code rendered behind this modal at the main registration desk to print your badge.</p>
      </div>
    </div>
  `;

  // Hook toggle details
  const toggleBtn = successModalZoomContainer.querySelector(".btn-toggle-details");
  const detailsPanel = successModalZoomContainer.querySelector(".card-details-panel");
  toggleBtn.addEventListener("click", () => {
    const isVisible = detailsPanel.style.display !== "none";
    detailsPanel.style.display = isVisible ? "none" : "block";
    toggleBtn.textContent = isVisible ? "More Details" : "Hide Details";
  });

  // Update title/text for in-person context
  document.getElementById("successModalTitle").textContent = "REGISTRATION CONFIRMED!";
  document.getElementById("successModalBody").querySelector("h4").textContent = "In-Person Event Access & Schedule";
  document.getElementById("successModalBody").querySelector("p").textContent = "Your details have been successfully received and are pending administrator review.";

  successModal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

function renderInlineZoomNotice(meetings) {
  const container = document.createElement("div");
  container.style.marginTop = "2rem";
  container.style.textAlign = "left";
  
  let cardsHtml = meetings.map((m, idx) => {
    const calendarData = getGoogleCalendarUrl(m);
    const imgIndex = (idx % 4) + 1;
    const imgUrl = `/assets/event_${imgIndex}.png`;
    
    return `
      <div class="da-notice" style="margin-top: 1rem; border-left-color: #2D8CFF; background-color: #F0F7FF; border-color: #D2E7FF; padding: 16px;">
        <div style="display: flex; gap: 16px; width: 100%; align-items: flex-start; flex-wrap: wrap;">
          <div style="width: 60px; height: 60px; border-radius: var(--radius-sm); background-image: url('${imgUrl}'); background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"></div>
          <div style="flex: 1; min-width: 200px;">
            <p style="margin: 0; font-weight: 700; font-size: 14px; color: var(--color-primary-dark);">${escapeHTML(m.display_name)}</p>
            <p style="margin: 2px 0 6px; font-size: 12.5px; color: var(--color-primary); font-weight: 600;">${calendarData.schedule}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <a href="${escapeHTML(m.join_url)}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin: 0; padding: 6px 12px; font-size: 11.5px; background-color: #2D8CFF; border: none; display: inline-flex; align-items: center; gap: 4px;">Join Zoom</a>
              <a href="${calendarData.url}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin: 0; padding: 6px 12px; font-size: 11.5px; background-color: var(--color-success); border: none; display: inline-flex; align-items: center; gap: 4px;">Add to Calendar</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <h3 style="font-size: 15px; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Your Registered Online Sessions</h3>
    ${cardsHtml}
  `;

  const actions = document.querySelector("#confirmationPanel .confirmation-actions");
  document.getElementById("confirmationPanel").insertBefore(container, actions);
}

async function initZoomModalAndNotice() {
  if (data.attendance_mode === "online") {
    if (!data.zoom_meeting_id) return;
    const meetingIds = String(data.zoom_meeting_id).split(",").map(s => s.trim());
    const joinUrls = data.zoom_join_url ? String(data.zoom_join_url).split(",").map(s => s.trim()) : [];

    let activeMeetings = [];
    try {
      const res = await fetch("/v1/zoom-meetings");
      const json = await res.json();
      if (json.success && json.data && json.data.meetings) {
        activeMeetings = json.data.meetings;
      }
    } catch (err) {
      console.error("Failed to fetch zoom meetings metadata:", err);
    }

    const userMeetings = meetingIds.map((mId, index) => {
      const matched = activeMeetings.find(m => String(m.meeting_id) === mId);
      return {
        meeting_id: mId,
        display_name: matched ? matched.display_name : `Zoom Session (${mId})`,
        topic: matched ? matched.topic : `Session ${mId}`,
        join_url: joinUrls[index] || "#"
      };
    });

    // 1. Show the Modal overlay with complete Zoom details and Google Calendar integration
    showSuccessModal(userMeetings);

    // 2. Insert inline list for persistent visibility
    renderInlineZoomNotice(userMeetings);
  } else {
    // Show in-person success details modal
    showInPersonSuccessModal();
  }
}

// Initialize Success Modal & Notice
initZoomModalAndNotice();

if (successModalClose) successModalClose.addEventListener("click", closeSuccessModal);
if (successModalDismiss) successModalDismiss.addEventListener("click", closeSuccessModal);
if (successModal) {
  successModal.addEventListener("click", function(e) {
    if (e.target === this) closeSuccessModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && successModal && !successModal.hasAttribute("hidden")) {
    closeSuccessModal();
  }
});

/* ── Wire download button ── */
document.getElementById("downloadQrBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(qrSrc);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `fao-qr-${String(data.attendance_key)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("QR download failed:", err);
  }
});


/* ── DA Form notice for international delegates ── */
const isInternational = data.nationality && data.nationality !== "philippines";

if (isInternational) {
  const daNotice = document.createElement("div");
  daNotice.className = "da-notice";
  daNotice.innerHTML = `
    <div class="da-notice__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </div>
    <div class="da-notice__body">
      <p class="da-notice__title">Additional Form Required</p>
      <p class="da-notice__text">
        As an international delegate, you are required to complete the
        <strong>Department of Agriculture (DA) Registration Form</strong> for
        biosecurity and coordination purposes prior to the event.
      </p>
      <a
        href="#"
        class="da-notice__btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fill up the DA form (opens in new tab)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" width="15" height="15" aria-hidden="true">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Fill Up DA Form
      </a>
    </div>
  `;
  const actions = document.querySelector("#confirmationPanel .confirmation-actions");
  document.getElementById("confirmationPanel").insertBefore(daNotice, actions);
}

/* ── "Back to Registration" — no session to clear anymore ── */
// Nothing extra needed, href on the button handles navigation.

/* ═══════════════════════════════════════════════════════════
   HAMBURGER / MOBILE NAV
   (self-contained — no dependency on registration.js)
═══════════════════════════════════════════════════════════ */
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

function closeMobileNav() {
  navToggle.classList.remove("is-open");
  mobileNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
  mobileNav.setAttribute("hidden", "");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.classList.toggle("is-open");
  mobileNav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  if (isOpen) {
    mobileNav.removeAttribute("hidden");
  } else {
    mobileNav.setAttribute("hidden", "");
  }
});

/* Close on outside click */
document.addEventListener("click", (e) => {
  if (!navToggle.contains(e.target) && !mobileNav.contains(e.target)) {
    closeMobileNav();
  }
});

/* Close on Escape */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.classList.contains("is-open")) {
    closeMobileNav();
    navToggle.focus();
  }
});

/* Auto-hide when viewport expands to desktop */
const desktopMQ = window.matchMedia("(min-width: 769px)");
const onBreakpoint = (e) => { if (e.matches) closeMobileNav(); };
if (desktopMQ.addEventListener) {
  desktopMQ.addEventListener("change", onBreakpoint);
} else {
  desktopMQ.addListener(onBreakpoint); // Safari < 14 fallback
}
