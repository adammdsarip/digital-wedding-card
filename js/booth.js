/**
 * booth.js
 * ------------------------------------------------------------
 * The photo booth, in two steps inside one sheet:
 *
 *   camera — a live camera with a countdown (one photo, or a strip of four),
 *            or a photo chosen from the phone;
 *   edit   — filters, frames, stickers and a caption, then Download and/or
 *            Post to the wall.
 *
 * Everything runs on the guest's own phone. Nothing is sent anywhere here:
 * "Post to the wall" hands the finished picture to wall.js, which does the
 * posting. The picture is always drawn from a small description of it
 * (state) by one function, render(), so what the guest sees, what they
 * download, and what goes on the wall can never disagree.
 *
 * Filters are done on the pixels (no ctx.filter, which older iPhones lack).
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const cfg = W && W.booth;
  const dlg = document.getElementById("booth-dialog");
  if (!cfg || !dlg) return;

  const $ = (id) => document.getElementById(id);
  const L = cfg.labels;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const SCRIPT = '"Parisienne", "Brush Script MT", cursive';
  const SERIF = '"Cormorant Garamond", Georgia, serif';
  const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  const CREAM = "#f6eee1";
  const PAPER = "#fffdf9";
  const GOLD = "#b08b4f";
  const GOLD_INK = "#7a5f35";
  const INK = "#3a302a";

  // "14 NOV 2026", worked out from the one date in config.js
  const when = new Date(W.isoDate);
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateText = isNaN(when) ? "" : `${when.getDate()}  ${MON[when.getMonth()]}  ${when.getFullYear()}`;

  // ==========================================================================
  // What the picture is made of
  // ==========================================================================
  const state = {
    mode: "photo",            // "photo" | "strip"
    shots: [],                // camera frames or the chosen photo (canvases, mirrored as previewed)
    shotsId: 0,
    filter: "original",
    frame: "polaroid",
    flip: false,
    caption: cfg.caption,
    stickers: [],             // { e, x, y, s, r } — x,y in 0..1 of the photo (photo) or of the strip
    selected: -1,
  };
  const cache = new Map();    // filtered, cropped photos, so dragging a sticker never refilters

  function resetState() {
    state.mode = "photo"; state.shots = []; state.shotsId++; state.filter = "original";
    state.frame = "polaroid"; state.flip = false; state.caption = cfg.caption;
    state.stickers = []; state.selected = -1; cache.clear();
  }

  // ---- filters: a few numbers each, applied per pixel --------------------------------
  const FILTERS = {
    original: null,
    golden: { b: 1.04, c: 1.05, s: 1.1, warm: 16, fade: 0.03, vig: 0.12 },
    rose: { b: 1.05, c: 0.96, s: 0.95, tint: [10, -3, 8], fade: 0.07, vig: 0.1 },
    soft: { b: 1.09, c: 0.9, s: 0.9, warm: 5, fade: 0.12, vig: 0.08 },
    film: { b: 1.0, c: 1.07, s: 0.82, warm: 9, fade: 0.1, grain: 0.07, vig: 0.28 },
    mono: { b: 1.02, c: 1.12, s: 0, grain: 0.05, vig: 0.22 },
    bright: { b: 1.1, c: 1.06, s: 1.16 },
  };

  function filterPixels(cv, f) {
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const b = f.b || 1, c = f.c || 1, s = f.s == null ? 1 : f.s;
    const warm = f.warm || 0, fade = f.fade || 0, vig = f.vig || 0, grain = f.grain || 0;
    const tint = f.tint || [0, 0, 0];
    const cx = w / 2, cy = h / 2, maxd = Math.sqrt(cx * cx + cy * cy);
    let seed = 1234567;                         // fixed, so the preview and the download get the same grain
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      let r = ((d[i] - 128) * c + 128) * b;
      let g = ((d[i + 1] - 128) * c + 128) * b;
      let bl = ((d[i + 2] - 128) * c + 128) * b;
      const l = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = l + (r - l) * s; g = l + (g - l) * s; bl = l + (bl - l) * s;
      r += warm + tint[0]; g += warm * 0.35 + tint[1]; bl += -warm + tint[2];
      if (fade) { r = r * (1 - fade) + 235 * fade; g = g * (1 - fade) + 232 * fade; bl = bl * (1 - fade) + 226 * fade; }
      if (vig) {
        const dx = (p % w) - cx, dy = ((p / w) | 0) - cy;
        const v = 1 - vig * Math.pow(Math.sqrt(dx * dx + dy * dy) / maxd, 2.2);
        r *= v; g *= v; bl *= v;
      }
      if (grain) {
        seed = (seed * 1664525 + 1013904223) | 0;
        const n = ((seed >>> 24) / 255 - 0.5) * 255 * grain;
        r += n; g += n; bl += n;
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = bl;    // a Uint8ClampedArray clamps for us
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---- frames and layout, in a fixed design space (1080 wide for a photo, 800 for a strip) ----
  function layout(st) {
    if (st.mode === "strip") {
      const Wd = 800, Hd = 2400, m = 44, gap = 28;
      const n = Math.max(1, st.shots.length || cfg.stripShots);
      const pw = Wd - 2 * m, ph = Math.round((pw * 3) / 4);
      const rects = [];
      let y = m;
      for (let i = 0; i < n; i++) { rects.push({ x: m, y, w: pw, h: ph }); y += ph + gap; }
      const bottom = rects[n - 1].y + ph;
      return { W: Wd, H: Hd, rects, capY: bottom + (Hd - bottom) / 2, strip: true };
    }
    const inset = { none: 0, polaroid: 54, gold: 84, floral: 70 }[st.frame] || 0;
    if (!inset) return { W: 1080, H: 1080, rects: [{ x: 0, y: 0, w: 1080, h: 1080 }], capY: 0 };
    const side = 1080 - 2 * inset;
    const bottom = inset + side;
    return { W: 1080, H: 1350, rects: [{ x: inset, y: inset, w: side, h: side }], capY: bottom + (1350 - bottom) / 2 };
  }

  // the floral corners, from the same artwork as the sheets
  const FL = {};
  const fl = W.florals || {};
  [["tl", "topLeft"], ["tr", "topRight"], ["bl", "bottomLeft"], ["br", "bottomRight"]].forEach(([k, key]) => {
    if (!fl[key]) return;
    const img = new Image();
    img.onload = () => { FL[k] = img; if (dlg.open && state.shots.length) renderAll(); };
    img.src = fl[key];
  });

  function photoCanvas(st, i, rect, scale) {
    const pw = Math.max(1, Math.round(rect.w * scale)), ph = Math.max(1, Math.round(rect.h * scale));
    const key = [st.shotsId, i, st.filter, st.flip ? 1 : 0, pw, ph].join("|");
    let c = cache.get(key);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = pw; c.height = ph;
    const x = c.getContext("2d");
    const src = st.shots[i];
    const sr = src.width / src.height, dr = pw / ph;
    let sx = 0, sy = 0, sw = src.width, sh = src.height;
    if (sr > dr) { sw = src.height * dr; sx = (src.width - sw) / 2; } else { sh = src.width / dr; sy = (src.height - sh) / 2; }
    if (st.flip) { x.translate(pw, 0); x.scale(-1, 1); }
    x.drawImage(src, sx, sy, sw, sh, 0, 0, pw, ph);
    x.setTransform(1, 0, 0, 1, 0, 0);
    if (FILTERS[st.filter]) filterPixels(c, FILTERS[st.filter]);
    if (cache.size > 90) cache.clear();
    cache.set(key, c);
    return c;
  }

  function spaced(x, text, cx, y, gap) {
    const chars = [...text];
    const widths = chars.map((ch) => x.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let px = cx - total / 2;
    chars.forEach((ch, i) => { x.fillText(ch, px, y); px += widths[i] + gap; });
  }

  function drawCaption(x, st, lay) {
    const framed = lay.strip || st.frame !== "none";
    if (!framed) return;
    const W0 = lay.W;
    const dark = st.frame === "polaroid" || st.frame === "none";
    const nameColor = dark ? INK : GOLD_INK;
    const dateColor = dark ? "#6b5d52" : GOLD_INK;
    const hasName = st.caption.trim().length > 0;
    x.textAlign = "left"; x.textBaseline = "alphabetic";
    const nameSize = lay.strip ? 84 : 108;
    let ny = lay.capY - (hasName ? 6 : 0);
    if (hasName) {
      let size = nameSize;
      x.font = `${size}px ${SCRIPT}`;
      const maxW = W0 * 0.84;
      const w = x.measureText(st.caption).width;
      if (w > maxW) { size = Math.floor((size * maxW) / w); x.font = `${size}px ${SCRIPT}`; }
      x.fillStyle = nameColor;
      x.fillText(st.caption, W0 / 2 - x.measureText(st.caption).width / 2, ny);
    }
    if (dateText) {
      const ds = lay.strip ? 26 : 32;
      x.font = `500 ${ds}px ${SERIF}`;
      x.fillStyle = dateColor;
      spaced(x, dateText, W0 / 2, ny + (hasName ? (lay.strip ? 52 : 62) : ds * 0.35), lay.strip ? 5 : 7);
    }
  }

  function drawFrame(x, st, lay, behind) {
    if (behind) {
      x.fillStyle = lay.strip ? (st.frame === "gold" || st.frame === "floral" ? CREAM : PAPER) : st.frame === "polaroid" ? PAPER : st.frame === "none" ? "#fff" : CREAM;
      x.fillRect(0, 0, lay.W, lay.H);
      return;
    }
    // in front of the photos
    const frame = st.frame;
    if (frame === "polaroid" || frame === "none") {
      if (frame === "polaroid") {
        x.strokeStyle = "rgba(60,45,30,0.12)"; x.lineWidth = 2;
        lay.rects.forEach((r) => x.strokeRect(r.x, r.y, r.w, r.h));
      }
    } else if (frame === "gold") {
      x.strokeStyle = GOLD; x.lineWidth = 4;
      x.strokeRect(26, 26, lay.W - 52, lay.H - 52);
      x.lineWidth = 2;
      lay.rects.forEach((r) => x.strokeRect(r.x - 14, r.y - 14, r.w + 28, r.h + 28));
    } else if (frame === "floral") {
      const cw = lay.W * (lay.strip ? 0.5 : 0.46);
      [["tl", 0, 0], ["br", lay.W, lay.H]].concat(lay.strip ? [] : [["tr", lay.W, 0], ["bl", 0, lay.H]]).forEach(([k, px, py]) => {
        const img = FL[k]; if (!img) return;
        const ch = (img.height * cw) / img.width;
        x.drawImage(img, k[1] === "r" ? px - cw : px, k[0] === "b" ? py - ch : py, cw, ch);
      });
      x.strokeStyle = "rgba(176,139,79,0.7)"; x.lineWidth = 2;
      lay.rects.forEach((r) => x.strokeRect(r.x, r.y, r.w, r.h));
    }
  }

  function stickerBox(st, lay) { return st.mode === "strip" ? { x: 0, y: 0, w: lay.W, h: lay.H } : lay.rects[0]; }

  function render(cv, st, scale, ui) {
    const lay = layout(st);
    cv.width = Math.round(lay.W * scale);
    cv.height = Math.round(lay.H * scale);
    const x = cv.getContext("2d");
    x.setTransform(scale, 0, 0, scale, 0, 0);
    drawFrame(x, st, lay, true);
    lay.rects.forEach((r, i) => { if (st.shots[i]) x.drawImage(photoCanvas(st, i, r, scale), r.x, r.y, r.w, r.h); });
    drawFrame(x, st, lay, false);
    drawCaption(x, st, lay);
    // stickers go on last, over everything
    const box = stickerBox(st, lay);
    st.stickers.forEach((s, i) => {
      const px = box.x + s.x * box.w, py = box.y + s.y * box.h, size = s.s * box.w;
      x.save();
      x.translate(px, py); x.rotate(s.r);
      x.font = `${size}px ${EMOJI}`; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = "#000";
      x.fillText(s.e, 0, size * 0.04);
      if (ui && i === st.selected) {
        x.lineWidth = 3 / scale + 1; x.setLineDash([10, 8]);
        x.strokeStyle = "rgba(40,30,20,0.45)"; x.beginPath(); x.arc(0, 0, size * 0.66, 0, Math.PI * 2); x.stroke();
        x.strokeStyle = "#fff"; x.lineDashOffset = 9; x.beginPath(); x.arc(0, 0, size * 0.66, 0, Math.PI * 2); x.stroke();
      }
      x.restore();
    });
  }

  // ==========================================================================
  // The sheet: steps
  // ==========================================================================
  const video = $("bo-video");
  const stage = $("bo-stage");
  const cvPrev = $("bo-canvas");
  let step = "camera";

  function show(which) {
    step = which;
    $("bo-cam").hidden = which !== "camera";
    $("bo-edit").hidden = which !== "edit";
    $("bo-back").hidden = which !== "edit";
    if (which === "edit") {
      $("bo-error").hidden = true;
      syncTools();
      renderAll();
    }
  }

  let lastFocus = null;
  function open(opts) {
    lastFocus = document.activeElement;
    if (!(opts && opts.resume && state.shots.length)) resetState();
    document.body.style.overflow = "hidden";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    syncModeUi();
    buildTrays();
    if (state.shots.length) { show("edit"); refreshThumbs(); } else goCamera();
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load(`80px Parisienne`), document.fonts.load(`500 26px "Cormorant Garamond"`)])
        .then(() => { if (step === "edit") renderAll(); }).catch(() => {});
    }
  }
  function close() {
    aborted = true;
    stopCamera();
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }
  dlg.addEventListener("close", () => {
    aborted = true;
    stopCamera();
    if (!document.querySelector("dialog[open]")) document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus && !window.__boothHandoff) lastFocus.focus({ preventScroll: true });
    window.__boothHandoff = false;
  });
  $("bo-close").addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  $("bo-back").addEventListener("click", () => { state.shots = []; state.shotsId++; cache.clear(); goCamera(); });

  // ==========================================================================
  // Camera
  // ==========================================================================
  let stream = null, facing = "user", mirrored = true, capturing = false, aborted = false;
  const shutter = $("bo-shutter");
  const msg = $("bo-msg");

  function setMsg(text) { msg.textContent = text; msg.hidden = !text; }
  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    video.srcObject = null;
  }
  function noCamera(text) {
    setMsg(text);
    shutter.disabled = true;
    $("bo-flipcam").hidden = true;
  }

  async function startCamera() {
    stopCamera();
    shutter.disabled = true;
    setMsg(L.starting);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return noCamera(L.unavailable);
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
    } catch (e) {
      return noCamera(e && (e.name === "NotAllowedError" || e.name === "SecurityError") ? L.denied : L.unavailable);
    }
    if (!dlg.open || step !== "camera") { stopCamera(); return; }   // closed while the permission prompt was up
    video.srcObject = stream;
    try { await video.play(); } catch (e) { /* autoplay is allowed for muted video */ }
    mirrored = facing === "user";
    video.classList.toggle("is-mirrored", mirrored);
    setMsg("");
    shutter.disabled = false;
    try {
      const cams = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      $("bo-flipcam").hidden = cams.length < 2;
    } catch (e) { $("bo-flipcam").hidden = true; }
  }

  function goCamera() {
    capturing = false;
    aborted = false;
    show("camera");
    $("bo-dots").replaceChildren();
    $("bo-count").textContent = "";
    syncModeUi();
    startCamera();
  }

  function syncModeUi() {
    stage.dataset.mode = state.mode;
    ["photo", "strip"].forEach((m) => $("bo-mode-" + m).setAttribute("aria-pressed", String(state.mode === m)));
    $("bo-hint").textContent = state.mode === "strip" ? L.hintStrip : L.hintPhoto;
  }
  document.querySelectorAll(".booth__mode").forEach((b) => b.addEventListener("click", () => {
    if (capturing) return;
    state.mode = b.dataset.mode;
    syncModeUi();
  }));
  $("bo-flipcam").addEventListener("click", () => { if (capturing) return; facing = facing === "user" ? "environment" : "user"; startCamera(); });

  function grab() {
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return null;
    const k = Math.min(1, 1280 / Math.max(vw, vh));
    const c = document.createElement("canvas");
    c.width = Math.round(vw * k); c.height = Math.round(vh * k);
    const x = c.getContext("2d");
    if (mirrored) { x.translate(c.width, 0); x.scale(-1, 1); }   // saved as it looked in the preview
    x.drawImage(video, 0, 0, c.width, c.height);
    return c;
  }

  function flash() {
    const f = $("bo-flash");
    f.classList.remove("is-on"); void f.offsetWidth; f.classList.add("is-on");
  }

  shutter.addEventListener("click", async () => {
    if (capturing || !stream) return;
    capturing = true; aborted = false;
    shutter.disabled = true;
    const n = state.mode === "strip" ? cfg.stripShots : 1;
    const dots = $("bo-dots");
    dots.replaceChildren(...Array.from({ length: n }, () => document.createElement("i")));
    dots.hidden = n < 2;
    const shots = [];
    const count = $("bo-count");
    for (let i = 0; i < n; i++) {
      for (let t = cfg.countdown; t > 0; t--) {
        count.textContent = String(t);
        count.classList.remove("is-on"); void count.offsetWidth; count.classList.add("is-on");
        await wait(1000);
        if (aborted) { capturing = false; return; }
      }
      count.textContent = "";
      flash();
      const f = grab();
      if (!f) { capturing = false; shutter.disabled = false; return; }
      shots.push(f);
      if (dots.children[i]) dots.children[i].classList.add("is-on");
      if (i < n - 1) { await wait(reduced() ? 400 : 900); if (aborted) { capturing = false; return; } }
    }
    capturing = false;
    setShots(shots);
  });

  function setShots(shots) {
    state.shots = shots; state.shotsId++; cache.clear();
    state.stickers = []; state.selected = -1; state.flip = false;
    stopCamera();
    show("edit");
    refreshThumbs();
  }

  // a photo chosen from the phone (or taken in its own camera app)
  function fileToCanvas(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const k = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement("canvas");
          c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          resolve(c);
        } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }
  async function onFile(input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    try {
      const c = await fileToCanvas(file);
      state.mode = "photo";            // one chosen photo is a single photo, not a strip
      syncModeUi();
      stopCamera();
      setShots([c]);
    } catch (e) {
      setMsg(L.readError);
    }
  }
  $("bo-file").addEventListener("change", (e) => onFile(e.target));
  $("bo-file-native").addEventListener("change", (e) => onFile(e.target));

  // ==========================================================================
  // Editing
  // ==========================================================================
  function previewScale(lay) { return Math.min(1, (lay.strip ? 520 : 680) / lay.W); }
  function renderAll() {
    if (!state.shots.length) return;
    const lay = layout(state);
    render(cvPrev, state, previewScale(lay), true);
  }

  // tabs
  document.querySelectorAll(".booth__tab").forEach((t) => t.addEventListener("click", () => selectTab(t.dataset.tab)));
  function selectTab(name) {
    document.querySelectorAll(".booth__tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    ["filters", "frames", "stickers", "caption"].forEach((p) => { $("bo-panel-" + p).hidden = p !== name; });
    if (name !== "stickers" && state.selected >= 0) { state.selected = -1; syncTools(); renderAll(); }
  }

  // thumbnails: the filters on this very photo, and each frame as it would look
  function chip(label, canvasEl, pressed, onClick) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "booth__chip";
    b.setAttribute("aria-pressed", String(pressed));
    const span = document.createElement("span"); span.textContent = label;
    b.append(canvasEl, span);
    b.addEventListener("click", onClick);
    return b;
  }
  function buildTrays() {
    // stickers
    const tray = $("bo-stickers");
    tray.replaceChildren(...cfg.stickers.map((e) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "booth__emoji"; b.textContent = e; b.setAttribute("aria-label", e);
      b.addEventListener("click", () => {
        const s = { e, x: 0.5, y: 0.5, s: state.mode === "strip" ? 0.26 : 0.22, r: 0 };
        state.stickers.push(s); state.selected = state.stickers.length - 1;
        syncTools(); renderAll();
      });
      return b;
    }));
    $("bo-caption").maxLength = cfg.maxCaption;
    $("bo-caption").value = state.caption;
  }
  function refreshThumbs() {
    if (!state.shots.length) return;
    const fr = $("bo-filters");
    fr.replaceChildren(...Object.keys(cfg.filters).map((id) => {
      const t = { ...state, filter: id, frame: "none", mode: "photo", stickers: [], flip: state.flip, shots: [state.shots[0]] };
      const c = document.createElement("canvas");
      render(c, t, 80 / 1080, false);
      return chip(cfg.filters[id], c, state.filter === id, () => { state.filter = id; refreshThumbs(); renderAll(); });
    }));
    const fm = $("bo-frames");
    fm.replaceChildren(...Object.keys(cfg.frames).map((id) => {
      const t = { ...state, frame: id, stickers: [], selected: -1 };
      const lay = layout(t);
      const c = document.createElement("canvas");
      render(c, t, (t.mode === "strip" ? 60 : 84) / lay.W, false);
      return chip(cfg.frames[id], c, state.frame === id, () => { state.frame = id; refreshThumbs(); renderAll(); });
    }));
  }
  $("bo-flip").addEventListener("click", () => { state.flip = !state.flip; refreshThumbs(); renderAll(); });
  $("bo-caption").addEventListener("input", (e) => { state.caption = e.target.value; renderAll(); });

  // ---- stickers: tap to select, drag to move, pinch to resize and turn ------------------------
  function syncTools() {
    const on = state.selected >= 0;
    ["smaller", "bigger", "rotate", "remove"].forEach((k) => { $("bo-st-" + k).disabled = !on; });
  }
  const sel = () => state.stickers[state.selected];
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  $("bo-st-smaller").addEventListener("click", () => { const s = sel(); if (s) { s.s = Math.max(0.06, s.s * 0.85); renderAll(); } });
  $("bo-st-bigger").addEventListener("click", () => { const s = sel(); if (s) { s.s = Math.min(0.8, s.s * 1.18); renderAll(); } });
  $("bo-st-rotate").addEventListener("click", () => { const s = sel(); if (s) { s.r += Math.PI / 12; renderAll(); } });
  $("bo-st-remove").addEventListener("click", () => { if (state.selected >= 0) { state.stickers.splice(state.selected, 1); state.selected = -1; syncTools(); renderAll(); } });

  const pointers = new Map();
  let drag = null, pinch = null;
  function toLogical(e) {
    const lay = layout(state);
    const r = cvPrev.getBoundingClientRect();
    return { lx: ((e.clientX - r.left) / r.width) * lay.W, ly: ((e.clientY - r.top) / r.height) * lay.H, lay };
  }
  function hit(lx, ly, lay) {
    const box = stickerBox(state, lay);
    for (let i = state.stickers.length - 1; i >= 0; i--) {
      const s = state.stickers[i];
      const dx = lx - (box.x + s.x * box.w), dy = ly - (box.y + s.y * box.h);
      if (Math.hypot(dx, dy) <= s.s * box.w * 0.62) return i;
    }
    return -1;
  }
  cvPrev.addEventListener("pointerdown", (e) => {
    cvPrev.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = toLogical(e);
    if (pointers.size === 1) {
      const i = hit(p.lx, p.ly, p.lay);
      state.selected = i; syncTools();
      if (i >= 0) {
        const box = stickerBox(state, p.lay), s = state.stickers[i];
        drag = { dx: p.lx - (box.x + s.x * box.w), dy: p.ly - (box.y + s.y * box.h) };
        if ($("bo-panel-stickers").hidden) selectTab("stickers");
      } else drag = null;
      renderAll();
    } else if (pointers.size === 2 && state.selected >= 0) {
      const [a, b] = [...pointers.values()];
      const s = sel();
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), a: Math.atan2(b.y - a.y, b.x - a.x), s: s.s, r: s.r };
      drag = null;
    }
  });
  cvPrev.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = sel();
    if (!s) return;
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      s.s = Math.min(0.8, Math.max(0.06, pinch.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d)));
      s.r = pinch.r + (Math.atan2(b.y - a.y, b.x - a.x) - pinch.a);
      renderAll();
    } else if (drag) {
      const p = toLogical(e), box = stickerBox(state, p.lay);
      s.x = clamp01((p.lx - drag.dx - box.x) / box.w);
      s.y = clamp01((p.ly - drag.dy - box.y) / box.h);
      renderAll();
    }
  });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) drag = null;
  };
  cvPrev.addEventListener("pointerup", endPointer);
  cvPrev.addEventListener("pointercancel", endPointer);
  // keyboard: arrows move the selected sticker, + and - resize it, Delete removes it
  cvPrev.tabIndex = 0;
  cvPrev.addEventListener("keydown", (e) => {
    const s = sel();
    if (!s) return;
    const step = 0.02;
    if (e.key === "ArrowLeft") s.x = clamp01(s.x - step);
    else if (e.key === "ArrowRight") s.x = clamp01(s.x + step);
    else if (e.key === "ArrowUp") s.y = clamp01(s.y - step);
    else if (e.key === "ArrowDown") s.y = clamp01(s.y + step);
    else if (e.key === "+" || e.key === "=") s.s = Math.min(0.8, s.s * 1.1);
    else if (e.key === "-") s.s = Math.max(0.06, s.s / 1.1);
    else if (e.key === "Delete" || e.key === "Backspace") { state.stickers.splice(state.selected, 1); state.selected = -1; syncTools(); }
    else return;
    e.preventDefault(); renderAll();
  });

  // ==========================================================================
  // Saving: Download, and Post to the wall
  // ==========================================================================
  const toBlob = (cv, q) => new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/jpeg", q));
  const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function showError(text) { const e = $("bo-error"); e.textContent = text; e.hidden = !text; }

  async function exportFull() {
    const cv = document.createElement("canvas");
    render(cv, { ...state, selected: -1 }, 1, false);
    return toBlob(cv, 0.92);
  }
  // On the wall a single photo goes up without its frame (the wall's own cards are the frame);
  // a strip is its own object and goes up whole.
  async function exportWall() {
    const cv = document.createElement("canvas");
    if (state.mode === "strip") {
      render(cv, { ...state, selected: -1 }, 0.75, false);
      return { blob: await toBlob(cv, 0.86), ratio: cv.width / cv.height };
    }
    render(cv, { ...state, frame: "none", selected: -1 }, 900 / 1080, false);
    return { blob: await toBlob(cv, 0.86), ratio: 1 };
  }

  let saving = false;
  $("bo-download").addEventListener("click", async () => {
    if (saving || !state.shots.length) return;
    saving = true; showError("");
    const label = $("bo-download-label"), idle = label.textContent;
    label.textContent = L.saving;
    try {
      const blob = await exportFull();
      const name = "isz-and-khaty-photobooth-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".jpg";
      const file = new File([blob], name, { type: "image/jpeg" });
      // On an iPhone the share sheet is how a picture reaches Photos ("Save Image")
      if (isIOS() && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; }
        catch (e) { if (e && e.name === "AbortError") return; }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      showError(L.readError);
    } finally {
      saving = false;
      label.textContent = idle;
    }
  });

  $("bo-post").addEventListener("click", async () => {
    if (saving || !state.shots.length) return;
    saving = true; showError("");
    try {
      const out = await exportWall();
      window.__boothHandoff = true;
      close();
      window.dispatchEvent(new CustomEvent("booth:post", { detail: out }));
    } catch (e) {
      showError(L.readError);
    } finally {
      saving = false;
    }
  });

  window.PhotoBooth = { open, state };
})();
