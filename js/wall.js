/**
 * wall.js
 * ------------------------------------------------------------
 * The guest wall: the grid of photo cards, the sheet guests use to add
 * their booth photo (name, wish), and hearts.
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
  //   { id, name, wish, photo: <url>, ratio: <width / height>, created: <ms>, hearts: <n> }
  // ==========================================================================
  function createStore() {
    // PREVIEW. Connect the real thing here (next step): list() returns the
    // posts newest first, add() uploads the photo and saves the post and returns
    // it, heart() saves a heart (or takes it back) and returns the new count.
    const now = Date.now();
    const posts = (cfg.samples || []).map((s, i) => ({
      id: "sample-" + i, name: s.name, wish: s.wish, photo: s.photo, ratio: 1,
      created: now - s.minutesAgo * 60000, hearts: s.hearts || 0,
    }));
    return {
      preview: true,
      async list() { return posts.slice().sort((a, b) => b.created - a.created); },
      async add({ name, wish, blob, ratio }) {
        const post = {
          id: "new-" + now + "-" + posts.length, name, wish, ratio,
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
    if (p.ratio && p.ratio !== 1) photo.style.aspectRatio = String(p.ratio);   // a strip is tall
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
  // Adding a photo: the booth makes the picture, this sheet takes the name and the wish
  // ==========================================================================
  const form = $("wd-form");
  const preview = $("wd-preview");
  const nameInput = $("wd-name");
  const wishInput = $("wd-wish");
  const submit = $("wd-submit");
  let photo = null;              // { blob, ratio } from the booth
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

  function syncCount() {
    $("wd-count").textContent = wishInput.value.length + " / " + wishInput.maxLength;
  }
  wishInput.addEventListener("input", syncCount);
  nameInput.addEventListener("input", () => clearError("wd-name-error", nameInput));

  function setPhoto(p) {
    photo = p;
    if (preview.dataset.url) URL.revokeObjectURL(preview.dataset.url);
    const url = URL.createObjectURL(p.blob);
    preview.dataset.url = url;
    preview.src = url;
    $("wd-photo").style.setProperty("--ratio", String(p.ratio || 1));
  }

  function reset() {
    form.reset();
    form.hidden = false;
    $("wd-done").hidden = true;
    syncCount();
    ["wd-name-error", "wd-fail"].forEach((id) => { $(id).hidden = true; });
    nameInput.removeAttribute("aria-invalid");
    submit.disabled = false;
    $("wd-submit-label").textContent = L.post;
    sending = false;
  }

  // ---- the sheet: open, close ---------------------------------------------------------
  let lastFocus = null;
  function open() {
    lastFocus = lastFocus || document.activeElement;
    document.body.style.overflow = "hidden";
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  }
  function close() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  }
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus && !window.__wallHandoff) lastFocus.focus({ preventScroll: true });
    if (!window.__wallHandoff) lastFocus = null;
    window.__wallHandoff = false;
  });

  // ---- the booth is closed until the wedding day (booth-lock.js) --------------------------------
  const lockCfg = (W.booth && W.booth.lock) || {};
  const addBtn = $("wall-add");
  function syncLock() {
    const st = window.BoothLock ? window.BoothLock.status() : { locked: false, preview: false };
    addBtn.disabled = st.locked;
    addBtn.classList.toggle("is-locked", st.locked);
    $("wall-add-icon").setAttribute("href", st.locked ? "#i-lock" : "#i-camera");
    $("wall-add-label").textContent = st.locked ? lockCfg.button : cfg.add;
    $("wall-lock").hidden = !st.locked;
    $("wall-test").hidden = !st.preview;
    if (st.locked) {
      $("wall-lock-note").textContent = String(lockCfg.note || "").replace("{date}", window.BoothLock.dateText());
      const when = window.BoothLock.whenText(st.ms);
      $("wall-lock-when").textContent = when ? String(lockCfg.opensIn).replace("{when}", when) : lockCfg.opensSoon;
    }
    if (st.preview) { $("wall-test-text").textContent = lockCfg.test; $("wall-test-undo").textContent = lockCfg.relock; }
  }
  $("wall-test-undo").addEventListener("click", () => { if (window.BoothLock) window.BoothLock.clearPreview(); });
  window.addEventListener("booth:lockchange", syncLock);
  syncLock();

  // the button opens the photo booth; the booth hands its picture back through this event
  addBtn.addEventListener("click", () => {
    if (addBtn.disabled) return;
    lastFocus = document.activeElement;
    if (window.PhotoBooth) window.PhotoBooth.open();
  });
  window.addEventListener("booth:post", (e) => {
    reset();
    setPhoto(e.detail);
    open();
  });
  $("wd-edit").addEventListener("click", () => {
    window.__wallHandoff = true;
    close();
    if (window.PhotoBooth) window.PhotoBooth.open({ resume: true });
  });
  $("wd-close").addEventListener("click", close);
  // a tap on the dimmed area outside the sheet closes it
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });

  // ---- sending -----------------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !photo) return;
    $("wd-fail").hidden = true;
    if (!nameInput.value.trim()) {
      showError("wd-name-error", cfg.errors.name, nameInput);
      nameInput.focus({ preventScroll: false });
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
        blob: photo.blob,
        ratio: photo.ratio,
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
