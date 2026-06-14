/* =========================================================
   TOTV PLUS (توتيفي) — منطق الصفحة الرئيسية
   ========================================================= */
(function () {
  "use strict";
  const CFG = window.TOTV;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- صور ---------- */
  const IMG = {
    poster: (p) => (p ? `${CFG.IMG_BASE}/w342${p}` : ph("poster")),
    backdrop: (p) => (p ? `${CFG.IMG_BASE}/w1280${p}` : ""),
    profile: (p) => (p ? `${CFG.IMG_BASE}/w185${p}` : ph("face")),
    wall: (p) => `${CFG.IMG_BASE}/w185${p}`,
  };
  function ph(kind) {
    const label = kind === "face" ? "بلا صورة" : "TOTV+";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'><rect width='200' height='300' fill='#16161A'/><text x='100' y='155' fill='#7C786C' font-family='sans-serif' font-size='16' text-anchor='middle'>${label}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------- شبكة ---------- */
  async function api(path, params = {}) {
    const url = new URL(CFG.API_BASE + path);
    url.searchParams.set("api_key", CFG.API_KEY);
    if (!("language" in params)) url.searchParams.set("language", CFG.LANG);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }
  const isMovie = (it) => it.media_type === "movie" || (!!it.title && !it.name);
  const titleOf = (it) => it.title || it.name || "بدون عنوان";
  const yearOf = (it) => (it.release_date || it.first_air_date || "").slice(0, 4);

  /* =========================================================
     شريط التنقّل + أزرار التحميل + الروابط الثابتة
     ========================================================= */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  // أزرار التحميل في الواجهة والقسم
  setHref("#btnHeroDownload", CFG.DOWNLOAD.PAGE);
  setHref("#btnAndroid", CFG.DOWNLOAD.ANDROID_APK);
  setHref("#btnIos", CFG.DOWNLOAD.IOS);
  setHref("#btnTv", CFG.DOWNLOAD.DOWNLOADER_APP);
  setHref("#waFloat", CFG.CONTACT.WHATSAPP);
  setHref("#waCard", CFG.CONTACT.WHATSAPP);
  setHref("#mailCard", "mailto:" + CFG.CONTACT.EMAIL);
  const tvCode = $("#codeTv"); if (tvCode) tvCode.textContent = CFG.DOWNLOAD.DOWNLOADER_CODE;
  const waLabel = $("#waLabel"); if (waLabel) waLabel.textContent = CFG.CONTACT.WHATSAPP_LABEL;
  const mailLabel = $("#mailLabel"); if (mailLabel) mailLabel.textContent = CFG.CONTACT.EMAIL;

  function setHref(sel, href) { const el = $(sel); if (el) el.href = href; }

  /* =========================================================
     بطاقات وصفوف الأفلام
     ========================================================= */
  function cardEl(item, rank) {
    const el = document.createElement("article");
    el.className = "card"; el.tabIndex = 0; el.setAttribute("role", "button");
    const rate = item.vote_average ? item.vote_average.toFixed(1) : null;
    el.innerHTML = `
      ${rank ? `<span class="card__rank">${rank}</span>` : ""}
      ${rate ? `<span class="card__rate">★ ${rate}</span>` : ""}
      <img class="card__poster" loading="lazy" alt="${esc(titleOf(item))}" src="${IMG.poster(item.poster_path)}">
      <div class="card__meta">
        <div class="card__title">${esc(titleOf(item))}</div>
        <div class="card__sub">${isMovie(item) ? "فيلم" : "مسلسل"}${yearOf(item) ? " · " + yearOf(item) : ""}</div>
      </div>`;
    const open = () => openTitle(item.id, isMovie(item) ? "movie" : "tv");
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    return el;
  }
  function fillRail(name, items, ranked) {
    const rail = $(`[data-rail="${name}"]`); if (!rail) return;
    rail.innerHTML = "";
    if (!items || !items.length) { rail.innerHTML = `<p class="empty-note">تعذّر تحميل هذا القسم حالياً. تأكّد من الاتصال بالإنترنت.</p>`; return; }
    items.forEach((it, i) => rail.appendChild(cardEl(it, ranked ? i + 1 : null)));
  }
  function skeletons(name, n = 8) {
    const rail = $(`[data-rail="${name}"]`);
    if (rail) rail.innerHTML = Array.from({ length: n }, () => `<div class="skeleton"></div>`).join("");
  }

  /* =========================================================
     تحميل المحتوى
     ========================================================= */
  async function loadHomepage() {
    renderPlans();
    ["trending", "movies", "series"].forEach((n) => skeletons(n));
    const sg = $("#starsGrid");
    if (sg) sg.innerHTML = Array.from({ length: 12 }, () => `<div class="star"><div class="skeleton" style="width:118px;height:118px;border-radius:50%;margin:0 auto"></div></div>`).join("");

    try {
      const tr = await api("/trending/all/week");
      const items = (tr.results || []).filter((x) => x.poster_path).slice(0, 18);
      fillRail("trending", items.slice(0, 14), true);
      buildWall(items);
    } catch (e) { fillRail("trending", null); }

    try {
      const m = await api("/movie/popular", { page: 1 });
      fillRail("movies", (m.results || []).filter((x) => x.poster_path).slice(0, 16));
      if (m.total_results) animateCount("#statMovies", m.total_results);
    } catch (e) { fillRail("movies", null); }

    try {
      const t = await api("/tv/popular", { page: 1 });
      fillRail("series", (t.results || []).filter((x) => x.poster_path).slice(0, 16));
      if (t.total_results) animateCount("#statSeries", t.total_results);
    } catch (e) { fillRail("series", null); }

    try {
      const p = await api("/person/popular", { page: 1 });
      buildStars((p.results || []).filter((x) => x.profile_path).slice(0, 18));
    } catch (e) { if (sg) sg.innerHTML = `<p class="empty-note">تعذّر تحميل قائمة النجوم حالياً.</p>`; }
  }

  function buildWall(items) {
    const wall = $("#posterWall"); if (!wall) return;
    wall.innerHTML = items.concat(items).slice(0, 32).map((it) => `<img loading="lazy" alt="" src="${IMG.wall(it.poster_path)}">`).join("");
  }
  function buildStars(people) {
    const grid = $("#starsGrid"); if (!grid) return; grid.innerHTML = "";
    people.forEach((p) => {
      const el = document.createElement("div");
      el.className = "star"; el.tabIndex = 0; el.setAttribute("role", "button");
      const known = (p.known_for || []).map((k) => k.title || k.name).filter(Boolean)[0] || "ممثل";
      el.innerHTML = `<img class="star__photo" loading="lazy" alt="${esc(p.name)}" src="${IMG.profile(p.profile_path)}"><div class="star__name">${esc(p.name)}</div><div class="star__known">${esc(known)}</div>`;
      const open = () => openPerson(p.id);
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      grid.appendChild(el);
    });
  }
  function animateCount(sel, target) {
    const el = $(sel); if (!el) return;
    const end = Math.min(target, 99999); let cur = 0; const step = Math.max(1, Math.floor(end / 40));
    const t = setInterval(() => { cur += step; if (cur >= end) { cur = end; clearInterval(t); } el.textContent = "+" + cur.toLocaleString("en-US"); }, 24);
  }

  /* =========================================================
     الباقات
     ========================================================= */
  function renderPlans() {
    const grid = $("#plansGrid"); if (!grid) return;
    grid.innerHTML = "";
    CFG.PLANS.forEach((p) => {
      const el = document.createElement("article");
      el.className = "plan" + (p.popular ? " plan--popular" : "");
      el.innerHTML = `
        ${p.popular ? `<span class="plan__badge">الأكثر طلباً</span>` : ""}
        <h3 class="plan__name">${esc(p.name)}</h3>
        <div class="plan__price"><b>${esc(p.price)}</b><small>دينار</small></div>
        <div class="plan__cur">${esc(p.period)}</div>
        <ul class="plan__feats">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <a class="btn ${p.popular ? "btn--gold" : "btn--ghost"} btn--block" href="${CFG.PAYMENT_URL}" target="_blank" rel="noopener">اشترك الآن</a>`;
      grid.appendChild(el);
    });
  }

  /* =========================================================
     النافذة: تفاصيل العمل + القصة + الطاقم
     ========================================================= */
  const modal = $("#modal"), modalBody = $("#modalBody"), modalPanel = $("#modalPanel");
  let lastFocus = null;
  function openModal() { lastFocus = document.activeElement; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; modalPanel.scrollTop = 0; modalPanel.focus(); }
  function closeModal() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lastFocus?.focus?.(); }
  $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
  function loading() { modalBody.innerHTML = `<div style="padding:80px 26px;text-align:center;color:#7C786C">جارٍ التحميل…</div>`; }

  async function detailsWithStory(id, type) {
    const d = await api(`/${type}/${id}`, { append_to_response: "credits" });
    if (!d.overview || d.overview.trim().length < 10) {
      try { const en = await api(`/${type}/${id}`, { language: CFG.LANG_FALLBACK }); if (en.overview) d.overview = en.overview; } catch (_) {}
    }
    return d;
  }
  async function openTitle(id, type) {
    openModal(); loading();
    try {
      const d = await detailsWithStory(id, type);
      const cast = (d.credits?.cast || []).slice(0, 18);
      const genres = (d.genres || []).map((g) => g.name);
      const rate = d.vote_average ? d.vote_average.toFixed(1) : null;
      const runtime = d.runtime || (d.episode_run_time && d.episode_run_time[0]);
      const year = (d.release_date || d.first_air_date || "").slice(0, 4);
      modalBody.innerHTML = `
        <section class="detail__hero">
          ${d.backdrop_path ? `<img class="detail__backdrop" alt="" src="${IMG.backdrop(d.backdrop_path)}">` : ""}
          <div class="detail__head">
            <img class="detail__poster" alt="${esc(titleOf(d))}" src="${IMG.poster(d.poster_path)}">
            <div class="detail__titles">
              <h2>${esc(titleOf(d))}</h2>
              ${d.tagline ? `<p class="detail__year">${esc(d.tagline)}</p>` : year ? `<p class="detail__year">${year}</p>` : ""}
              <div class="detail__chips">
                <span class="chip">${type === "movie" ? "فيلم" : "مسلسل"}</span>
                ${rate ? `<span class="chip chip--rate">★ ${rate}</span>` : ""}
                ${year ? `<span class="chip">${year}</span>` : ""}
                ${runtime ? `<span class="chip">${runtime} دقيقة</span>` : ""}
                ${d.number_of_seasons ? `<span class="chip">${d.number_of_seasons} موسم</span>` : ""}
                ${genres.map((g) => `<span class="chip">${esc(g)}</span>`).join("")}
              </div>
            </div>
          </div>
        </section>
        <div class="detail__body">
          <h3 class="detail__label">القصة</h3>
          <p class="detail__overview">${d.overview ? esc(d.overview) : "لا يتوفّر ملخّص لهذا العمل حالياً."}</p>
          ${cast.length ? `<h3 class="detail__label">طاقم التمثيل</h3>
            <div class="cast-row">${cast.map((c) => `
              <div class="cast" data-person="${c.id}" tabindex="0" role="button">
                <img loading="lazy" alt="${esc(c.name)}" src="${IMG.profile(c.profile_path)}">
                <div class="cast__name">${esc(c.name)}</div>
                ${c.character ? `<div class="cast__role">${esc(c.character)}</div>` : ""}
              </div>`).join("")}</div>` : ""}
        </div>`;
      $$(".cast", modalBody).forEach((el) => {
        const go = () => openPerson(el.dataset.person);
        el.addEventListener("click", go);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      modalPanel.scrollTop = 0;
    } catch (e) { modalBody.innerHTML = `<div style="padding:80px 26px;text-align:center;color:#7C786C">تعذّر تحميل التفاصيل. حاول مرة أخرى.</div>`; }
  }

  async function personWithBio(id) {
    const d = await api(`/person/${id}`, { append_to_response: "combined_credits" });
    if (!d.biography || d.biography.trim().length < 10) {
      try { const en = await api(`/person/${id}`, { language: CFG.LANG_FALLBACK }); if (en.biography) d.biography = en.biography; } catch (_) {}
    }
    return d;
  }
  async function openPerson(id) {
    openModal(); loading();
    try {
      const p = await personWithBio(id);
      const works = (p.combined_credits?.cast || []).filter((w) => w.poster_path).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      const seen = new Set();
      const top = works.filter((w) => (seen.has(w.id) ? false : seen.add(w.id))).slice(0, 18);
      const facts = [];
      if (p.known_for_department) facts.push(deptAr(p.known_for_department));
      if (p.birthday) facts.push("وُلد في " + p.birthday);
      if (p.place_of_birth) facts.push(p.place_of_birth);
      modalBody.innerHTML = `
        <button class="back-link" id="backBtn">→ رجوع</button>
        <section class="person__top">
          <img class="person__photo" alt="${esc(p.name)}" src="${IMG.profile(p.profile_path)}">
          <div class="person__info">
            <h2>${esc(p.name)}</h2>
            <div class="person__facts">${facts.map((f) => `<span class="chip">${esc(f)}</span>`).join("")}</div>
            <p class="person__bio">${p.biography ? esc(trimBio(p.biography)) : "لا تتوفّر سيرة ذاتية لهذا الممثل حالياً."}</p>
          </div>
        </section>
        <h3 class="detail__label" style="padding-inline:26px">أبرز الأعمال</h3>
        ${top.length ? `<div class="works-grid">${top.map((w) => `
          <div class="work" data-id="${w.id}" data-type="${w.media_type || (w.title ? "movie" : "tv")}" tabindex="0" role="button">
            <img loading="lazy" alt="${esc(titleOf(w))}" src="${IMG.poster(w.poster_path)}">
            <div class="work__t">${esc(titleOf(w))}</div>
          </div>`).join("")}</div>` : `<p class="empty-note" style="padding:0 26px 30px">لا توجد أعمال متاحة للعرض.</p>`}`;
      $("#backBtn").addEventListener("click", closeModal);
      $$(".work", modalBody).forEach((el) => {
        const go = () => openTitle(el.dataset.id, el.dataset.type === "tv" ? "tv" : "movie");
        el.addEventListener("click", go);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      modalPanel.scrollTop = 0;
    } catch (e) { modalBody.innerHTML = `<div style="padding:80px 26px;text-align:center;color:#7C786C">تعذّر تحميل بيانات الممثل.</div>`; }
  }

  function deptAr(d) { return ({ Acting: "ممثل / ممثلة", Directing: "إخراج", Writing: "كتابة", Production: "إنتاج", Sound: "موسيقى", Camera: "تصوير" }[d] || d); }
  function trimBio(b) { return b.length > 1400 ? b.slice(0, 1400).trim() + "…" : b; }
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  document.addEventListener("DOMContentLoaded", loadHomepage);
  if (document.readyState !== "loading") loadHomepage();
})();
