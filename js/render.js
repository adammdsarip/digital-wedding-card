/**
 * render.js
 * ------------------------------------------------------------
 * Fills the envelope scene, its card and all six sheets from
 * window.WEDDING. No wedding copy lives in the HTML itself — the
 * text there is only a fallback until this runs.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  if (!W) return;

  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"];

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const set = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

  // Several short lines in one element, broken with <br> (text stays text).
  const setLines = (id, lines) => {
    const el = $(id);
    if (!el) return;
    const nodes = [];
    [].concat(lines).forEach((line, i) => {
      if (i) nodes.push(document.createElement("br"));
      nodes.push(document.createTextNode(line));
    });
    el.replaceChildren(...nodes);
  };

  const icon = (name) => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
  const br = (lines) => [].concat(lines).map(esc).join("<br>");

  // ---- The date: one source, everything else derived ------------------------
  const when = new Date(W.isoDate);
  const weekday = WEEKDAYS[when.getDay()];
  const dayNum = String(when.getDate());
  const monthName = MONTHS[when.getMonth()];
  const year = String(when.getFullYear());

  // ---- The envelope scene ----------------------------------------------------
  const env = W.envelope;
  const initialOne = W.partnerOne.charAt(0).toUpperCase();
  const initialTwo = W.partnerTwo.charAt(0).toUpperCase();

  // The monogram above the envelope, on the card, and struck into the wax.
  ["mono-one", "card-mono-one", "seal-initial-one"].forEach((id) => set(id, initialOne));
  ["mono-two", "card-mono-two", "seal-initial-two"].forEach((id) => set(id, initialTwo));

  setLines("scene-eyebrow", env.eyebrow);
  set("scene-hint", env.hint);
  set("scene-next", env.revealHint);

  // ---- The card that rises from the envelope ----------------------------------
  set("card-eyebrow", env.card.eyebrow);
  set("card-name-one", W.partnerOne);
  set("card-connector", env.card.connector);
  set("card-name-two", W.partnerTwo);
  setLines("card-invite", env.card.invite);
  set("card-weekday", weekday.slice(0, 3));
  set("card-day", dayNum);
  set("card-month", `${monthName.slice(0, 3)} ${year}`);
  set("card-place", env.card.place);
  const card = $("envelope-card");
  if (card) {
    card.setAttribute("aria-label",
      `${env.card.eyebrow}, ${W.partnerOne} ${env.card.connector} ${W.partnerTwo} ` +
      `${env.card.invite.join(" ").toLowerCase()} on ${weekday} ${dayNum} ${monthName} ${year}, ${env.card.place}.`);
  }

  // ---- Page title and description -----------------------------------------------
  const dateLine = `${dayNum} ${monthName} ${year}`;
  document.title = `${W.partnerOne} & ${W.partnerTwo} — ${dateLine}`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = `You are cordially invited to the wedding of ${W.partnerOne} & ${W.partnerTwo}.`;

  // ---- Sheet 1: the invitation -------------------------------------------------
  const inv = W.invitation;
  setLines("inv-eyebrow", inv.eyebrow);
  set("inv-invite", inv.invite);
  set("inv-name-one", W.partnerOne);
  set("inv-connector", W.connector);
  set("inv-name-two", W.partnerTwo);
  setLines("inv-blessing", inv.blessing);
  set("inv-weekday", weekday);
  set("inv-day", dayNum);
  set("inv-month", `${monthName} ${year}`);
  set("inv-time", `At ${W.timeText}`);
  set("inv-venue-name", W.venue.name);
  setLines("inv-venue-address", W.venue.address);
  set("inv-reception", inv.reception);
  setLines("inv-closing", inv.closing);

  // ---- Sheet 2: the itinerary ----------------------------------------------------
  const it = W.itinerary;
  set("it-eyebrow", it.eyebrow);
  set("it-title", it.title);
  set("it-subtitle", it.subtitle);
  const itList = $("it-list");
  if (itList) {
    itList.innerHTML =
      it.items.map((s) => `
        <li class="itinerary__item" data-reveal="fade">
          <span class="itinerary__seg" aria-hidden="true"></span>
          <span class="itinerary__icon">${icon("i-" + s.icon)}</span>
          <span class="itinerary__dot" aria-hidden="true"></span>
          <div class="itinerary__body">
            <p class="itinerary__time">${esc(s.time)}</p>
            <h3 class="itinerary__title">${esc(s.title)}</h3>
            <p class="itinerary__detail">${esc(s.detail)}</p>
          </div>
        </li>`).join("");
  }

  // ---- Sheet 3: location -----------------------------------------------------------
  set("loc-title", W.location.title);
  set("loc-venue", W.venue.name);
  setLines("loc-address", W.venue.address);
  const map = $("loc-map");
  if (map) map.src = W.venue.mapEmbedUrl;
  const mapLink = $("loc-link");
  if (mapLink) mapLink.href = W.venue.mapLinkUrl;
  set("loc-link-text", W.venue.mapButton);

  const gh = W.location.gettingHere;
  set("gh-title", gh.title);
  const ghList = $("gh-list");
  if (ghList) {
    ghList.innerHTML = gh.items.map((g) => `
      <li class="getting__item" data-reveal="fade">
        ${icon("i-" + g.icon)}
        <p class="getting__label">${esc(g.label)}</p>
        <p class="getting__detail">${br(g.detail)}</p>
      </li>`).join("");
  }

  // ---- Sheet 4: RSVP -----------------------------------------------------------------
  const r = W.rsvp;
  set("rsvp-eyebrow", r.eyebrow);
  set("rsvp-title", r.title);
  set("rsvp-deadline", r.deadline);
  set("rsvp-scan", r.scanLabel);
  set("rsvp-or", r.orLabel);
  setLines("rsvp-accepts", r.accepts);
  setLines("rsvp-declines", r.declines);

  const rsvpLink = $("rsvp-link");
  if (rsvpLink) {
    rsvpLink.href = r.url;
    rsvpLink.textContent = r.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  // The QR code is drawn from the same link, as one crisp SVG path.
  const qrBox = $("rsvp-qr");
  if (qrBox && typeof qrcode === "function") {
    try {
      const qr = qrcode(0, "M");
      qr.addData(r.url);
      qr.make();
      const n = qr.getModuleCount();
      let d = "";
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
        }
      }
      qrBox.innerHTML =
        `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true">` +
        `<path d="${d}" fill="currentColor"/></svg>`;
      qrBox.setAttribute("aria-label", `QR code that opens ${r.url}`);
    } catch (err) {
      qrBox.hidden = true;
    }
  } else if (qrBox) {
    qrBox.hidden = true;
  }

  // ---- Sheet 5: dress code and a note -------------------------------------------------
  const dc = W.dressCode;
  set("dc-title", dc.title);
  set("dc-style", dc.style);
  set("dc-caption", dc.caption);
  const sw = $("dc-swatches");
  if (sw) {
    sw.innerHTML = dc.colors.map((c) =>
      `<li><span style="background:${esc(c.hex)}" role="img" aria-label="${esc(c.name)}"></span></li>`).join("");
  }
  set("note-title", W.note.title);
  set("note-text", W.note.text);

  // ---- Sheet 6: contact and socials ------------------------------------------------------
  const ct = W.contact;
  set("ct-title", ct.title);
  set("ct-intro", ct.intro);
  const people = $("ct-people");
  if (people) {
    people.innerHTML = ct.people.map((p) => `
      <div class="contact__person" data-reveal="fade">
        <p class="contact__role">${esc(p.role)}</p>
        <p class="contact__phone"><a href="tel:${esc(p.phone.replace(/[^\d+]/g, ""))}">${esc(p.phone)}</a></p>
        <p class="contact__name">${esc(p.name)}</p>
      </div>`).join("");
  }

  set("fl-title", ct.follow.title);
  set("fl-text", ct.follow.text);
  const socials = $("fl-socials");
  if (socials) {
    socials.innerHTML = ["instagram", "facebook", "tiktok"].map((net) => {
      const url = ct.follow[net];
      const label = net.charAt(0).toUpperCase() + net.slice(1);
      return url
        ? `<li><a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${icon("i-" + net)}</a></li>`
        : `<li><span role="img" aria-label="${label}">${icon("i-" + net)}</span></li>`;
    }).join("");
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const joiner = /^[a-z]+$/i.test(W.connector) ? cap(W.connector) : "And";
  set("fl-hashtag", W.hashtag || `#${cap(W.partnerOne)}${joiner}${cap(W.partnerTwo)}`);

  // ---- Floral artwork: only drawn once you supply it -----------------------------------------
  const fl = W.florals || {};
  document.querySelectorAll("[data-florals]").forEach((sheet) => {
    [["topLeft", "tl"], ["bottomRight", "br"]].forEach(([key, pos]) => {
      if (!fl[key]) return;
      const img = document.createElement("img");
      img.className = `sheet__floral sheet__floral--${pos}`;
      img.src = fl[key];
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.decoding = "async";
      sheet.prepend(img);
    });
  });
})();
