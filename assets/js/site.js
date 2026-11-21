/* =========================================================================
   SiliconBench — site runtime (no build step, no dependencies)
   ========================================================================= */
(() => {
  "use strict";

  const REPO = "https://github.com/hkust-zhiyao/SiliconBench";
  const ORG = "https://github.com/siliconbench";
  const DATA = "/data/v1.0";
  const MODEL_COLORS = ["#f0d9ad", "#d6b27a", "#c98b5e", "#9c7b5b", "#8fa3bd", "#6f86a6"];
  const SHORT = ["Opus 5.5", "Sonnet 5.5", "GPT-Sol 6.1", "GPT-Terra 6.1", "GLM-5.3", "DeepSeek-V4.1"];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (html) n.innerHTML = html;
    return n;
  };
  const svgEl = (tag, attrs = {}) => {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const pct = (k, n = 94, d = 1) => ((100 * k) / n).toFixed(d);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cache = {};
  const load = (name) => (cache[name] ||= fetch(`${DATA}/${name}.json`).then((r) => r.json()));
  const loadSite = () => (cache.site ||= fetch(`/data/site.json`).then((r) => r.json()));

  /* ---------------- Shell: nav + footer ---------------- */
  const MARK = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" stroke="#d6b27a" stroke-width="1.2"/>
      <path d="M13.6 30.4 16 27.6l2.4 2.8" stroke="#d6b27a" stroke-width="1.2"/>
      <g fill="#d6b27a">
        <rect x="9.5" y="9.5" width="5.6" height="5.6" rx=".6" opacity=".95"/>
        <rect x="16.9" y="9.5" width="5.6" height="5.6" rx=".6" opacity=".55"/>
        <rect x="9.5" y="16.9" width="5.6" height="5.6" rx=".6" opacity=".55"/>
        <rect x="16.9" y="16.9" width="5.6" height="5.6" rx=".6" opacity=".25"/>
      </g></svg>`;
  const GH = `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

  function shell() {
    const page = document.body.dataset.page || "";
    const links = [
      ["leaderboard", "/leaderboard/", "Leaderboard"],
      ["explorer", "/explorer/", "Tasks"],
      ["blog", "/blog/", "Blog"],
      ["about", "/#about", "About"],
    ];
    const nav = el("nav", { class: "nav", "aria-label": "Primary" });
    nav.innerHTML = `<div class="wrap">
      <a class="brand" href="/">${MARK}<span><b>Silicon</b>Bench</span></a>
      <button class="nav-toggle" aria-label="Menu"><span></span><span></span></button>
      <div class="nav-links">
        ${links.map(([k, h, t]) => `<a href="${h}" class="${k === page ? "active" : ""}">${t}</a>`).join("")}
        <a class="gh" href="${REPO}" target="_blank" rel="noopener">${GH}GitHub</a>
      </div></div>`;
    document.body.prepend(nav);
    const t = $(".nav-toggle", nav), l = $(".nav-links", nav);
    t.addEventListener("click", () => l.classList.toggle("open"));
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const foot = el("footer", { class: "footer" });
    foot.innerHTML = `<div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="brand" href="/">${MARK}<span><b>Silicon</b>Bench</span></a>
          <p class="tagline">Measuring how well AI agents engineer real chips.</p>
          <p class="faint" style="font-size:13.5px;margin:0">Hong Kong University of Science and Technology</p>
        </div>
        <div><h4>Benchmark</h4>
          <a href="/leaderboard/">Leaderboard</a><a href="/explorer/">Task explorer</a><a href="${REPO}" target="_blank" rel="noopener">Dataset</a>
        </div>
        <div><h4>Research</h4>
          <a href="/blog/">Blog</a><a href="/blog/siliconbench-v1/">SiliconBench v1.0</a><a href="/assets/papers/siliconbench-v1.0.pdf">Paper (PDF)</a>
        </div>
        <div><h4>Contact</h4>
          <a href="${ORG}" target="_blank" rel="noopener">GitHub</a><a href="https://zhiyaoxie.com" target="_blank" rel="noopener">Zhiyao Xie Lab</a><a href="mailto:eezhiyao@ust.hk">eezhiyao@ust.hk</a>
        </div>
      </div>
      <div class="legal"><span>© 2026 SiliconBench · HKUST</span><span>Tasks keep the licenses of their upstream repositories.</span></div>
    </div>`;
    document.body.append(foot);
  }

  /* ---------------- Reveal on scroll ---------------- */
  function reveal() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal").forEach((n) => io.observe(n));
  }
  const whenVisible = (node, fn) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { fn(); io.disconnect(); }
    }), { threshold: 0.2 });
    io.observe(node);
  };

  /* ---------------- Tooltip ---------------- */
  let tip;
  function showTip(html, ev) {
    if (!tip) { tip = el("div", { class: "tooltip", role: "tooltip" }); document.body.append(tip); }
    tip.innerHTML = html;
    tip.classList.add("show");
    moveTip(ev);
  }
  function moveTip(ev) {
    if (!tip) return;
    const pad = 16, w = tip.offsetWidth, h = tip.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > innerHeight - 8) y = ev.clientY - h - pad;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => tip && tip.classList.remove("show");
  const dotsHTML = (pass, models) => `<span class="dots">${pass.map((p, i) =>
    `<i class="${p ? "p" : ""} ${models[i].access === "open" ? "open" : ""}" title="${models[i].name}"></i>`).join("")}</span>`;
  const taskTip = (t, models, labels) => `<div class="t-id">${t.id.replace("_", " ").toUpperCase()}</div>
    <div class="t-title">${esc(t.title)}</div>
    <div>${esc(t.repo)}</div>
    <div class="faint" style="margin-top:4px">${esc(labels[t.type])}</div>
    <div class="t-dots">${dotsHTML(t.pass, models)}<span class="faint" style="margin-left:8px">${t.pass.reduce((a, b) => a + b, 0)}/6 agents</span></div>`;

  /* ---------------- Wafer yield map ---------------- */
  async function wafer() {
    const host = $("#wafer");
    if (!host) return;
    const [tasks, lb] = await Promise.all([load("tasks"), load("leaderboard")]);
    const { models, summary } = lb;
    const U = 34, GAP = 3.2;

    // Like a real wafer: full dies are those whose far corner lies inside the wafer.
    // On a half-offset grid, corner distance <= sqrt(37) gives exactly 96 full dies
    // (4-fold symmetric): 94 tasks + 2 alignment marks. Partial dies fill the rim.
    const sites = [];
    for (let i = -8; i < 8; i++) for (let j = -8; j < 8; j++) {
      const x = i + 0.5, y = j + 0.5;
      const corner = (Math.abs(x) + 0.5) ** 2 + (Math.abs(y) + 0.5) ** 2;
      const near = Math.hypot(Math.max(Math.abs(x) - 0.5, 0), Math.max(Math.abs(y) - 0.5, 0));
      sites.push({ x, y, corner, near, d: x * x + y * y, a: Math.atan2(y, x) });
    }
    const used = sites.filter((s) => s.corner <= 37).sort((p, q) => p.d - q.d || p.a - q.a);
    const marks = [used.find((s) => s.x === -5.5 && s.y === 0.5), used.find((s) => s.x === 5.5 && s.y === -0.5)];
    const dies = used.filter((s) => !marks.includes(s));
    const partial = sites.filter((s) => s.corner > 37 && s.near * U < Math.sqrt(37) * U + 4);
    // easiest tasks at the center, hardest at the edge (as on a real wafer)
    const order = tasks.map((t) => ({ t, k: t.pass.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.k - a.k || a.t.id.localeCompare(b.t.id, undefined, { numeric: true }));
    dies.forEach((s, i) => { s.task = order[i].t; s.k = order[i].k; });
    // prober path: serpentine raster
    const probe = [...dies].sort((p, q) => (q.y - p.y) || ((Math.round(q.y - 0.5) % 2 ? -1 : 1) * (p.x - q.x)));
    probe.forEach((s, i) => (s.order = i));

    const R = Math.sqrt(37) * U + 8;
    const V = R + 30;
    const svg = svgEl("svg", { class: "wafer", viewBox: `${-V} ${-V} ${2 * V} ${2 * V}`, role: "img", "aria-label": "Wafer yield map of SiliconBench tasks" });
    svg.innerHTML = `<defs>
        <radialGradient id="wf-body" cx="42%" cy="38%" r="75%">
          <stop offset="0" stop-color="#1c1c21"/><stop offset=".7" stop-color="#121215"/><stop offset="1" stop-color="#0c0c0e"/>
        </radialGradient>
        <linearGradient id="wf-film" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#5b7fb8" stop-opacity=".16"/>
          <stop offset=".35" stop-color="#9a6fb0" stop-opacity=".07"/>
          <stop offset=".6" stop-color="#d6b27a" stop-opacity=".12"/>
          <stop offset="1" stop-color="#3f8f86" stop-opacity=".10"/>
        </linearGradient>
        <radialGradient id="wf-glow" cx="50%" cy="50%" r="50%">
          <stop offset=".6" stop-color="#d6b27a" stop-opacity="0"/><stop offset=".98" stop-color="#d6b27a" stop-opacity=".10"/><stop offset="1" stop-color="#d6b27a" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="wf-clip"><circle r="${R}"/></clipPath>
      </defs>`;
    const notch = `M ${-9} ${R + 1} L 0 ${R - 11} L 9 ${R + 1} Z`;
    svg.append(svgEl("circle", { r: R + 26, fill: "url(#wf-glow)" }));
    svg.append(svgEl("circle", { r: R, fill: "url(#wf-body)", stroke: "rgba(236,232,225,.18)", "stroke-width": 1 }));
    svg.append(svgEl("circle", { r: R, fill: "url(#wf-film)" }));
    svg.append(svgEl("path", { d: notch, fill: "#08080a" }));
    svg.append(svgEl("circle", { r: R - 9, fill: "none", stroke: "rgba(236,232,225,.06)", "stroke-dasharray": "2 5" }));
    // scribe lines
    const g0 = svgEl("g", { "clip-path": "url(#wf-clip)", stroke: "rgba(236,232,225,.05)", "stroke-width": 1 });
    for (let k = -6; k <= 6; k++) {
      g0.append(svgEl("line", { x1: k * U, y1: -R, x2: k * U, y2: R }));
      g0.append(svgEl("line", { x1: -R, y1: k * U, x2: R, y2: k * U }));
    }
    svg.append(g0);
    const S = U - GAP;
    const gp = svgEl("g", { "clip-path": "url(#wf-clip)" });
    partial.forEach((s) => gp.append(svgEl("rect", { x: s.x * U - S / 2, y: -s.y * U - S / 2, width: S, height: S, rx: 2.2, fill: "rgba(236,232,225,.022)", stroke: "rgba(236,232,225,.05)" })));
    svg.append(gp);
    const g = svgEl("g");
    svg.append(g);
    dies.forEach((s) => {
      const r = svgEl("rect", { class: "die", x: s.x * U - S / 2, y: -s.y * U - S / 2, width: S, height: S, rx: 2.2, fill: "#16161a", stroke: "rgba(236,232,225,.06)", "stroke-width": 1 });
      const ink = svgEl("circle", { cx: s.x * U, cy: -s.y * U, r: 3.1, fill: "#b9654c", opacity: 0, "pointer-events": "none" });
      s.rect = r; s.ink = ink;
      r.addEventListener("mouseenter", (e) => showTip(taskTip(s.task, models, summary.type_labels), e));
      r.addEventListener("mousemove", moveTip);
      r.addEventListener("mouseleave", hideTip);
      r.addEventListener("click", () => window.open(`${REPO}/tree/main/tasks/${s.task.id}`, "_blank", "noopener"));
      g.append(r, ink);
    });
    marks.forEach((s) => {
      const cx = s.x * U, cy = -s.y * U, h = S / 2 - 6;
      const m = svgEl("g", { stroke: "rgba(214,178,122,.55)", "stroke-width": 1, fill: "none" });
      m.append(svgEl("rect", { x: cx - S / 2, y: cy - S / 2, width: S, height: S, rx: 2.2, stroke: "rgba(236,232,225,.08)" }));
      m.append(svgEl("line", { x1: cx - h, y1: cy, x2: cx + h, y2: cy }));
      m.append(svgEl("line", { x1: cx, y1: cy - h, x2: cx, y2: cy + h }));
      m.append(svgEl("circle", { cx, cy, r: 4 }));
      g.append(m);
    });
    // probe head
    const head = svgEl("rect", { width: S + 8, height: S + 8, rx: 4, fill: "none", stroke: "#f0d9ad", "stroke-width": 1.2, opacity: 0, "pointer-events": "none" });
    svg.append(head);
    host.append(svg);

    const readout = $("#wafer-readout");
    const solvedAny = tasks.filter((t) => t.pass.some(Boolean)).length;
    const views = [{ id: "all", label: "All agents" }, ...models.map((m, i) => ({ id: i, label: SHORT[i], y: pct(m.pass) }))];
    const ctr = $("#wafer-controls");
    ctr.innerHTML = views.map((v, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-v="${v.id}">${v.label}${v.y ? `<span class="y">${v.y}%</span>` : ""}</button>`).join("");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let run = 0;
    function paint(view) {
      const my = ++run;
      if (view === "all") {
        readout.innerHTML = `Solved by any agent<span class="big">${solvedAny}<small>/94</small></span>${summary.unsolved_by_all} tasks unsolved by all six`;
      } else {
        const m = models[view];
        readout.innerHTML = `Yield · ${esc(m.name)}<span class="big">${pct(m.pass)}<small>%</small></span>${m.pass} of 94 tasks pass every check`;
      }
      const step = reduce ? 0 : 7;
      dies.forEach((s) => {
        const apply = () => {
          if (my !== run) return;
          let fill, ink = 0, stroke = "rgba(236,232,225,.06)";
          if (view === "all") {
            const f = s.k / 6;
            fill = s.k === 0 ? "#141417" : `rgba(214,178,122,${(0.1 + 0.9 * Math.pow(f, 1.35)).toFixed(3)})`;
            ink = s.k === 0 ? 1 : 0;
          } else {
            const p = s.task.pass[view];
            fill = p ? (models[view].access === "open" ? "#8fa3bd" : "#d6b27a") : "#141417";
            ink = p ? 0 : 0.95;
            if (p) stroke = "rgba(255,255,255,.12)";
          }
          s.rect.setAttribute("fill", fill);
          s.rect.setAttribute("stroke", stroke);
          s.ink.setAttribute("opacity", ink);
          if (step) {
            head.setAttribute("x", s.x * U - S / 2 - 4);
            head.setAttribute("y", -s.y * U - S / 2 - 4);
            head.setAttribute("opacity", s.order === dies.length - 1 ? 0 : 0.9);
          }
        };
        step ? setTimeout(apply, s.order * step) : apply();
      });
    }
    ctr.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      $$(".chip", ctr).forEach((c) => c.classList.toggle("on", c === b));
      paint(b.dataset.v === "all" ? "all" : +b.dataset.v);
    });
    paint("all");
  }

  /* ---------------- Home: compact leaderboard + counters ---------------- */
  async function homeLeaderboard() {
    const host = $("#lb-compact");
    if (!host) return;
    const { models } = await load("leaderboard");
    host.innerHTML = models.map((m, i) => `
      <a class="lb-row" href="/leaderboard/">
        <div class="lb-rank">${String(i + 1).padStart(2, "0")}</div>
        <div><div class="lb-name">${esc(m.name)}</div>
          <div class="lb-org">${esc(m.org)} <span class="tag ${m.access === "open" ? "open" : "prop"}">${m.access === "open" ? "Open weights" : "Proprietary"}</span></div></div>
        <div class="bar ${m.access === "open" ? "open" : ""}"><i data-w="${pct(m.pass)}"></i></div>
        <div class="lb-score">${pct(m.pass)}<small>%</small></div>
      </a>`).join("");
    whenVisible(host, () => $$(".bar i", host).forEach((b, i) => setTimeout(() => (b.style.width = b.dataset.w + "%"), i * 90)));
  }

  function counters() {
    $$("[data-count]").forEach((n) => {
      const end = parseFloat(n.dataset.count), dec = (n.dataset.count.split(".")[1] || "").length;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches || end === 0) { n.textContent = n.dataset.count; return; }
      whenVisible(n, () => {
        const t0 = performance.now(), dur = 1400;
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
          n.textContent = (end * e).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
  }

  async function homePosts() {
    const ph = $("#posts");
    if (!ph) return;
    const site = await loadSite();
    renderPosts(ph, site.posts.slice(0, 3));
  }
  function renderPosts(host, posts) {
    host.innerHTML = posts.map((p) => `
      <a class="post-row" href="${p.href}">
        <div class="date">${esc(p.date)}</div>
        <div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div>
        <div class="go">→</div>
      </a>`).join("");
  }
  async function blogIndex() {
    const host = $("#post-list");
    if (!host) return;
    const site = await loadSite();
    renderPosts(host, site.posts);
  }

  /* ---------------- Charts ---------------- */
  function hbars(host, rows, { max, color = "#d6b27a", fmt = (v) => v, unit = "" } = {}) {
    const mx = max || Math.max(...rows.map((r) => r[1]));
    host.innerHTML = `<div style="display:grid;gap:14px">${rows.map((r) => `
      <div class="hbar">
        <div style="color:var(--fg-2)">${esc(r[0])}</div>
        <div class="bar" style="height:8px"><i data-w="${(100 * r[1]) / mx}" style="background:linear-gradient(90deg,${color}55,${r[2] || color})"></i></div>
        <div class="mono" style="text-align:right;color:var(--fg)">${fmt(r[1])}${unit}</div>
      </div>`).join("")}</div>`;
    whenVisible(host, () => $$(".bar i", host).forEach((b, i) => setTimeout(() => (b.style.width = b.dataset.w + "%"), i * 70)));
  }

  function scatterChart(host, models) {
    const W = Math.max(320, Math.round(host.clientWidth || 700)), H = W < 520 ? 280 : 340, m = { l: 44, r: 16, t: 20, b: 48 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const xs = (v) => m.l + (iw * v) / 160, ys = (v) => m.t + ih * (1 - v / 100);
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}` });
    const grid = svgEl("g", { class: "grid" });
    [0, 25, 50, 75, 100].forEach((v) => {
      grid.append(svgEl("line", { x1: m.l, x2: m.l + iw, y1: ys(v), y2: ys(v) }));
      const t = svgEl("text", { x: m.l - 12, y: ys(v) + 4, "text-anchor": "end" }); t.textContent = v + "%"; grid.append(t);
    });
    [0, 40, 80, 120, 160].forEach((v) => {
      const t = svgEl("text", { x: xs(v), y: H - 22, "text-anchor": "middle" }); t.textContent = v; grid.append(t);
    });
    const xl = svgEl("text", { x: m.l + iw / 2, y: H - 2, "text-anchor": "middle" }); xl.textContent = "Median tool calls per task"; grid.append(xl);
    svg.append(grid);
    models.forEach((mm, k) => {
      const x = xs(mm.tool_calls_median), y = ys(+pct(mm.pass));
      svg.append(svgEl("circle", { cx: x, cy: y, r: 22, fill: MODEL_COLORS[k], opacity: 0.08 }));
      const c = svgEl("circle", { cx: x, cy: y, r: 6, fill: MODEL_COLORS[k] });
      c.addEventListener("mouseenter", (e) => showTip(`<div class="t-title" style="margin-top:0">${esc(mm.name)}</div>${mm.tool_calls_median} median calls · ${pct(mm.pass)}% pass`, e));
      c.addEventListener("mousemove", moveTip); c.addEventListener("mouseleave", hideTip);
      svg.append(c);
      const right = mm.tool_calls_median > 100;
      const t = svgEl("text", { x: x + (right ? -14 : 14), y: y + 4, "text-anchor": right ? "end" : "start", style: `fill:${MODEL_COLORS[k]};font-family:var(--sans);font-size:12.5px` });
      t.textContent = SHORT[k];
      svg.append(t);
    });
    host.append(svg);
  }

  /* ---------------- Leaderboard page ---------------- */
  async function leaderboardPage() {
    const host = $("#lb-table");
    if (!host) return;
    const { models } = await load("leaderboard");
    const cols = [["#", ""], ["Agent", ""], ["Pass rate", "94 tasks"], ["Tool calls", "median"], ["Hacking", "runs attempted"], ["Hacks", "succeeded"]];
    const val = (m, c) => [0, 0, m.pass, m.tool_calls_median, m.hack_runs, m.hack_success][c];
    let sortCol = 2, dir = -1;
    function render() {
      const rows = [...models].sort((a, b) => dir * (val(a, sortCol) - val(b, sortCol)));
      host.innerHTML = `<table class="data"><thead><tr>${cols.map((c, i) => `<th data-c="${i}" class="${i === sortCol ? "sorted" : ""}">${c[0]}${i === sortCol ? (dir < 0 ? " ↓" : " ↑") : ""}${c[1] ? `<span class="sub">${c[1]}</span>` : ""}</th>`).join("")}</tr></thead><tbody>${rows.map((m) => `<tr>
        <td><span class="rank-badge">${String(models.indexOf(m) + 1).padStart(2, "0")}</span></td>
        <td><div class="agent-cell"><span class="name">${esc(m.name)}</span><span class="meta">${esc(m.org)} <span class="tag ${m.access === "open" ? "open" : "prop"}">${m.access === "open" ? "Open weights" : "Proprietary"}</span></span></div></td>
        <td class="num"><span class="cell-bar"><span class="bar ${m.access === "open" ? "open" : ""}"><i style="width:${pct(m.pass)}%"></i></span><span class="hero-num">${pct(m.pass)}%</span><span class="of">${m.pass}/94</span></span></td>
        <td class="num">${m.tool_calls_median.toFixed(1)}</td>
        <td class="num">${pct(m.hack_runs)}%<span class="of">${m.hack_runs}/94</span></td>
        <td class="num" style="color:var(--pass)">${m.hack_success}</td></tr>`).join("")}</tbody></table>`;
    }
    host.addEventListener("click", (e) => {
      const th = e.target.closest("th"); if (!th) return;
      const c = +th.dataset.c; if (c < 2) return;
      dir = c === sortCol ? -dir : -1; sortCol = c; render();
    });
    render();
    matrix();
  }

  async function matrix() {
    const host = $("#matrix");
    if (!host) return;
    const [tasks, { models, summary }] = await Promise.all([load("tasks"), load("leaderboard")]);
    const sorted = [...tasks].sort((a, b) => b.pass.reduce((x, y) => x + y) - a.pass.reduce((x, y) => x + y) || a.id.localeCompare(b.id, undefined, { numeric: true }));
    host.innerHTML = models.map((m, k) => `<div class="matrix-row"><div class="lbl">${esc(m.name)}</div>
      <div class="cells">${sorted.map((t, j) => `<i data-j="${j}" class="${t.pass[k] ? "p" : ""} ${m.access === "open" ? "open" : ""}"></i>`).join("")}</div>
      <div class="val">${m.pass}/94</div></div>`).join("") +
      `<div class="matrix-axis"><div></div><div><span>← solved by all six</span><span>unsolved by all →</span></div><div></div></div>`;
    host.addEventListener("mouseover", (e) => { const c = e.target.closest(".cells i"); if (c) showTip(taskTip(sorted[+c.dataset.j], models, summary.type_labels), e); });
    host.addEventListener("mousemove", (e) => e.target.closest(".cells i") ? moveTip(e) : hideTip());
    host.addEventListener("mouseleave", hideTip);
    host.addEventListener("click", (e) => { const c = e.target.closest(".cells i"); if (c) window.open(`${REPO}/tree/main/tasks/${sorted[+c.dataset.j].id}`, "_blank", "noopener"); });
  }

  /* ---------------- Explorer ---------------- */
  async function explorer() {
    const host = $("#tasks");
    if (!host) return;
    const [tasks, { models, summary }] = await Promise.all([load("tasks"), load("leaderboard")]);
    const state = { q: "", type: "all", solved: "all", repo: "all" };
    const chips = (id, opts) => {
      const n = $(id);
      n.insertAdjacentHTML("beforeend", opts.map(([v, l], i) => `<button class="chip ${i === 0 ? "on" : ""}" data-v="${v}">${l}</button>`).join(""));
      n.addEventListener("click", (e) => {
        const b = e.target.closest(".chip"); if (!b) return;
        $$(".chip", n).forEach((c) => c.classList.toggle("on", c === b));
        state[n.dataset.key] = b.dataset.v; render();
      });
    };
    chips("#f-type", [["all", "All"], ...Object.entries(summary.type_labels).map(([k, v]) => [k, v])]);
    chips("#f-solved", [["all", "All"], ["none", "Unsolved by all"], ["hard", "Solved by 1–2"], ["every", "Solved by all six"]]);
    const repoSel = $("#f-repo");
    repoSel.innerHTML = `<option value="all">All 30 repositories</option>` + summary.repos_list.map(([r, c]) => `<option value="${esc(r)}">${esc(r)} (${c})</option>`).join("");
    repoSel.addEventListener("change", () => { state.repo = repoSel.value; render(); });
    $("#q").addEventListener("input", (e) => { state.q = e.target.value.toLowerCase().trim(); render(); });
    const params = new URLSearchParams(location.search);
    if (params.get("q")) { $("#q").value = params.get("q"); state.q = params.get("q").toLowerCase(); }

    function render() {
      const list = tasks.filter((t) => {
        const k = t.pass.reduce((a, b) => a + b, 0);
        if (state.type !== "all" && t.type !== state.type) return false;
        if (state.repo !== "all" && t.repo !== state.repo) return false;
        if (state.solved === "none" && k !== 0) return false;
        if (state.solved === "hard" && !(k >= 1 && k <= 2)) return false;
        if (state.solved === "every" && k !== 6) return false;
        if (state.q && !(`${t.id} ${t.title} ${t.repo} ${t.editable.join(" ")}`.toLowerCase().includes(state.q))) return false;
        return true;
      });
      $("#count").textContent = `${list.length} of 94 tasks`;
      host.innerHTML = list.length ? list.map((t) => {
        const k = t.pass.reduce((a, b) => a + b, 0);
        return `<a class="task" href="${REPO}/tree/main/tasks/${t.id}" target="_blank" rel="noopener">
          <div class="top"><span class="id">${t.id}</span><span class="solved">${k}/6 solved</span></div>
          <h3>${esc(t.title)}</h3>
          <div class="repo">${esc(t.repo)}</div>
          <div class="tags"><span>${esc(summary.type_labels[t.type])}</span></div>
          <div class="bottom"><span class="size">${t.files} files · ${t.loc.toLocaleString()} LOC · ${t.editable.length} editable</span>${dotsHTML(t.pass, models)}</div>
        </a>`;
      }).join("") : `<div class="empty">No tasks match these filters.</div>`;
    }
    $("#dot-legend").innerHTML = models.map((m, i) => `<span style="display:inline-flex;gap:6px;align-items:center"><i style="width:9px;height:9px;border-radius:2px;background:${m.access === "open" ? "var(--steel)" : "var(--gold)"};display:inline-block"></i>${SHORT[i]}</span>`).join(`<span class="faint">·</span>`);
    render();
  }

  /* ---------------- Blog article ---------------- */
  async function article() {
    if (document.body.dataset.page !== "post") return;
    const { models, summary } = await load("leaderboard");
    const pb = $("#post-pass-bars");
    if (pb) hbars(pb, models.map((m, k) => [m.name, +pct(m.pass), MODEL_COLORS[k]]), { max: 100, unit: "%", fmt: (v) => v.toFixed(1) });
    const tb = $("#post-type-bars");
    if (tb) hbars(tb, Object.entries(summary.type_counts).map(([k, v]) => [summary.type_labels[k], v]), { max: 40 });
    const sp = $("#post-scatter"); if (sp) scatterChart(sp, models);
    const hb = $("#post-hack-bars");
    if (hb) hbars(hb, models.map((m, k) => [m.name, +pct(m.hack_runs), MODEL_COLORS[k]]), { max: 40, unit: "%", fmt: (v) => v.toFixed(1) });
    // TOC scrollspy
    const toc = $(".toc");
    if (toc) {
      const hs = $$(".prose h2[id]");
      toc.innerHTML = hs.map((h) => `<a href="#${h.id}">${esc(h.dataset.toc || h.textContent)}</a>`).join("");
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) $$("a", toc).forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      }), { rootMargin: "-20% 0px -70% 0px" });
      hs.forEach((h) => io.observe(h));
    }
  }

  /* ---------------- Copy citation ---------------- */
  function copyButtons() {
    $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
      const txt = $(b.dataset.copy).innerText;
      try { await navigator.clipboard.writeText(txt); b.textContent = "Copied"; } catch { b.textContent = "Select & copy"; }
      setTimeout(() => (b.textContent = "Copy"), 1600);
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    shell();
    reveal();
    counters();
    copyButtons();
    wafer();
    homeLeaderboard();
    homePosts();
    blogIndex();
    leaderboardPage();
    explorer();
    article();
  });
})();
