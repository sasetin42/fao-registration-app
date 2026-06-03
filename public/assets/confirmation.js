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

/* ═══════════════════════════════════════════════════════════
   SUCCESS REGISTRATION MODAL — Enhanced Premium Version
   Works for both Online/Virtual and In-Person attendees.
═══════════════════════════════════════════════════════════ */

const successModal          = document.getElementById("successModal");
const successModalClose     = document.getElementById("successModalClose");
const successModalDismiss   = document.getElementById("successModalDismiss");
const successModalZoomContainer = document.getElementById("successModalZoomContainer");

/* ── Build Google Calendar URL + metadata for a Zoom meeting ── */
function getGoogleCalendarUrl(meeting) {
  let dates    = "20261123T010000Z/20261123T090000Z";
  let schedule = "Monday, November 23, 2026 | 09:00 AM – 05:00 PM (PHT / UTC+8)";
  let desc     = "Day 1 Session: Food Security and Nutrition";

  if (meeting.meeting_id === "98765432102" || String(meeting.topic).includes("Day 2")) {
    dates    = "20261124T010000Z/20261124T090000Z";
    schedule = "Tuesday, November 24, 2026 | 09:00 AM – 05:00 PM (PHT / UTC+8)";
    desc     = "Day 2 Session: Sustainable Agriculture Practices";
  } else if (meeting.meeting_id === "98765432103" || String(meeting.topic).includes("Day 3")) {
    dates    = "20261125T010000Z/20261125T090000Z";
    schedule = "Wednesday, November 25, 2026 | 09:00 AM – 05:00 PM (PHT / UTC+8)";
    desc     = "Day 3 Session: Digital Agriculture and Innovation";
  }

  const title = encodeURIComponent(`APSAM 2026 – ${meeting.topic || meeting.display_name}`);
  const details = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `📋 Session: ${meeting.display_name}\n` +
    `🆔 Zoom Meeting ID: ${formatMeetingId(meeting.meeting_id)}\n` +
    `🔗 Personal Join Link: ${meeting.join_url}\n\n` +
    `ℹ️ Please use your personal Zoom join link above to access this session.\n` +
    `📞 Dial-in numbers will be included in your Zoom confirmation email.\n\n` +
    `Organized by: Food and Agriculture Organization (FAO) of the United Nations\n` +
    `Contact: apsam2026@fao.org`
  );
  const location = encodeURIComponent("Online via Zoom — Asia-Pacific Conference on Sustainable Agricultural Mechanization");
  return {
    url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`,
    schedule,
    desc
  };
}

/* ── Format Zoom Meeting ID (e.g. 987 6543 2101) ── */
function formatMeetingId(id) {
  const s = String(id).replace(/\s/g, "");
  if (s.length === 11) return `${s.slice(0,3)} ${s.slice(3,7)} ${s.slice(7)}`;
  return s;
}

/* ── Populate the header attendee summary row ── */
function buildAttendeeRow() {
  const row = document.getElementById("successAttendeeRow");
  if (!row) return;
  const name  = escapeHTML((data.full_name || ((data.first_name || "") + " " + (data.last_name || ""))).trim());
  const email = escapeHTML(data.email || "");
  const mode  = data.attendance_mode === "online" ? "Online / Virtual" : "In-Person";
  const modeColor = data.attendance_mode === "online" ? "#2D8CFF" : "#2E9C4E";

  row.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:rgba(255,255,255,0.95);font-weight:600;">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ${name}
    </span>
    <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.72);">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      ${email}
    </span>
    <span style="margin-left:auto;background:${modeColor};color:#fff;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;white-space:nowrap;">${mode}</span>
  `;
}

/* ── Close modal ── */
function closeSuccessModal() {
  if (successModal) {
    successModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }
}

/* ════════════════════════════════════════════
   ONLINE / VIRTUAL — Premium Zoom Session Cards
════════════════════════════════════════════ */
function showSuccessModal(meetings) {
  if (!successModal || !successModalZoomContainer) return;

  buildAttendeeRow();

  /* Show "Add All to Calendar" button when multiple meetings */
  const addAllBtn = document.getElementById("successAddAllCalBtn");
  if (addAllBtn && meetings.length > 1) {
    addAllBtn.removeAttribute("hidden");
    addAllBtn.addEventListener("click", () => {
      meetings.forEach((m, i) => {
        const cal = getGoogleCalendarUrl(m);
        setTimeout(() => window.open(cal.url, "_blank", "noopener,noreferrer"), i * 450);
      });
    });
  }

  /* Update section label */
  const lblEl = document.getElementById("successSessionsLabel");
  if (lblEl) lblEl.textContent = `Your Online Sessions (${meetings.length})`;

  successModalZoomContainer.innerHTML = "";

  meetings.forEach((m, idx) => {
    const cal      = getGoogleCalendarUrl(m);
    const imgIndex = (idx % 4) + 1;
    const imgUrl   = `/assets/event_${imgIndex}.png`;
    const fmtId    = formatMeetingId(m.meeting_id);

    const card = document.createElement("div");
    card.className = "success-zoom-card";
    card.style.cssText = "background:#fff;border:1.5px solid #DDE4ED;border-radius:10px;overflow:hidden;";

    card.innerHTML = `
      <!-- ── Card top: image + session info ── -->
      <div style="display:flex;border-bottom:1px solid #EDF0F4;">
        <div style="width:82px;min-height:88px;background-image:url('${imgUrl}');background-size:cover;background-position:center;flex-shrink:0;"></div>
        <div style="flex:1;padding:13px 15px 11px;">
          <h4 style="font-size:13.5px;font-weight:700;color:#1C4767;margin:0 0 5px;line-height:1.35;">${escapeHTML(m.display_name)}</h4>
          <p style="font-size:12px;color:#116AAB;font-weight:600;margin:0 0 6px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" style="flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${cal.schedule}
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            <span style="font-size:11.5px;color:#3A3A3A;background:#F0F4F8;padding:3px 8px;border-radius:4px;font-family:monospace;font-weight:600;letter-spacing:0.3px;">ID: ${escapeHTML(fmtId)}</span>
            <button type="button" class="btn-copy-id" data-copy="${escapeHTML(m.meeting_id)}" title="Copy Meeting ID to clipboard" style="font-size:11px;background:none;border:1px solid #CDD4DB;border-radius:4px;padding:3px 8px;cursor:pointer;color:#545454;display:inline-flex;align-items:center;gap:3px;font-weight:600;transition:all 0.2s;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy ID
            </button>
          </div>
        </div>
      </div>

      <!-- ── Action buttons row ── -->
      <div style="padding:10px 14px;background:#FAFBFC;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid #EDF0F4;">
        <a href="${escapeHTML(m.join_url)}" target="_blank" rel="noopener noreferrer" class="success-action-btn" style="background:#2D8CFF;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="12" height="12" aria-hidden="true"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
          Join Zoom Meeting
        </a>
        <a href="${cal.url}" target="_blank" rel="noopener noreferrer" class="success-action-btn" style="background:#188038;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="12" height="12" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Add to Google Calendar
        </a>
        <button type="button" class="btn-copy-link success-action-btn" data-link="${escapeHTML(m.join_url)}" style="background:#fff;border:1.5px solid #CDD4DB;border-radius:6px;padding:7px 13px;font-size:12px;font-weight:600;cursor:pointer;color:#3A3A3A;display:inline-flex;align-items:center;gap:5px;transition:all 0.2s;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          Copy Join Link
        </button>
        <button type="button" class="btn-toggle-details" style="margin-left:auto;background:none;border:none;font-size:12px;font-weight:700;color:#116AAB;cursor:pointer;text-decoration:underline;padding:4px 0;white-space:nowrap;">More Details ▾</button>
      </div>

      <!-- ── Expandable details panel ── -->
      <div class="card-details-panel" style="display:none;padding:15px 16px;background:#F8FBFF;font-size:12.5px;line-height:1.65;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px 22px;">
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Session Description</p>
            <p style="margin:0;color:#545454;">${cal.desc}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Platform</p>
            <p style="margin:0;color:#545454;">Zoom Video Communications</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Zoom Passcode</p>
            <p style="margin:0;"><code style="background:#E8EDF2;padding:2px 7px;border-radius:4px;font-family:monospace;color:#116AAB;">Automated — No Passcode Required</code></p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Host</p>
            <p style="margin:0;color:#545454;">FAO of the United Nations</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Dial-in Numbers</p>
            <p style="margin:0;color:#545454;">+1 669 900 6833 (US) · +44 330 088 5830 (UK) · Full list sent to <strong>${escapeHTML(data.email)}</strong></p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Language</p>
            <p style="margin:0;color:#545454;">English · Simultaneous Interpretation Available</p>
          </div>
        </div>
      </div>
    `;

    /* Hook: Copy Meeting ID */
    card.querySelector(".btn-copy-id").addEventListener("click", function () {
      navigator.clipboard.writeText(this.getAttribute("data-copy")).then(() => {
        const orig = this.innerHTML;
        this.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#188038" stroke-width="2.5" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        this.style.color = "#188038";
        setTimeout(() => { this.innerHTML = orig; this.style.color = ""; }, 2200);
      });
    });

    /* Hook: Copy Join Link */
    card.querySelector(".btn-copy-link").addEventListener("click", function () {
      navigator.clipboard.writeText(this.getAttribute("data-link")).then(() => {
        const orig = this.innerHTML;
        this.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#188038" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> <span style="color:#188038">Copied!</span>`;
        setTimeout(() => { this.innerHTML = orig; }, 2200);
      });
    });

    /* Hook: Toggle Details */
    const toggleBtn    = card.querySelector(".btn-toggle-details");
    const detailsPanel = card.querySelector(".card-details-panel");
    toggleBtn.addEventListener("click", () => {
      const open = detailsPanel.style.display !== "none";
      detailsPanel.style.display = open ? "none" : "block";
      toggleBtn.textContent = open ? "More Details ▾" : "Hide Details ▴";
    });

    successModalZoomContainer.appendChild(card);
  });

  successModal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

/* ════════════════════════════════════════════
   IN-PERSON — Venue & Google Calendar Card
════════════════════════════════════════════ */
function showInPersonSuccessModal() {
  if (!successModal || !successModalZoomContainer) return;

  buildAttendeeRow();

  /* Update header texts */
  document.getElementById("successModalTitle").textContent    = "Registration Confirmed!";
  document.getElementById("successModalSubtitle").textContent = "APSAM 2026 · In-Person Attendance — Manila, Philippines";

  const lblEl = document.getElementById("successSessionsLabel");
  if (lblEl) lblEl.textContent = "Your Event Access Details";

  const daysText      = data.attendance_days ? formatText(data.attendance_days) : "All Conference Days (23–26 November 2026)";
  const dietaryDisplay = formatDietary(data.dietary) + (data.dietary_details ? ` (${data.dietary_details})` : "");

  /* Google Calendar URL */
  const calDates   = "20261123T010000Z/20261126T090000Z";
  const calTitle   = encodeURIComponent("APSAM 2026 — In-Person Conference, Manila");
  const calDetails = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `✅ Attendance Type: IN-PERSON\n` +
    `👤 Attendee: ${(data.full_name || ((data.first_name || "") + " " + (data.last_name || ""))).trim()}\n` +
    `📧 Email: ${data.email}\n` +
    `🏨 Venue: Sofitel Philippine Plaza Manila, CCP Complex, Roxas Boulevard, Pasay, Metro Manila, Philippines\n` +
    `📅 Dates: 23–26 November 2026\n\n` +
    `📋 Please present your QR code at the main registration desk to print your conference badge.\n\n` +
    `📞 Contact: apsam2026@fao.org | +63 2 8521 0000\n` +
    `Organized by: Food and Agriculture Organization (FAO) of the United Nations`
  );
  const calLocation  = encodeURIComponent("Sofitel Philippine Plaza Manila, CCP Complex, Roxas Boulevard, Pasay 1300, Metro Manila, Philippines");
  const calendarUrl  = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calDates}&details=${calDetails}&location=${calLocation}`;
  const mapsUrl      = "https://maps.google.com/?q=Sofitel+Philippine+Plaza+Manila,+CCP+Complex,+Roxas+Boulevard,+Pasay,+Metro+Manila";

  successModalZoomContainer.innerHTML = `
    <div class="success-zoom-card" style="background:#fff;border:1.5px solid #DDE4ED;border-radius:10px;overflow:hidden;">

      <!-- Card top: image + venue info -->
      <div style="display:flex;border-bottom:1px solid #EDF0F4;">
        <div style="width:82px;min-height:88px;background-image:url('/assets/01-apsam-main-visual-landscape.jpg');background-size:cover;background-position:center;flex-shrink:0;"></div>
        <div style="flex:1;padding:13px 15px 11px;">
          <h4 style="font-size:13.5px;font-weight:700;color:#1C4767;margin:0 0 5px;line-height:1.35;">In-Person Conference Access</h4>
          <p style="font-size:12px;color:#116AAB;font-weight:600;margin:0 0 4px;display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            23–26 November 2026
          </p>
          <p style="font-size:11.5px;color:#545454;margin:0;display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#116AAB" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            Sofitel Philippine Plaza Manila, Pasay, Metro Manila
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="padding:10px 14px;background:#FAFBFC;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid #EDF0F4;">
        <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer" class="success-action-btn" style="background:#188038;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="12" height="12" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Add to Google Calendar
        </a>
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="success-action-btn" style="background:#1A73E8;color:#fff;border:none;border-radius:6px;padding:7px 13px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="12" height="12" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          View on Google Maps
        </a>
        <button type="button" class="btn-toggle-details-ip" style="margin-left:auto;background:none;border:none;font-size:12px;font-weight:700;color:#116AAB;cursor:pointer;text-decoration:underline;padding:4px 0;white-space:nowrap;">More Details ▾</button>
      </div>

      <!-- Expandable details panel -->
      <div class="ip-details-panel" style="display:none;padding:15px 16px;background:#F8FBFF;font-size:12.5px;line-height:1.65;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px 22px;">
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Registered Days</p>
            <p style="margin:0;color:#545454;">${escapeHTML(daysText)}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Dietary Preference</p>
            <p style="margin:0;color:#545454;">${escapeHTML(dietaryDisplay)}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Visa Assistance</p>
            <p style="margin:0;color:#545454;">${data.visa_assistance == "1" ? "✔ Requested — Our team will contact you" : "Not Requested"}</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Venue Address</p>
            <p style="margin:0;color:#545454;">Sofitel Philippine Plaza Manila, CCP Complex, Roxas Blvd., Pasay 1300, Metro Manila, Philippines</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Check-in</p>
            <p style="margin:0;color:#545454;">Present the QR code shown on this page at the main registration desk to receive your conference badge.</p>
          </div>
          <div>
            <p style="margin:0 0 2px;font-weight:700;color:#1C4767;font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;">Contact</p>
            <p style="margin:0;color:#545454;">apsam2026@fao.org · +63 2 8521 0000</p>
          </div>
        </div>
      </div>
    </div>
  `;

  /* Hook: Toggle in-person details */
  const ipToggle = successModalZoomContainer.querySelector(".btn-toggle-details-ip");
  const ipPanel  = successModalZoomContainer.querySelector(".ip-details-panel");
  ipToggle.addEventListener("click", () => {
    const open = ipPanel.style.display !== "none";
    ipPanel.style.display = open ? "none" : "block";
    ipToggle.textContent  = open ? "More Details ▾" : "Hide Details ▴";
  });

  /* Update notice text for in-person */
  const noticeEl = document.getElementById("successNoticeText");
  if (noticeEl) noticeEl.textContent = "Please bring your QR code (printed or on your phone) to the event venue for check-in and badge printing. Take a screenshot for your records.";

  successModal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

/* ════════════════════════════════════════════
   INLINE ZOOM NOTICE — persistent on-page cards
   (virtual attendees only, below the QR code)
════════════════════════════════════════════ */
function renderInlineZoomNotice(meetings) {
  const container = document.createElement("div");
  container.style.marginTop = "2rem";
  container.style.textAlign = "left";

  const cardsHtml = meetings.map((m, idx) => {
    const cal      = getGoogleCalendarUrl(m);
    const imgIndex = (idx % 4) + 1;
    const imgUrl   = `/assets/event_${imgIndex}.png`;
    const fmtId    = formatMeetingId(m.meeting_id);

    return `
      <div class="da-notice" style="margin-top:1rem;border-left-color:#2D8CFF;background:#F0F7FF;border-color:#D2E7FF;padding:16px;">
        <div style="display:flex;gap:14px;width:100%;align-items:flex-start;flex-wrap:wrap;">
          <div style="width:58px;height:58px;border-radius:var(--radius-sm);background-image:url('${imgUrl}');background-size:cover;background-position:center;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.08);"></div>
          <div style="flex:1;min-width:200px;">
            <p style="margin:0;font-weight:700;font-size:14px;color:var(--color-primary-dark);">${escapeHTML(m.display_name)}</p>
            <p style="margin:2px 0 2px;font-size:11.5px;color:var(--color-text-muted);">Meeting ID: <code style="font-family:monospace;color:#116AAB;font-size:12px;">${escapeHTML(fmtId)}</code></p>
            <p style="margin:0 0 8px;font-size:12.5px;color:var(--color-primary);font-weight:600;">${cal.schedule}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <a href="${escapeHTML(m.join_url)}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin:0;padding:6px 12px;font-size:11.5px;background:#2D8CFF;border:none;display:inline-flex;align-items:center;gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="11" height="11" aria-hidden="true"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
                Join Zoom
              </a>
              <a href="${cal.url}" target="_blank" rel="noopener noreferrer" class="da-notice__btn" style="margin:0;padding:6px 12px;font-size:11.5px;background:var(--color-success);border:none;display:inline-flex;align-items:center;gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" width="11" height="11" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Add to Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <h3 style="font-size:15px;font-weight:700;color:var(--color-primary-dark);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.5px;">Your Registered Online Sessions</h3>
    ${cardsHtml}
  `;

  const actions = document.querySelector("#confirmationPanel .confirmation-actions");
  document.getElementById("confirmationPanel").insertBefore(container, actions);
}

/* ── Initialize ── */
async function initZoomModalAndNotice() {
  if (data.attendance_mode === "online") {
    if (!data.zoom_meeting_id) return;

    const meetingIds = String(data.zoom_meeting_id).split(",").map(s => s.trim());
    const joinUrls   = data.zoom_join_url ? String(data.zoom_join_url).split(",").map(s => s.trim()) : [];

    let activeMeetings = [];
    try {
      const res  = await fetch("/v1/zoom-meetings");
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
        meeting_id   : mId,
        display_name : matched ? matched.display_name : `Zoom Session (${mId})`,
        topic        : matched ? matched.topic        : `Session ${mId}`,
        join_url     : joinUrls[index] || "#"
      };
    });

    showSuccessModal(userMeetings);
    renderInlineZoomNotice(userMeetings);

  } else {
    showInPersonSuccessModal();
  }
}

initZoomModalAndNotice();

/* ── Modal event listeners ── */
if (successModalClose)   successModalClose.addEventListener("click", closeSuccessModal);
if (successModalDismiss) successModalDismiss.addEventListener("click", closeSuccessModal);
if (successModal) {
  successModal.addEventListener("click", function (e) {
    if (e.target === this) closeSuccessModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && successModal && !successModal.hasAttribute("hidden")) {
    closeSuccessModal();
  }
});

/* ── Print / Save as PDF ── */
const successPrintBtn = document.getElementById("successPrintBtn");
if (successPrintBtn) {
  successPrintBtn.addEventListener("click", () => window.print());
}

/* ── Wire QR download button ── */
document.getElementById("downloadQrBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(qrSrc);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob      = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a         = document.createElement("a");
    a.href     = objectUrl;
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
