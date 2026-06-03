<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed — FAO Event</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

  <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
  <link rel="stylesheet" href="/assets/index.css" />
</head>
<body>

  <!-- HEADER -->
  <header class="fao-header" role="banner">
    <div class="fao-header__inner">
      <a href="/" class="fao-header__logo" aria-label="FAO Home">
        <span class="fao-logo-emblem-crop" aria-hidden="true">
          <img src="/assets/fao-logo.png" alt="" class="fao-logo-img" />
        </span>
        <div class="fao-logo-text">
          <span class="fao-logo-text__title">FAO</span>
          <span class="fao-logo-text__subtitle">Food and Agriculture Organization</span>
        </div>
      </a>
      <nav class="fao-header__nav" aria-label="Main navigation">
        <a href="#">About</a>
        <a href="#">Events</a>
        <a href="#">Publications</a>
        <a href="#">Contact</a>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileNav">
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>
    </div>
    <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation" hidden>
      <a href="#" class="mobile-nav__link">About</a>
      <a href="#" class="mobile-nav__link">Events</a>
      <a href="#" class="mobile-nav__link">Publications</a>
      <a href="#" class="mobile-nav__link">Contact</a>
    </nav>
  </header>

  <!-- PAGE HERO -->
  <section class="page-hero" aria-label="Page header">
    <div class="page-hero__inner">
      <span class="page-hero__label">Registration Confirmed</span>
      <div class="page-hero__rule" aria-hidden="true"></div>
      <h1 class="page-hero__title">Asia-Pacific Conference on Sustainable Agricultural Mechanization</h1>
      <p class="page-hero__theme">Modernize. Scale. Sustain.</p>
      <div class="page-hero__meta" aria-label="Conference details">
        <span class="page-hero__meta-item page-hero__meta-item--venue">
          <svg class="page-hero__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
          </svg>
          Manila, Philippines
        </span>
        <span class="page-hero__meta-item">
          <svg class="page-hero__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          23-26 November 2026
        </span>
      </div>
    </div>
  </section>

  <!-- MAIN -->
  <main class="page-main" id="main-content">
    <div class="registration-card" id="confirmationPanel" role="region" aria-label="Registration confirmation">

      <div class="confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 class="confirmation-title">You're Registered!</h2>
      <p class="confirmation-message">
        Thank you for registering for APSAM 2026. Your details have been received and are pending review.<br />
        Please save or download your QR code below — you will need it for event check-in.
      </p>

      <!-- QR Code — centered, populated by confirmation.js -->
      <div id="confirmationRef" class="confirmation-ref" aria-label="Your check-in QR code" style="text-align:center;"></div>

      <!-- Download button — directly below QR -->
      <div style="text-align:center; margin: 16px 0 24px;">
        <button class="btn-primary" id="downloadQrBtn" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download QR Code
        </button>
      </div>

      <!-- DA notice injected here by confirmation.js if international -->

      <!-- Register Another — at the bottom -->
      <div class="confirmation-actions">
        <a href="/" class="btn-secondary">Register Another Participant</a>
      </div>

    </div>
  </main>

  <!-- FOOTER -->
  <footer class="fao-footer" role="contentinfo">
    <div class="fao-footer__inner">

      <div class="fao-footer__grid">

        <div class="fao-footer__brand">
          <a href="#" class="fao-footer__brand-logo" aria-label="FAO Home">
            <span class="fao-logo-emblem-crop fao-logo-emblem-crop--footer" aria-hidden="true">
              <img src="/assets/fao-logo.png" alt="" class="fao-footer__logo-img" />
            </span>
            <div class="fao-footer__brand-text">
              <span class="fao-footer__brand-name">FAO</span>
              <span class="fao-footer__brand-sub">Food and Agriculture Organization</span>
            </div>
          </a>
          <p class="fao-footer__tagline">Fiat Panis — Let There Be Bread</p>
          <p class="fao-footer__mission">
            Working towards zero hunger by fostering sustainable food systems,
            agriculture, and equitable rural development worldwide.
          </p>
          <div class="fao-footer__social" role="list" aria-label="FAO on social media">
            <a href="#" class="fao-footer__social-link" aria-label="FAO on X (Twitter)" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" class="fao-footer__social-link" aria-label="FAO on Facebook" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" class="fao-footer__social-link" aria-label="FAO on YouTube" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--color-primary-dark)"/></svg>
            </a>
            <a href="#" class="fao-footer__social-link" aria-label="FAO on LinkedIn" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" class="fao-footer__social-link" aria-label="FAO on Instagram" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="var(--color-primary-dark)"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="var(--color-primary-dark)" stroke-width="2"/></svg>
            </a>
            <a href="#" class="fao-footer__social-link" aria-label="FAO on Flickr" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="12" r="4.5"/><circle cx="16.5" cy="12" r="4.5"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 class="fao-footer__col-title">Quick Links</h3>
          <ul class="fao-footer__links">
            <li><a href="#">About FAO</a></li>
            <li><a href="#">Events</a></li>
            <li><a href="#">Publications</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        <div>
          <h3 class="fao-footer__col-title">Resources</h3>
          <ul class="fao-footer__links">
            <li><a href="#">Data &amp; Statistics</a></li>
            <li><a href="#">News &amp; Stories</a></li>
            <li><a href="#">Media Center</a></li>
            <li><a href="#">Country Offices</a></li>
            <li><a href="#">SDG Progress</a></li>
          </ul>
        </div>

        <div>
          <h3 class="fao-footer__col-title">Visit FAO</h3>
          <p class="fao-footer__connect-text">
            Explore the latest news, data, publications and resources on the
            official FAO website.
          </p>
          <a href="https://www.fao.org" class="fao-footer__website-btn" target="_blank" rel="noopener noreferrer" aria-label="Visit fao.org (opens in new tab)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
            </svg>
            Visit fao.org
          </a>
        </div>

      </div>

      <div class="fao-footer__bottom">
        <p class="fao-footer__copyright">
          &copy; 2026 Food and Agriculture Organization of the United Nations. All rights reserved.
        </p>
      </div>

    </div>
  </footer>

   <!-- ═══════════════════════════════════════════════════════════
       SUCCESS REGISTRATION MODAL  — Enhanced Premium Version
       Shown for both Online/Virtual and In-Person attendees.
  ═══════════════════════════════════════════════════════════ -->
  <div class="tc-modal-overlay" id="successModal" hidden role="dialog" aria-modal="true" aria-labelledby="successModalTitle" style="z-index: 2200; align-items: flex-start; padding: 24px 16px; overflow-y: auto;">

    <div class="tc-modal" style="max-width: 700px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 24px 64px rgba(17,106,171,0.22); margin: auto;">

      <!-- ── Modal Header Banner ── -->
      <div id="successModalHeader" style="background: linear-gradient(135deg, #1C4767 0%, #116AAB 60%, #5792C9 100%); padding: 28px 28px 22px; position: relative; overflow: hidden;">
        <!-- Decorative circles -->
        <div aria-hidden="true" style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none;"></div>
        <div aria-hidden="true" style="position:absolute;bottom:-20px;left:40px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;"></div>

        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
          <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;">
            <!-- Animated checkmark badge -->
            <div id="successCheckBadge" style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:successPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <h3 id="successModalTitle" style="font-size:18px;font-weight:700;color:#ffffff;margin:0 0 4px;line-height:1.3;">Registration Successful!</h3>
              <p id="successModalSubtitle" style="font-size:12.5px;color:rgba(255,255,255,0.8);margin:0;line-height:1.4;">APSAM 2026 · Asia-Pacific Conference on Sustainable Agricultural Mechanization</p>
            </div>
          </div>
          <button type="button" id="successModalClose" aria-label="Close registration details" style="background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.3);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all 0.2s;color:#fff;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Attendee summary row -->
        <div id="successAttendeeRow" style="margin-top:18px;padding:12px 14px;background:rgba(255,255,255,0.12);border-radius:8px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- ── Modal Body ── -->
      <div id="successModalBody" style="padding:0;max-height:60vh;overflow-y:auto;">

        <!-- Section title -->
        <div id="successModalSectionLabel" style="padding:16px 24px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <h4 style="font-size:14px;font-weight:700;color:var(--color-primary-dark);text-transform:uppercase;letter-spacing:0.6px;display:flex;align-items:center;gap:7px;margin:0;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" ry="2"/></svg>
            <span id="successSessionsLabel">Your Registered Sessions</span>
          </h4>
          <!-- Add All to Calendar button (virtual only) -->
          <button type="button" id="successAddAllCalBtn" hidden style="background:var(--color-success);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all 0.2s;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add All to Google Calendar
          </button>
        </div>

        <!-- Dynamic Zoom / event cards -->
        <div id="successModalZoomContainer" style="padding:12px 24px 8px;display:flex;flex-direction:column;gap:14px;">
          <!-- Injected by JS -->
        </div>

        <!-- Important notice bar -->
        <div id="successImportantNotice" style="margin:4px 24px 16px;padding:12px 14px;background:#FFF8E1;border:1px solid #FFE082;border-radius:8px;font-size:12.5px;color:#5D4037;display:flex;align-items:flex-start;gap:9px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#E65100" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span id="successNoticeText">Please save or screenshot this information. A confirmation has also been sent to your registered email address.</span>
        </div>
      </div>

      <!-- ── Modal Footer ── -->
      <div style="padding:14px 24px;background:var(--color-bg);border-top:1px solid var(--color-border-light);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <button type="button" id="successPrintBtn" style="background:none;border:1.5px solid var(--color-border);border-radius:6px;padding:8px 14px;font-size:12.5px;font-weight:600;color:var(--color-text);cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save as PDF
        </button>
        <div style="display:flex;gap:10px;">
          <button type="button" id="successModalDismiss" style="background:var(--color-primary);color:#fff;border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 9 15 9"/><polyline points="9 12 15 12"/><polyline points="9 15 13 15"/></svg>
            View My QR Code
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Keyframe for badge pop-in animation -->
  <style>
    @keyframes successPop {
      0%   { transform: scale(0); opacity: 0; }
      70%  { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    #successModal .tc-modal::-webkit-scrollbar { width: 5px; }
    #successModal .tc-modal::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
    #successModalBody::-webkit-scrollbar { width: 5px; }
    #successModalBody::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
    .success-zoom-card { transition: box-shadow 0.2s, transform 0.2s; }
    .success-zoom-card:hover { box-shadow: 0 6px 24px rgba(17,106,171,0.13); transform: translateY(-1px); }
    .success-action-btn { transition: all 0.2s; }
    .success-action-btn:hover { opacity: 0.87; transform: translateY(-1px); }
    #successPrintBtn:hover { background: var(--color-primary-light); border-color: var(--color-primary); color: var(--color-primary-dark); }
    #successModalClose:hover { background: rgba(255,255,255,0.28); }
    #successModalDismiss:hover { background: var(--color-primary-dark); }
    #successAddAllCalBtn:hover { background: #1B5E20; }
  </style>

  <script src="/assets/confirmation.js"></script>
</body>
</html>
