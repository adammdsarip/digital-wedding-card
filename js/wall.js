/**
 * wall.js
 * ------------------------------------------------------------
 * The guest wall: the grid of photo cards, the sheet guests use to add
 * theirs (selfie, name, wish, stickers), and hearts.
 *
 * Guests' words are untrusted. Everything below puts them on the page with
 * textContent, never as HTML, so nothing a guest types can run as code.
 *
 * Where the posts live is isolated in createStore(). Today it is a PREVIEW:
 * the sample posts from config.js, and new ones kept only until the page is
 * reloaded. Supabase connects there, in one place, without touching the rest.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const cfg = W && W.wall;
  const grid = document.getElementById("wall-grid");
  const dialog = document.getElementById("wall-dialog");
  if (!cfg || !grid || !dialog) return;

  const $ = (id) => document.getElementById(id);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const refreshScroll = () => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
  const L = cfg.labels;

  // ==========================================================================
  // The store: where posts live. A post is
  //   { id, name, wish, emojis: [], photo: <url>, created: <ms>, hearts: <n> }
  // ==========================================================================
  function createStore() {
    // PREVIEW. Connect the real thing here (next step): list() returns the
    // posts newest first, add() uploads the photo and saves the post and returns
    // it, heart() saves a heart (or takes it back) and returns the new count.
    const now = Date.now();
    const posts = (cfg.samples || []).map((s, i) => ({
      id: "sample-" + i, name: s.name, wish: s.wish, emojis: s.emojis || [], photo: s.photo,
      created: now - s.minutesAgo * 60000, hearts: s.hearts || 0,
    }));
    return {
      preview: true,
      async list() { return posts.slice().sort((a, b) => b.created - a.created); },
      async add({ name, wish, emojis, blob }) {
        const post = {
          id: "new-" + now + "-" + posts.length, name, wish, emojis,
          photo: URL.createObjectURL(blob), created: Date.now(), hearts: 0,
        };
        posts.push(post);
        return post;
      },
      async heart(id, on) {
        const p = posts.find((x) => x.id === id);
        if (p) p.hearts = Math.max(0, p.hearts + (on ? 1 : -1));
        return p ? p.hearts : 0;
      },
    };
  }
  const store = createStore();

  // Which cards this guest has hearted, kept on their own phone
  const HEARTS_KEY = "wall:hearts";
  let mine = new Set();
  try { mine = new Set(JSON.parse(localStorage.getItem(HEARTS_KEY) || "[]")); } catch (e) { /* private mode */ }
  const saveMine = () => { try { localStorage.setItem(HEARTS_KEY, JSON.stringify([...mine])); } catch (e) { /* ignore */ } };

  // ==========================================================================
  // The wall
  // ==========================================================================
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.7 3.7 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.3 0 5.4 3.2 4.2 6.7-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>';
  let posts = [];
  let shown = 0;

  // Two columns, balanced in code rather than by CSS columns: a new post goes to
  // the top of the shorter column, and nothing already on the wall moves sideways.
  let cols = [];
  function resetColumns() {
    cols = [el("div", "wall__col"), el("div", "wall__col")];
    cols.forEach((c) => c.setAttribute("role", "none"));
    grid.replaceChildren(...cols);
  }
  function place(c, atTop) {
    const shorter = cols[0].offsetHeight <= cols[1].offsetHeight ? cols[0] : cols[1];
    if (atTop) shorter.prepend(c); else shorter.append(c);
  }

  function ago(ms) {
    const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (m < 1) return "Just now";
    if (m < 60) return m + " min ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
    const d = Math.round(h / 24);
    return d === 1 ? "Yesterday" : d + " days ago";
  }

  // a steady little tilt per card, from its id, so cards keep theirs as others arrive
  function tilt(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return (((h % 17) + 17) % 17 / 17 - 0.5) * 3.4;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function card(p, isNew) {
    const li = el("article", "wall__card" + (isNew ? " is-new" : ""));
    li.setAttribute("role", "listitem");
    li.dataset.id = p.id;
    li.style.setProperty("--tilt", tilt(p.id).toFixed(2) + "deg");

    const photo = el("div", "wall__photo");
    const img = new Image();
    img.src = p.photo;
    img.alt = "Photo from " + p.name;
    img.loading = "lazy";
    img.decoding = "async";
    photo.append(img);

    const name = el("p", "wall__name", p.name);
    li.append(photo, name);
    if (p.wish) li.append(el("p", "wall__wish", p.wish));

    const foot = el("div", "wall__foot");
    foot.append(el("span", "wall__time", ago(p.created)));
    if (p.emojis.length) {
      const e = el("span", "wall__emojis", p.emojis.join(" "));
      e.setAttribute("aria-hidden", "true");
      foot.append(e);
    }
    const heart = el("button", "wall__heart");
    heart.type = "button";
    heart.innerHTML = HEART;
    const count = el("span", "wall__hearts", String(p.hearts));
    heart.append(count);
    const setHeart = (on) => {
      heart.setAttribute("aria-pressed", on ? "true" : "false");
      heart.setAttribute("aria-label", L.love + " (" + p.name + "), " + p.hearts);
    };
    setHeart(mine.has(p.id));
    heart.addEventListener("click", async () => {
      const on = !mine.has(p.id);
      if (on) mine.add(p.id); else mine.delete(p.id);
      saveMine();
      p.hearts = await store.heart(p.id, on);
      count.textContent = String(p.hearts);
      setHeart(on);
    });
    foot.append(heart);
    li.append(foot);
    return li;
  }

  function updateCount() {
    const n = posts.length;
    const c = cfg.count;
    $("wall-count").textContent = n === 0 ? c[0] : n === 1 ? c[1] : n + " " + c[2];
    $("wall-empty").hidden = n > 0;
    const more = $("wall-more");
    more.hidden = shown >= n;
  }

  function showMore() {
    const next = posts.slice(shown, shown + cfg.pageSize);
    next.forEach((p) => place(card(p, false), false));
    shown += next.length;
    updateCount();
    refreshScroll();
  }
  $("wall-more").addEventListener("click", showMore);

  async function load() {
    posts = await store.list();
    resetColumns();
    shown = 0;
    showMore();
  }

  // ==========================================================================
  // Adding a photo
  // ==========================================================================
  const form = $("wd-form");
  const preview = $("wd-preview");
  const photoBox = $("wd-photo");
  const busy = $("wd-busy");
  const nameInput = $("wd-name");
  const wishInput = $("wd-wish");
  const submit = $("wd-submit");
  const emojiBox = $("wd-emojis");
  let photoBlob = null;
  let chosen = [];
  let sending = false;

  function showError(id, msg, field) {
    const e = $(id);
    e.textContent = msg;
    e.hidden = false;
    if (field) field.setAttribute("aria-invalid", "true");
  }
  function clearError(id, field) {
    $(id).hidden = true;
    if (field) field.removeAttribute("aria-invalid");
  }

  // sticker buttons
  cfg.emojis.forEach((emoji) => {
    const b = el("button", "emojis__btn", emoji);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      const i = chosen.indexOf(emoji);
      if (i >= 0) chosen.splice(i, 1); else if (chosen.length < cfg.maxEmojis) chosen.push(emoji);
      syncEmojis();
    });
    emojiBox.append(b);
  });
  function syncEmojis() {
    emojiBox.querySelectorAll(".emojis__btn").forEach((b) => {
      const on = chosen.includes(b.textContent);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.disabled = !on && chosen.length >= cfg.maxEmojis;
    });
  }

  function syncCount() {
    $("wd-count").textContent = wishInput.value.length + " / " + wishInput.maxLength;
  }
  wishInput.addEventListener("input", syncCount);
  nameInput.addEventListener("input", () => clearError("wd-name-error", nameInput));

  // A guest's photo is cropped to a square and shrunk to 900px on their own
  // phone, so it uploads quickly and the wall stays light.
  function prepare(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const side = Math.min(img.naturalWidth, img.naturalHeight);
          const out = Math.min(900, side);
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = out;
          canvas.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out);
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no blob"))), "image/jpeg", 0.82);
        } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }

  async function onFile(input) {
    const file = input.files && input.files[0];
    input.value = "";                       // so choosing the same photo again still fires
    if (!file) return;
    clearError("wd-photo-error");
    busy.hidden = false;
    try {
      const blob = await prepare(file);
      photoBlob = blob;
      if (preview.dataset.url) URL.revokeObjectURL(preview.dataset.url);
      const url = URL.createObjectURL(blob);
      preview.dataset.url = url;
      preview.src = url;
      preview.hidden = false;
      $("wd-photo-empty").hidden = true;
      $("wd-take-label").textContent = L.retake;
    } catch (e) {
      showError("wd-photo-error", cfg.errors.read);
    } finally {
      busy.hidden = true;
    }
  }
  $("wd-file-take").addEventListener("change", (e) => onFile(e.target));
  $("wd-file-pick").addEventListener("change", (e) => onFile(e.target));

  function reset() {
    form.reset();
    form.hidden = false;
    $("wd-done").hidden = true;
    photoBlob = null;
    chosen = [];
    syncEmojis();
    syncCount();
    if (preview.dataset.url) { URL.revokeObjectURL(preview.dataset.url); delete preview.dataset.url; }
    preview.removeAttribute("src");
    preview.hidden = true;
    $("wd-photo-empty").hidden = false;
    busy.hidden = true;
    $("wd-take-label").textContent = L.take;
    ["wd-photo-error", "wd-name-error", "wd-fail"].forEach((id) => { $(id).hidden = true; });
    nameInput.removeAttribute("aria-invalid");
    submit.disabled = false;
    $("wd-submit-label").textContent = L.post;
    sending = false;
  }

  // ---- the sheet: open, close ---------------------------------------------------------
  let lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    reset();
    document.body.style.overflow = "hidden";
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  }
  function close() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  }
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });
  $("wall-add").addEventListener("click", open);
  $("wd-close").addEventListener("click", close);
  // a tap on the dimmed area outside the sheet closes it
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });

  // ---- sending -----------------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    $("wd-fail").hidden = true;
    let firstBad = null;
    if (!photoBlob) { showError("wd-photo-error", cfg.errors.photo); firstBad = $("wd-take"); }
    if (!nameInput.value.trim()) { showError("wd-name-error", cfg.errors.name, nameInput); firstBad = firstBad || nameInput; }
    if (firstBad) {
      (firstBad === nameInput ? nameInput : photoBox).scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
      if (firstBad === nameInput) nameInput.focus({ preventScroll: true });
      return;
    }
    // a bot filled the hidden field: look done, post nothing
    if (form.elements.website && form.elements.website.value) return finish(null);

    sending = true;
    submit.disabled = true;
    $("wd-submit-label").textContent = L.posting;
    try {
      const post = await store.add({
        name: nameInput.value.trim(),
        wish: wishInput.value.trim(),
        emojis: chosen.slice(),
        blob: photoBlob,
      });
      finish(post);
    } catch (err) {
      $("wd-fail").textContent = cfg.errors.send;
      $("wd-fail").hidden = false;
      submit.disabled = false;
      $("wd-submit-label").textContent = L.post;
      sending = false;
    }
  });

  let newest = null;
  function finish(post) {
    if (post) {
      posts.unshift(post);
      const c = card(post, true);
      place(c, true);
      shown += 1;
      newest = c;
      updateCount();
      refreshScroll();
    }
    form.hidden = true;
    $("wd-done").hidden = false;
    $("wd-see").focus({ preventScroll: true });
  }
  $("wd-see").addEventListener("click", () => {
    close();
    if (newest) newest.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
  });

  load();
})();
