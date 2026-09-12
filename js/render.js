/**
 * render.js
 * ------------------------------------------------------------
 * Populates every section of the scrollable invitation from
 * window.WEDDING. No wedding copy lives in the HTML itself.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  if (!W) return;

  const $ = (id) => document.getElementById(id);
  const set = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

  // ---- Envelope title (inside the opening sequence) ----------------------
  set("title-bride", W.bride);
  set("title-groom", W.groom);
  set("title-date", `${W.day} · ${W.month} · ${W.year}`);

  // ---- Hero ------------------------------------------------------------------
  set("hero-bride", W.bride);
  set("hero-groom", W.groom);
  set("hero-date", W.displayDate);
  document.title = `${W.bride} & ${W.groom} — ${W.displayDate}`;

  // ---- Invitation message ------------------------------------------------------
  set("invite-eyebrow", W.invitation.eyebrow);
  set("invite-message", W.invitation.message);
  set("invite-signoff", W.invitation.signoff);

  // ---- Couple photograph -----------------------------------------------------
  const heroPhoto = $("hero-photo");
  if (heroPhoto) {
    heroPhoto.src = W.heroPhoto.src;
    heroPhoto.alt = W.heroPhoto.alt;
  }

  // ---- Our Story ---------------------------------------------------------------
  set("story-heading", W.story.heading);
  set("story-intro", W.story.intro);
  const storyList = $("story-list");
  if (storyList) {
    storyList.innerHTML = W.story.milestones
      .map(
        (m, i) => `
        <li class="timeline__item" data-reveal="fade">
          <span class="timeline__year">${m.year}</span>
          <span class="timeline__dot" aria-hidden="true"></span>
          <div class="timeline__body">
            <h3 class="timeline__title">${m.title}</h3>
            <p class="timeline__text">${m.text}</p>
          </div>
        </li>`
      )
      .join("");
  }

  // ---- Ceremony / Reception ------------------------------------------------------
  set("ceremony-venue", W.ceremony.venueName);
  set("ceremony-time", W.ceremony.time);
  set("ceremony-address", W.ceremony.address);
  set("ceremony-note", W.ceremony.note);

  set("reception-venue", W.reception.venueName);
  set("reception-time", W.reception.time);
  set("reception-address", W.reception.address);
  set("reception-note", W.reception.note);

  // ---- Venue / Map ------------------------------------------------------------------
  set("venue-name", W.venue.name);
  set("venue-address", W.venue.address);
  const mapFrame = $("venue-map-frame");
  if (mapFrame) mapFrame.src = W.venue.mapEmbedUrl;
  const mapLink = $("venue-map-link");
  if (mapLink) mapLink.href = W.venue.mapLinkUrl;

  // ---- Wedding Timeline -----------------------------------------------------------------
  set("timeline-heading", W.timeline.heading);
  const timelineList = $("timeline-list");
  if (timelineList) {
    timelineList.innerHTML = W.timeline.items
      .map(
        (t, i) => `
        <li class="day-timeline__item" data-reveal="fade">
          <span class="day-timeline__time">${t.time}</span>
          <div class="day-timeline__rail" aria-hidden="true"><span></span></div>
          <div class="day-timeline__body">
            <h3>${t.label}</h3>
            <p>${t.detail}</p>
          </div>
        </li>`
      )
      .join("");
  }

  // ---- Gallery -----------------------------------------------------------------------------
  set("gallery-heading", W.gallery.heading);
  set("gallery-intro", W.gallery.intro);
  const galleryGrid = $("gallery-grid");
  if (galleryGrid) {
    galleryGrid.innerHTML = W.gallery.photos
      .map(
        (p, i) => `
        <figure class="gallery__item" data-reveal="scale">
          <img src="${p.src}" alt="${p.alt}" loading="lazy" />
        </figure>`
      )
      .join("");
  }

  // ---- RSVP --------------------------------------------------------------------------------
  set("rsvp-heading", W.rsvp.heading);
  set("rsvp-intro", W.rsvp.intro);

  // ---- Closing -------------------------------------------------------------------------------
  set("closing-heading", W.closing.heading);
  set("closing-message", W.closing.message);
  set("closing-signoff", W.closing.signoff);
})();
