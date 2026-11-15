/* Sanctus Investment - concept E, third edition. Hand-written, no libraries.
   1) home title: CSS shows it from the first frame (heavy, 20% opacity) and settles it; afterwards the glyphs
      near the pointer gain weight (430 -> 560, radius 120px)
   2) tied to scroll: the home title narrows (wdth 100 -> 78) and shrinks over the first 400px,
      and the next big line unfolds (78 -> 100) as it comes in
   3) page titles and two big home lines rise from behind a line mask; everything else only fades up
   4) menu */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, win = window;
  var RM = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(v) { return v * v * (3 - 2 * v); }

  /* ---------- menu ---------- */
  $$(".has-sub").forEach(function (li) {
    var b = li.querySelector("button");
    b.addEventListener("click", function (e) {
      var o = !li.classList.contains("open");
      li.classList.toggle("open", o); b.setAttribute("aria-expanded", o); e.stopPropagation();
    });
    doc.addEventListener("click", function () { li.classList.remove("open"); b.setAttribute("aria-expanded", "false"); });
  });
  var sheet = doc.getElementById("sheet"), burger = doc.querySelector(".nav .burger");
  function setSheet(o) {
    if (!sheet) return;
    sheet.classList.toggle("open", o); sheet.setAttribute("aria-hidden", !o);
    burger.setAttribute("aria-expanded", o); doc.body.style.overflow = o ? "hidden" : "";
    if (o) { var f = sheet.querySelector("nav a"); f && f.focus({ preventScroll: true }); } else { burger.focus({ preventScroll: true }); }
  }
  if (burger) {
    burger.addEventListener("click", function () { setSheet(true); });
    $$("[data-close]", sheet).forEach(function (b) { b.addEventListener("click", function () { setSheet(false); }); });
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (sheet.classList.contains("open")) setSheet(false);
      $$(".has-sub.open").forEach(function (li) { li.classList.remove("open"); });
    });
    win.addEventListener("resize", function () { if (win.innerWidth > 860 && sheet.classList.contains("open")) setSheet(false); });
  }
  /* leaving a page: switch the old underline off at once */
  $$(".menu a, .sheet nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      $$(".menu [aria-current], .sheet [aria-current]").forEach(function (x) { if (x !== a) x.removeAttribute("aria-current"); });
      $$(".menu li.on").forEach(function (x) { if (!x.contains(a)) x.classList.remove("on"); });
    });
  });

  root.classList.add("go");                       // the script is running: CSS fail-safes stand down
  var title = doc.querySelector(".hero-h");
  if (RM) {                                       // reduced motion: everything is simply there
    $$("[data-split]").forEach(function (el) { el.classList.add("rdy", "in"); });
    $$("[data-fade]").forEach(function (el) { el.classList.add("in"); });
    if (title) title.classList.add("done");
    return;
  }

  /* ---------- 3) split into words; each word rises from behind its own line mask ---------- */
  function textNodes(el) {
    var out = [], w = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (n.nodeValue.trim() && !n.parentNode.closest("[data-atom]")) out.push(n);
    return out;
  }
  function split(el) {
    textNodes(el).forEach(function (n) {
      var f = doc.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { f.appendChild(doc.createTextNode(" ")); return; }
        var w = doc.createElement("span"), i = doc.createElement("span");
        w.className = "w"; i.className = "wi"; i.textContent = p; w.appendChild(i); f.appendChild(w);
      });
      n.parentNode.replaceChild(f, n);
    });
    $$("[data-atom]", el).forEach(function (a) {           // Greek / Hebrew words stay whole
      if (a.parentNode.className === "wi") return;
      var w = doc.createElement("span"), i = doc.createElement("span");
      w.className = "w"; i.className = "wi"; a.parentNode.insertBefore(w, a); i.appendChild(a); w.appendChild(i);
    });
    var top = null, l = -1;
    $$(".w", el).forEach(function (w) {
      var t = Math.round(w.getBoundingClientRect().top);
      if (top === null || Math.abs(t - top) > 4) { l++; top = t; }
      w.firstChild.style.setProperty("--l", l);
    });
    el.classList.add("rdy");
  }

  /* ---------- 1) + 2) the home title once it has settled.
        Every glyph gets a slot. Its width is measured twice (wdth 100 and wdth 78) and follows --p, so the line
        narrows with scroll without any glyph jumping. Line breaks are frozen first, so nothing re-wraps. ---------- */
  var shrink = null;
  function live(el) {
    var chars = [], range = doc.createRange(), px = -1e4, py = -1e4, running = false, dirty = true, p = -1, R = 120;
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    el.classList.add("done");
    function build() {
      chars = [];
      el.style.fontStretch = ""; el.style.transform = ""; el.style.whiteSpace = ""; el.style.setProperty("--p", 0);
      $$("br.lb", el).forEach(function (b) { b.parentNode.removeChild(b); });
      var ls = -parseFloat(getComputedStyle(el).letterSpacing) || 0, wis = $$(".wi", el), ws = $$(".w", el);
      wis.forEach(function (wi) { wi.textContent = wi.textContent; });      // back to plain text (also on rebuild)
      function widths(wi) {
        var n = wi.firstChild, s = n.nodeValue, a = [], i;
        for (i = 0; i < s.length; i++) { range.setStart(n, i); range.setEnd(n, i + 1); a.push(range.getBoundingClientRect().width + ls); }
        return a;
      }
      var tops = ws.map(function (w) { return Math.round(w.getBoundingClientRect().top); });
      var wide = wis.map(widths);
      el.style.fontStretch = "78%";
      var narrow = wis.map(widths);
      el.style.fontStretch = "";
      ws.forEach(function (w, i) {                       // freeze the line breaks
        if (!i || Math.abs(tops[i] - tops[i - 1]) < 5) return;
        var pv = w.previousElementSibling;
        if (pv && pv.tagName === "BR" && getComputedStyle(pv).display !== "none") return;
        var br = doc.createElement("br"); br.className = "lb"; w.parentNode.insertBefore(br, w);
      });
      el.style.whiteSpace = "nowrap";
      wis.forEach(function (wi, j) {
        var s = wi.firstChild.nodeValue, f = doc.createDocumentFragment(), i, c;
        for (i = 0; i < s.length; i++) {
          c = doc.createElement("span"); c.className = "lc"; c.textContent = s.charAt(i); c.setAttribute("aria-hidden", "true");
          c.style.setProperty("--a", wide[j][i].toFixed(2)); c.style.setProperty("--b", narrow[j][i].toFixed(2));
          f.appendChild(c); chars.push({ el: c, v: 0, shown: 0, x: 0, y: 0 });
        }
        wi.replaceChild(f, wi.firstChild);
      });
      p = -1; shrink();
    }
    function measure() {
      dirty = false;
      chars.forEach(function (c) { var r = c.el.getBoundingClientRect(); c.x = r.left + r.width / 2; c.y = r.top + r.height / 2; });
    }
    function frame() {
      if (dirty) measure();
      var busy = false, base = 100, i, c, dx, dy, d, t;
      for (i = 0; i < chars.length; i++) {
        c = chars[i]; dx = c.x - px; dy = c.y - py; d = Math.sqrt(dx * dx + dy * dy);
        t = d < R ? smooth(1 - d / R) : 0;                          // per glyph, by distance
        c.v += (t - c.v) * (t > c.v ? 0.2 : 0.09);                  // grows quickly, eases back slowly
        if (Math.abs(t - c.v) < 0.004) c.v = t; else busy = true;
        if (c.v !== c.shown) {
          c.shown = c.v;
          c.el.style.fontWeight = c.v ? Math.round(430 + 130 * c.v) : "";
          c.el.style.fontStretch = c.v ? (base * (1 - 0.03 * c.v)).toFixed(2) + "%" : "";   // a touch narrower while heavy: it stays in its slot
        }
      }
      if (busy) requestAnimationFrame(frame); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
    shrink = function () {                                           // 2) tied to scroll, first 400px
      var np = clamp(win.scrollY / 400);
      if (np === p) return;
      p = np;
      /* fourth edition: scale only (the glyph slots keep their width, so nothing below or beside them moves) */
      el.style.transform = p ? "scale(" + (1 - 0.14 * p).toFixed(4) + ")" : "";
      dirty = true; if (px > -1e3) kick();
    };
    build();
    win.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; px = e.clientX; py = e.clientY; kick(); }, { passive: true });
    doc.addEventListener("pointerleave", function () { px = py = -1e4; kick(); });
    var rt; win.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 220); });
  }

  /* the next big line unfolds as it comes in: wdth 78 at the bottom edge of the screen, 100 by mid-screen */
  var unf = $$("[data-unfold]");
  function unfold() {
    var vh = win.innerHeight;
    unf.forEach(function (el) {
      var q = smooth(clamp((vh * 0.98 - el.getBoundingClientRect().top) / (vh * 0.5)));
      el.style.fontStretch = (78 + 22 * q).toFixed(2) + "%";
    });
  }
  var ticking = false;
  function tick() { ticking = false; if (shrink) shrink(); unfold(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }

  /* ---------- start ---------- */
  function start() {
    $$("[data-split]").forEach(split);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add("in"); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    $$("[data-split]").forEach(function (el) {
      if (el.hasAttribute("data-onview")) { io.observe(el); return; }
      requestAnimationFrame(function () { el.classList.add("in"); });
    });
    $$("[data-fade]").forEach(function (el) {
      if (!el.closest(".hero,.ph")) { io.observe(el); return; }   // first screen: do not wait for scroll
      requestAnimationFrame(function () { el.classList.add("in"); });
    });
    if (title) {                                                   // take over when the CSS settle has finished
      var go = function () { if (!title.classList.contains("done")) live(title); };
      if (title.hasAttribute("data-type")) { title.addEventListener("typed", go); setTimeout(go, 9000); return afterTitle(); }   // second edition: typed first (e2-type.js)
      var an = title.getAnimations ? title.getAnimations({ subtree: true }) : null;
      if (an && an.length && win.Promise) Promise.all(an.map(function (a) { return a.finished; })).then(go, go);
      else if (an) go();
      setTimeout(go, 3200);
    }
    afterTitle();
  }
  function afterTitle() { win.addEventListener("scroll", onScroll, { passive: true }); win.addEventListener("resize", onScroll); unfold(); }
  var started = false;
  function once() { if (!started) { started = true; start(); } }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(once);
  setTimeout(once, 1400);
})();
