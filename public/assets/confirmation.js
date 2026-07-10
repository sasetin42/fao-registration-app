/* ═══════════════════════════════════════════════════════════
   CONFIRMATION PAGE — confirmation.js
   Reads JWT from ?token= and builds the full Success Page.
   No modal — everything renders directly on the page.
═══════════════════════════════════════════════════════════ */

/* ── JWT decoder (client-side, display-only — no signature check) ── */
function parseJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    if (!payload) return null;
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) {
      base64 += "==";
    } else if (pad === 3) {
      base64 += "=";
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (err) {
    console.error("parseJWT failed:", err);
    return null;
  }
}

/* ── Guard: no token or invalid → back to registration ── */
const rawToken = new URLSearchParams(window.location.search).get("token");
if (!rawToken) {
  window.location.replace("/fao_registration");
  throw new Error("Redirecting: token not found");
}
const data = parseJWT(rawToken);
if (!data) {
  window.location.replace("/fao_registration");
  throw new Error("Redirecting: invalid token payload");
}

/* ═══════════════════════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════════════════════ */
function escapeHTML(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str ?? "")));
  return d.innerHTML;
}
function formatText(value) {
  return String(value ?? "")
    .split("-")
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1) : p)
    .join(" ");
}
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
  if (!slug) return "No Preference";
  return dietaryLabels[slug] ?? formatText(slug);
}

function formatMeetingId(id) {
  const s = String(id).replace(/\s/g, "");
  return s.length === 11 ? `${s.slice(0,3)} ${s.slice(3,7)} ${s.slice(7)}` : s;
}

function extractPasscode(joinUrl) {
  try {
    const url = new URL(joinUrl);
    const pwd = url.searchParams.get("pwd");
    if (pwd) return pwd;
  } catch (e) {}
  return "FAO2026";
}

function fullName() {
  return ((data.full_name || ((data.first_name || "") + " " + (data.last_name || ""))).trim());
}

/* ── Google Calendar URL builder for a Zoom meeting ── */
function getCalendarUrl(meeting) {
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

  const title   = encodeURIComponent(`APSAM 2026 – ${meeting.topic || meeting.display_name}`);
  const details = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `📋 Session: ${meeting.display_name}\n` +
    `🆔 Zoom Meeting ID: ${formatMeetingId(meeting.meeting_id)}\n` +
    `🔗 Personal Join Link: ${meeting.join_url}\n\n` +
    `ℹ️ Use your personal Zoom link above to access this session.\n` +
    `📞 Dial-in numbers will be included in your Zoom confirmation email.\n\n` +
    `Organized by: Food and Agriculture Organization (FAO) of the United Nations\n` +
    `Contact: apsam2026@fao.org`
  );
  const location = encodeURIComponent("Online via Zoom – APSAM 2026");
  return {
    url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`,
    schedule,
    desc
  };
}

/* ═══════════════════════════════════════════════════════════
   1. BUILD HERO
═══════════════════════════════════════════════════════════ */
function buildHero() {
  const isOnline  = data.attendance_mode === "online";
  const name      = escapeHTML(fullName());
  const email     = escapeHTML(data.email || "");
  const modeLabel = isOnline ? "Online / Virtual" : "In-Person";
  const modeBg    = isOnline ? "#2D8CFF" : "#2E9C4E";

  /* Title / subtitle */
  if (!isOnline) {
    document.getElementById("sp-hero-title").textContent = "Registration Confirmed!";
    document.getElementById("sp-hero-sub").textContent   = "APSAM 2026 · In-Person Attendance — Manila, Philippines";
  }

  /* Attendee pills */
  document.getElementById("sp-hero-pills").innerHTML = `
    <span class="sp-hero__pill">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ${name}
    </span>
    <span class="sp-hero__pill">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      ${email}
    </span>
    <span class="sp-hero__badge" style="background:${modeBg};">${modeLabel}</span>
  `;

  /* Attendance key ref */
  if (data.attendance_key) {
    const refEl = document.getElementById("sp-hero-ref");
    const keyEl = document.getElementById("sp-hero-key");
    if (refEl && keyEl) {
      keyEl.textContent = data.attendance_key;
      refEl.removeAttribute("hidden");
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   2. BUILD QR SECTION (sidebar)
═══════════════════════════════════════════════════════════ */
let qrSrc = "";
function buildQrSection() {
  qrSrc = `/v1/qr?attendance_key=${encodeURIComponent(data.attendance_key)}`;
  document.getElementById("confirmationRef").innerHTML = `
    <a href="${qrSrc}" target="_blank" title="Open QR Code in new tab">
      <img class="sp-qr-card__img" id="qrImage" src="${qrSrc}"
           alt="QR code for attendance check-in at APSAM 2026" style="cursor: pointer;" />
    </a>
  `;
}

/* ═══════════════════════════════════════════════════════════
   3. BUILD INFO CARD (sidebar)
═══════════════════════════════════════════════════════════ */
function buildInfoCard() {
  const isOnline = data.attendance_mode === "online";
  const el = document.getElementById("sp-info-list");
  if (!el) return;
  const items = isOnline ? [
    `Save your personal Zoom join links from the session cards below.`,
    `A confirmation email was sent to <strong>${escapeHTML(data.email)}</strong>.`,
    `Download your QR code and keep it accessible on your device.`,
    `For technical issues, email <strong>apsam2026@fao.org</strong>.`,
    `Join Zoom at least <strong>5 minutes</strong> before session start.`,
  ] : [
    `Present your QR code at the venue registration desk on arrival.`,
    `A confirmation email was sent to <strong>${escapeHTML(data.email)}</strong>.`,
    `Download your QR code and keep it on your phone or printed.`,
    `Venue: <strong>Sofitel Philippine Plaza Manila</strong>, Pasay, Manila.`,
    `For assistance, contact <strong>apsam2026@fao.org</strong>.`,
  ];
  el.innerHTML = items.map(i => `<li>${i}</li>`).join("");
}

/* ═══════════════════════════════════════════════════════════
   4a. RENDER ONLINE / VIRTUAL SESSIONS
═══════════════════════════════════════════════════════════ */
function renderOnlineSessions(meetings) {
  /* Section title */
  const titleEl = document.getElementById("sp-sessions-title");
  if (titleEl) titleEl.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/>
      <rect x="3" y="6" width="12" height="12" rx="2" ry="2"/>
    </svg>
    Your Online Sessions (${meetings.length})
  `;

  /* Add All to Calendar — show in header row when ≥2 sessions */
  if (meetings.length > 1) {
    const headSlot = document.getElementById("sp-add-all-head");
    if (headSlot) {
      headSlot.removeAttribute("hidden");
      headSlot.innerHTML = `
        <button type="button" id="addAllCalBtn" class="sp-btn sp-btn--cal" style="font-size:12px;padding:6px 12px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"
               width="12" height="12" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Add All to Google Calendar
        </button>
      `;
      document.getElementById("addAllCalBtn").addEventListener("click", () => {
        meetings.forEach((m, i) => {
          const cal = getCalendarUrl(m);
          setTimeout(() => window.open(cal.url, "_blank", "noopener,noreferrer"), i * 480);
        });
      });
    }
  }

  /* Session cards */
  const panel = document.getElementById("sp-sessions-panel");
  panel.innerHTML = "";

  meetings.forEach((m, idx) => {
    const cal      = getCalendarUrl(m);
    const imgIndex = (idx % 4) + 1;
    const fmtId    = formatMeetingId(m.meeting_id);

    const card = document.createElement("div");
    card.className = "sp-card";
    card.style.animationDelay = `${idx * 0.08}s`;
    card.innerHTML = `
      <!-- Top: image + info -->
      <div class="sp-card__top">
        <div class="sp-card__img" style="background-image:url('/assets/event_${imgIndex}.png');" role="img" aria-label="Session banner"></div>
        <div class="sp-card__info">
          <h3 class="sp-card__name">${escapeHTML(m.display_name)}</h3>
          <p class="sp-card__date">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${cal.schedule}
          </p>
          <div class="sp-card__chips">
            <span class="sp-card__id">ID: ${escapeHTML(fmtId)}</span>
            <button type="button" class="btn-copy-id sp-btn sp-btn--copy"
                    data-copy="${escapeHTML(m.meeting_id)}"
                    style="font-size:11px;padding:3px 8px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
                   stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy ID
            </button>
          </div>
        </div>
      </div>

      <!-- Actions row -->
      <div class="sp-card__actions">
        <a href="${escapeHTML(m.join_url)}" target="_blank" rel="noopener noreferrer" class="sp-btn sp-btn--zoom">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
               stroke-linecap="round" width="12" height="12" aria-hidden="true">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/>
            <rect x="3" y="6" width="12" height="12" rx="2" ry="2"/>
          </svg>
          Join Zoom Meeting
        </a>
        <a href="${cal.url}" target="_blank" rel="noopener noreferrer" class="sp-btn sp-btn--cal">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
               stroke-linecap="round" width="12" height="12" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Add to Google Calendar
        </a>
        <button type="button" class="btn-copy-link sp-btn sp-btn--copy"
                data-link="${escapeHTML(m.join_url)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="12" height="12" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Copy Join Link
        </button>
        <button type="button" class="btn-toggle-details sp-btn sp-btn--ghost">Hide Details ▴</button>
      </div>

      <!-- Expandable details -->
      <div class="sp-card__detail" style="display:block;">
        <div class="sp-card__detail-grid">
          <div>
            <p class="sp-dl">Session Description</p>
            <p class="sp-dv">${cal.desc}</p>
          </div>
          <div>
            <p class="sp-dl">Platform</p>
            <p class="sp-dv">Zoom Video Communications</p>
          </div>
          <div>
            <p class="sp-dl">Zoom Passcode</p>
            <p class="sp-dv" style="display:flex;align-items:center;gap:6px;">
              <code class="zoom-passcode-val" style="background:#E8EDF2;padding:2px 7px;border-radius:4px;font-family:monospace;color:#565656;font-weight:700;">
                ${escapeHTML(m.passcode || 'FAO2026')}
              </code>
              <button type="button" class="btn-copy-passcode sp-btn sp-btn--copy" data-passcode="${escapeHTML(m.passcode || 'FAO2026')}" style="font-size:10px;padding:2px 6px;display:inline-flex;align-items:center;height:18px;">
                Copy
              </button>
            </p>
          </div>
          <div>
            <p class="sp-dl">Host Organization</p>
            <p class="sp-dv">FAO of the United Nations</p>
          </div>
          <div>
            <p class="sp-dl">Dial-in Numbers</p>
            <p class="sp-dv">
              +1 669 900 6833 <em>(US)</em> ·
              +44 330 088 5830 <em>(UK)</em> ·
              Full list sent to <strong>${escapeHTML(data.email)}</strong>
            </p>
          </div>
          <div>
            <p class="sp-dl">Language</p>
            <p class="sp-dv">English · Simultaneous Interpretation Available</p>
          </div>
        </div>
      </div>
    `;

    /* ── Interact: Copy Meeting ID ── */
    card.querySelector(".btn-copy-id").addEventListener("click", function () {
      navigator.clipboard.writeText(this.getAttribute("data-copy")).then(() => {
        const orig = this.innerHTML;
        this.textContent = "✔ Copied!";
        this.style.color = "#188038";
        setTimeout(() => { this.innerHTML = orig; this.style.color = ""; }, 2200);
      });
    });

    /* ── Interact: Copy Join Link ── */
    card.querySelector(".btn-copy-link").addEventListener("click", function () {
      navigator.clipboard.writeText(this.getAttribute("data-link")).then(() => {
        const orig = this.innerHTML;
        this.textContent = "✔ Copied!";
        this.style.color = "#188038";
        setTimeout(() => { this.innerHTML = orig; this.style.color = ""; }, 2200);
      });
    });

    /* ── Interact: Copy Passcode ── */
    card.querySelector(".btn-copy-passcode").addEventListener("click", function () {
      navigator.clipboard.writeText(this.getAttribute("data-passcode")).then(() => {
        const orig = this.innerHTML;
        this.textContent = "✔ Copied!";
        this.style.color = "#188038";
        setTimeout(() => { this.innerHTML = orig; this.style.color = ""; }, 2200);
      });
    });

    /* ── Interact: Toggle Details ── */
    const toggleBtn    = card.querySelector(".btn-toggle-details");
    const detailsPanel = card.querySelector(".sp-card__detail");
    toggleBtn.addEventListener("click", () => {
      const open = detailsPanel.style.display !== "none";
      detailsPanel.style.display = open ? "none" : "block";
      toggleBtn.textContent = open ? "More Details ▾" : "Hide Details ▴";
    });

    panel.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════
   4b. RENDER IN-PERSON CONTENT
═══════════════════════════════════════════════════════════ */
function renderInPersonContent() {
  const titleEl = document.getElementById("sp-sessions-title");
  if (titleEl) titleEl.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
    Your Event Access Details
  `;

  const daysText       = data.attendance_days ? formatText(data.attendance_days) : "All Conference Days (23–26 November 2026)";
  const dietaryDisplay = formatDietary(data.dietary) + (data.dietary_details ? ` (${data.dietary_details})` : "");

  /* Google Calendar URL */
  const calDates   = "20261123T010000Z/20261126T090000Z";
  const calTitle   = encodeURIComponent("APSAM 2026 — In-Person Conference, Manila");
  const calDetails = encodeURIComponent(
    `Asia-Pacific Conference on Sustainable Agricultural Mechanization (APSAM 2026)\n\n` +
    `✅ Attendance Type: IN-PERSON\n` +
    `👤 Attendee: ${fullName()}\n` +
    `📧 Email: ${data.email}\n` +
    `🏨 Venue: Sofitel Philippine Plaza Manila, CCP Complex, Roxas Boulevard, Pasay, Metro Manila, Philippines\n` +
    `📅 Dates: 23–26 November 2026\n\n` +
    `📋 Present your QR code at the main registration desk to receive your conference badge.\n\n` +
    `📞 Contact: apsam2026@fao.org | +63 2 8521 0000\n` +
    `Organized by: Food and Agriculture Organization (FAO) of the United Nations`
  );
  const calLocation = encodeURIComponent("Sofitel Philippine Plaza Manila, CCP Complex, Roxas Boulevard, Pasay 1300, Metro Manila, Philippines");
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calDates}&details=${calDetails}&location=${calLocation}`;
  const mapsUrl     = "https://maps.google.com/?q=Sofitel+Philippine+Plaza+Manila,+CCP+Complex,+Roxas+Boulevard,+Pasay,+Metro+Manila";

  const panel = document.getElementById("sp-sessions-panel");
  panel.innerHTML = `
    <div class="sp-card">
      <!-- Top: banner + venue info -->
      <div class="sp-card__top">
        <div class="sp-card__img"
             style="background-image:url('/assets/01-apsam-main-visual-landscape.jpg');"
             role="img" aria-label="APSAM 2026 conference visual"></div>
        <div class="sp-card__info">
          <h3 class="sp-card__name">In-Person Conference Attendance</h3>
          <p class="sp-card__date">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            23–26 November 2026
          </p>
          <p style="font-size:12px;color:#545454;margin:0;display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#565656"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            Sofitel Philippine Plaza Manila, Pasay, Metro Manila
          </p>
          <div class="sp-card__chips" style="margin-top:8px;">
            <span style="font-size:11.5px;background:#E8F5E9;color:#1B5E20;padding:3px 9px;border-radius:4px;font-weight:600;border:1px solid #A5D6A7;">
              ✔ Confirmed
            </span>
            <span style="font-size:11.5px;color:#545454;padding:3px 0;">Days: ${escapeHTML(daysText)}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="sp-card__actions">
        <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer" class="sp-btn sp-btn--cal">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
               stroke-linecap="round" width="12" height="12" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Add to Google Calendar
        </a>
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="sp-btn sp-btn--maps">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
               stroke-linecap="round" width="12" height="12" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          View on Google Maps
        </a>
        <button type="button" class="btn-toggle-ip sp-btn sp-btn--ghost">Hide Details ▴</button>
      </div>

      <!-- Expandable details -->
      <div class="sp-card__detail ip-detail-panel" style="display:block;">
        <div class="sp-card__detail-grid">
          <div>
            <p class="sp-dl">Registered Days</p>
            <p class="sp-dv">${escapeHTML(daysText)}</p>
          </div>
          <div>
            <p class="sp-dl">Dietary Preference</p>
            <p class="sp-dv">${escapeHTML(dietaryDisplay)}</p>
          </div>
          <div>
            <p class="sp-dl">Visa Assistance</p>
            <p class="sp-dv">${data.visa_assistance == "1"
              ? "✔ Requested — Our team will contact you"
              : "Not Requested"}</p>
          </div>
          <div>
            <p class="sp-dl">Venue Address</p>
            <p class="sp-dv">Sofitel Philippine Plaza Manila, CCP Complex, Roxas Blvd., Pasay 1300, Metro Manila, Philippines</p>
          </div>
          <div>
            <p class="sp-dl">Check-in Requirement</p>
            <p class="sp-dv">Present your QR code at the main registration desk to receive your conference badge.</p>
          </div>
          <div>
            <p class="sp-dl">Dress Code</p>
            <p class="sp-dv">Business Casual / Smart Casual</p>
          </div>
          <div>
            <p class="sp-dl">Registration Desk Opens</p>
            <p class="sp-dv">07:30 AM daily — Lobby, Sofitel Philippine Plaza Manila</p>
          </div>
          <div>
            <p class="sp-dl">Contact</p>
            <p class="sp-dv">apsam2026@fao.org · +63 2 8521 0000</p>
          </div>
        </div>
      </div>
    </div>
  `;

  /* Toggle in-person details */
  const ipToggle = panel.querySelector(".btn-toggle-ip");
  const ipPanel  = panel.querySelector(".ip-detail-panel");
  ipToggle.addEventListener("click", () => {
    const open = ipPanel.style.display !== "none";
    ipPanel.style.display = open ? "none" : "block";
    ipToggle.textContent  = open ? "More Details ▾" : "Hide Details ▴";
  });
}

/* ═══════════════════════════════════════════════════════════
   5. DA FORM NOTICE (international delegates)
═══════════════════════════════════════════════════════════ */
function buildDaNotice() {
  const isInternational = data.nationality && data.nationality !== "philippines";
  if (!isInternational) return;
  const area = document.getElementById("sp-notices-area");
  if (!area) return;
  const notice = document.createElement("div");
  notice.className = "da-notice";
  notice.style.marginTop = "16px";
  notice.innerHTML = `
    <div class="da-notice__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <strong>Department of Agriculture (DA) Registration Form</strong> for biosecurity
        and coordination purposes prior to the event.
      </p>
      <a href="#" class="da-notice__btn" target="_blank" rel="noopener noreferrer"
         aria-label="Fill up the DA form (opens in new tab)">
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
  area.appendChild(notice);
}

/* ═══════════════════════════════════════════════════════════
   6. WIRE BUTTONS (Download QR, Print)
═══════════════════════════════════════════════════════════ */
function wireButtons() {
  /* Download QR */
  const dlBtn = document.getElementById("downloadQrBtn");
  if (dlBtn) {
    dlBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(qrSrc);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
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
  }

  /* Print */
  const printBtn = document.getElementById("successPrintBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());
}

/* ═══════════════════════════════════════════════════════════
   MAIN INIT
═══════════════════════════════════════════════════════════ */
async function initPage() {
  buildHero();
  buildQrSection();
  buildInfoCard();
  buildDaNotice();
  wireButtons();

  if (data.attendance_mode === "online") {
    /* Collect meeting IDs from JWT */
    const rawIds     = data.zoom_meeting_id ? String(data.zoom_meeting_id).trim() : "";
    const meetingIds = rawIds ? rawIds.split(",").map(s => s.trim()).filter(Boolean) : [];
    const joinUrls   = data.zoom_join_url
      ? String(data.zoom_join_url).split(",").map(s => s.trim())
      : [];

    /* Fetch display names from server */
    let activeMeetings = [];
    try {
      const res  = await fetch("/v1/zoom-meetings");
      const json = await res.json();
      if (json.success && json.data && json.data.meetings) {
        activeMeetings = json.data.meetings;
      }
    } catch (err) {
      console.error("Failed to fetch Zoom meetings metadata:", err);
    }

    let userMeetings;
    if (meetingIds.length > 0) {
      userMeetings = await Promise.all(meetingIds.map(async (mId, i) => {
        const matched = activeMeetings.find(m => String(m.meeting_id) === mId);
        const rawUrl = joinUrls[i] || "";
        const finalUrl = (rawUrl && rawUrl !== "#") ? rawUrl : `https://zoom.us/j/${mId}`;
        
        let passcode = "FAO2026";
        try {
          const detailRes = await fetch(`/v1/zoom-meetings/${mId}`);
          const detailJson = await detailRes.json();
          if (detailJson.success && detailJson.data && detailJson.data.passcode) {
            passcode = detailJson.data.passcode;
          }
        } catch (e) {
          console.error(`Error fetching passcode for ${mId}:`, e);
        }

        return {
          meeting_id   : mId,
          display_name : matched ? matched.display_name : `Zoom Session (${mId})`,
          topic        : matched ? matched.topic        : `Session ${mId}`,
          join_url     : finalUrl,
          passcode     : passcode
        };
      }));
    } else {
      /* Fallback: show all active sessions */
      userMeetings = await Promise.all(activeMeetings.map(async (m, i) => {
        const rawUrl = joinUrls[i] || "";
        const finalUrl = (rawUrl && rawUrl !== "#") ? rawUrl : `https://zoom.us/j/${m.meeting_id}`;
        
        let passcode = "FAO2026";
        try {
          const detailRes = await fetch(`/v1/zoom-meetings/${m.meeting_id}`);
          const detailJson = await detailRes.json();
          if (detailJson.success && detailJson.data && detailJson.data.passcode) {
            passcode = detailJson.data.passcode;
          }
        } catch (e) {}

        return {
          meeting_id   : m.meeting_id,
          display_name : m.display_name,
          topic        : m.topic,
          join_url     : finalUrl,
          passcode     : passcode
        };
      }));
    }

    renderOnlineSessions(userMeetings);
  } else {
    renderInPersonContent();
  }
}

/* Run after DOM is ready */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}

/* ═══════════════════════════════════════════════════════════
   HAMBURGER / MOBILE NAV
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
  if (isOpen) mobileNav.removeAttribute("hidden");
  else        mobileNav.setAttribute("hidden", "");
});

document.addEventListener("click", (e) => {
  if (!navToggle.contains(e.target) && !mobileNav.contains(e.target)) closeMobileNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.classList.contains("is-open")) {
    closeMobileNav(); navToggle.focus();
  }
});
const desktopMQ = window.matchMedia("(min-width: 769px)");
const onBreakpoint = (e) => { if (e.matches) closeMobileNav(); };
if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", onBreakpoint);
else desktopMQ.addListener(onBreakpoint); // Safari < 14 fallback
