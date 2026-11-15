/* Sanctus Investment - concept E, fourth edition: the typewriter (typed once; titles about 60 ms a glyph, one after another). Hand-written, no libraries, no external requests.
   Must load before e.js (it prepares the titles; e.js takes the home title over once it has been typed).

   1) data-type="legacy": the name line (and, on About, the lines under it) typed the way the old site's About video typed it.
      Measured from that video (20.2 s, 30 fps, looped): the caret blinks for 0.87 s (0.4 s period), the first line takes 3.0 s
      (one keystroke every 40-170 ms, 68 ms on average, spaces count as keystrokes, a Korean syllable arrives whole),
      0.5 s rest, the following lines at about 70 ms a keystroke with 0.07-0.2 s between lines, nothing is deleted,
      the finished text stands for 5.76 s with a steady caret, then everything is cleared at once and it starts again.
   2) data-type="hero": the large first-screen sentence is typed once when the page opens (about 2 s), then stands.
   3) data-type="title": large section titles are typed once, briefly, when they come into view. Body copy is never typed.
   Every glyph sits in its final place from the start and is only switched on, so no line break or neighbour moves.
   Hebrew: a letter with its points is one group and stays inside its <bdi>, so the order stays right to left.
   prefers-reduced-motion: nothing is hidden, nothing moves. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* which wording the name block shows: "ko" = the old site's own lines, "en" = the English copy */
  var NL = 'en', m = /[?&]nl=(ko|en)\b/.exec(location.search);
  if (m) NL = m[1];                                  /* fourth edition: English unless ?nl=ko (decided 2026-11-15) */
  root.setAttribute('data-nl', NL);

  /* the old video, first line: milliseconds between one visible glyph and the next (33 glyphs, 3.0 s) */
  var OLD1 = [60, 40, 60, 100, 140, 100, 130, 130, 40, 100, 60, 100, 100, 40, 60, 140, 130, 90, 130, 100, 110, 140, 100, 130, 30, 100, 140, 130, 20, 130, 170, 70];
  var KEYS = [60, 40, 60, 100, 140, 100, 40, 100, 60, 70, 40, 60, 110, 50, 80, 40, 90, 60];   /* about 70 ms a keystroke */
  var LEAD = 870, BLINK = 330, HOLD = 5760;

  function clusters(s) {
    if (window.Intl && Intl.Segmenter) { var out = [], it = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)[Symbol.iterator](), r; while (!(r = it.next()).done) out.push(r.value.segment); return out; }
    return s.match(/[\uD800-\uDBFF][\uDC00-\uDFFF][̀-֑ͯ-ׇ]*|[\s\S][̀-֑ͯ-ׇ]*/g) || [];
  }
  /* wrap every glyph group of el in a span; returns them in reading order with the number of spaces typed before each */
  function split(el) {
    var tw = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n, out = [], pre = 0;
    while ((n = tw.nextNode())) { if (!n.parentNode.closest('.sr-only,[data-type-skip]')) nodes.push(n); }
    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) { if (out.length && /\s/.test(node.nodeValue)) pre++; return; }
      var rtl = !!node.parentNode.closest('[lang="he"]'), f = doc.createDocumentFragment();
      clusters(node.nodeValue).forEach(function (g) {
        if (/^\s+$/.test(g)) { f.appendChild(doc.createTextNode(g)); if (out.length) pre++; return; }
        var s = doc.createElement('span'); s.className = 'tp' + (rtl ? ' tp-rtl' : '') + (node.parentNode.closest('[data-ghost]') ? ' tp-gh' : ''); s.textContent = g; f.appendChild(s);
        out.push({ el: s, pre: pre }); pre = 0;
      });
      node.parentNode.replaceChild(f, node);
    });
    return out;
  }
  function Run(el) { this.el = el; this.timers = []; this.gl = []; }
  Run.prototype.later = function (fn, ms) { this.timers.push(setTimeout(fn, ms)); };
  Run.prototype.clear = function () {
    this.timers.forEach(clearTimeout); this.timers = [];
    this.gl.forEach(function (g) { g.el.classList.remove('tp-v', 'tp-cur', 'tp-pre'); });
    this.el.classList.remove('tp-idle', 'tp-done'); this.mute = false;
  };
  Run.prototype.strike = function (i) {
    var gl = this.gl;
    this.el.classList.remove('tp-idle');
    if (i) gl[i - 1].el.classList.remove('tp-cur'); else gl[0].el.classList.remove('tp-pre');
    gl[i].el.classList.add('tp-v'); if (!this.mute) gl[i].el.classList.add('tp-cur');
  };
  Run.prototype.freeze = function (k) {                       /* for checking: hold with k glyphs struck */
    this.clear(); this.started = true;
    for (var i = 0; i < k && i < this.gl.length; i++) this.gl[i].el.classList.add('tp-v');
    if (k <= 0) this.gl[0].el.classList.add('tp-pre'); else this.gl[Math.min(k, this.gl.length) - 1].el.classList.add('tp-cur');
  };
  var runs = [];

  /* ---------- 1) the old name block ---------- */
  function legacy(el) {
    var run = new Run(el), lines = $$('.tl', el); if (!lines.length) lines = [el];
    var at = [], t = 0;
    lines.forEach(function (ln, li) {
      var gl = split(ln), gap = parseInt(ln.getAttribute('data-gap'), 10) || 0, old = ln.hasAttribute('data-old1');
      gl.forEach(function (g, i) {
        if (!i) t += li ? gap : 0;
        else if (old && OLD1[i - 1] != null) t += OLD1[i - 1];
        else t += KEYS[(run.gl.length + i) % KEYS.length] * (1 + g.pre) * (old ? 0.97 : 1);
        at.push(t); run.gl.push(g);
      });
    });
    if (!run.gl.length) return null;
    var lead = el.hasAttribute('data-lead') ? parseInt(el.getAttribute('data-lead'), 10) : LEAD, max = parseInt(el.getAttribute('data-max'), 10);
    if (max && t > max - lead) { var f = (max - lead) / t; at = at.map(function (v) { return v * f; }); t = max - lead; }
    run.total = t;
    run.play = function () {
      run.clear(); run.started = true;
      handCaret(run);
      run.later(function () { run.gl[0].el.classList.add('tp-pre'); el.classList.add('tp-idle'); }, Math.min(BLINK, lead));
      run.gl.forEach(function (g, i) { run.later(function () { run.strike(i); if (i === run.gl.length - 1) { el.classList.add('tp-done'); el.dispatchEvent(new CustomEvent('typed'));
        run.later(function () { g.el.classList.remove('tp-cur'); el.classList.remove('tp-idle'); }, 1200); } }, lead + at[i]); });   /* the caret leaves 1.2 s after the last glyph */
      /* fourth edition: typed once, never cleared */
    };
    el.classList.add('tp-on');
    if (!el.hasAttribute('data-after-hero')) { run.gl[0].el.classList.add('tp-pre'); el.classList.add('tp-idle'); }   /* third edition: the caret is there from the first paint */
    return run;
  }

  /* ---------- 2) + 3) typed once ---------- */
  var caretRun = null;
  function handCaret(run) {
    var o = caretRun; caretRun = run;
    if (!o || o === run) return;
    o.mute = true;                       /* a title still being typed goes on without its caret */
    o.gl.forEach(function (g) { g.el.classList.remove('tp-cur', 'tp-pre'); }); o.el.classList.remove('tp-idle');
  }
  function once(el, total, lead, caretFor, pace) {
    var run = new Run(el); run.gl = split(el);
    if (!run.gl.length) return null;
    var keys = 0; run.gl.forEach(function (g) { keys += 1 + g.pre; });
    var per = pace ? Math.min(pace, total / keys) : Math.max(22, Math.min(62, total / keys)), at = [], t = 0;
    run.gl.forEach(function (g, i) { if (i) t += per * (1 + g.pre) * (0.72 + 0.56 * ((i * 7) % 5) / 4); at.push(t); });
    run.total = t;
    run.play = function () {
      run.clear(); run.started = true;
      run.gl[0].el.classList.add('tp-pre'); el.classList.add('tp-idle');
      handCaret(run);
      run.gl.forEach(function (g, i) { run.later(function () { run.strike(i); }, lead + at[i]); });
      run.later(function () { el.classList.add('tp-idle', 'tp-done'); doc.dispatchEvent(new CustomEvent('e2:typed', { detail: el })); }, lead + t + 30);
      run.later(function () {                                      /* the caret leaves; the words stand */
        run.gl[run.gl.length - 1].el.classList.remove('tp-cur'); el.classList.remove('tp-idle');
        el.dispatchEvent(new CustomEvent('typed'));
      }, lead + t + caretFor);
    };
    el.classList.add('tp-on');
    if (!pace) { run.gl[0].el.classList.add('tp-pre'); el.classList.add('tp-idle'); }   /* first-screen sentence: caret from the first paint; titles: only when their turn comes */
    return run;
  }

  /* ---------- a paragraph that fills in with scroll (word by word, 28% -> 100%); its layout never changes ---------- */
  var fills = $$('[data-fill]').map(function (p) {
    var ws = [], tw = doc.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = tw.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var f = doc.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { f.appendChild(doc.createTextNode(part)); return; }
        var s = doc.createElement('span'); s.className = 'fw'; s.textContent = part; f.appendChild(s); ws.push(s);
      });
      node.parentNode.replaceChild(f, node);
    });
    return { el: p, ws: ws };
  });
  function fill() {
    var vh = window.innerHeight;
    fills.forEach(function (f) {
      var r = f.el.getBoundingClientRect(), p = (vh * 0.9 - r.top) / (vh * 0.34 + r.height);
      p = RM ? 1 : Math.max(0, Math.min(1, p));
      var k = Math.round(p * f.ws.length * 1.02);
      for (var i = 0; i < f.ws.length; i++) f.ws[i].classList.toggle('on', i < k);
    });
  }
  if (fills.length) {
    var tick = false;
    var onS = function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; fill(); }); } };
    root.classList.add('fill-on'); fill();
    window.addEventListener('scroll', onS, { passive: true }); window.addEventListener('resize', onS);
  }

  if (RM) { window.__E2 = { runs: [], nl: NL, replay: function () {}, freeze: function () {} }; nlButton(); return; }

  var hero = doc.querySelector('[data-type="hero"]'), heroRun = hero ? once(hero, 2000, 170, 900) : null;
  if (heroRun) runs.push(heroRun);
  $$('[data-type="title"]').forEach(function (el) { var r = once(el, 3000, 80, 1300, 60); if (r) { r.view = true; runs.push(r); } });
  $$('[data-type="legacy"]').forEach(function (el) {
    if (getComputedStyle(el).display === 'none') return;          /* the other wording */
    var r = legacy(el); if (!r) return;
    r.legacy = true; r.wait = !!(heroRun && el.hasAttribute('data-after-hero')); runs.push(r);
  });

  var PARKED = /[?&]hold=1(&|$)/.test(location.search);       /* nothing starts by itself: checks, and the four-up comparison page (it calls start()) */
  var busy = 0;                                         /* when the title being typed now will be done (ms, performance clock) */
  var armedAt = 0;
  function queue(r) {                     /* first screen: strictly one after another; scrolled in later: waits at most 0.35 s, so it starts within 0.6 s */
    var now = performance.now(), wait = Math.max(0, busy - now);
    if (now - armedAt > 1000) wait = Math.min(wait, 350);
    r.started = true; busy = Math.max(busy, now + wait + 80 + r.total + 220);
    if (wait) setTimeout(r.play, wait); else r.play();
  }
  function arm() {
    armedAt = performance.now();
    if (heroRun) { heroRun.play(); busy = performance.now() + 170 + heroRun.total + 220; }
    runs.forEach(function (r) { if (r.legacy && r.wait) hero.addEventListener('typed', function () { if (!r.started) r.play(); }); });
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        runs.forEach(function (r) { if (r.el === e.target && !r.started) { if (r.view) queue(r); else r.play(); } });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.35 }) : null;
    runs.forEach(function (r) { if (r === heroRun || r.wait) return; if (io) io.observe(r.el); else if (r.view) queue(r); else r.play(); });
  }
  var armed = false, go = function () { if (!armed) { armed = true; arm(); } };
  if (!PARKED) { if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(go); setTimeout(go, hero ? 200 : 250);   /* the first screen does not wait long for a font */ } else go(); }

  function nlButton() {                                  /* review bar (when present): switch the wording of the name block */
    var bar = doc.querySelector('.hubbar'); if (!bar || !doc.querySelector('[data-nl-block]')) return;
    var x = doc.createElement('i'); x.className = 'hb-x'; bar.appendChild(x);
    var b = doc.createElement('button'); b.type = 'button';
    b.textContent = NL === 'ko' ? '이름 풀이: 옛 글' : '이름 풀이: 영어';
    b.title = '이름 풀이 타이핑의 글을 옛 홈페이지 글(한국어)과 영어 원고 사이에서 바꿉니다';
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      try { localStorage.setItem('inv-e2-nl', NL === 'ko' ? 'en' : 'ko'); } catch (err) {}
      var q = location.search.replace(/[?&]nl=(ko|en)\b/, '').replace(/^&/, '?');
      location.replace(location.pathname + q + (q ? '&' : '?') + 'nl=' + (NL === 'ko' ? 'en' : 'ko'));
    });
    bar.appendChild(b);
  }
  nlButton();

  window.__E2 = {
    runs: runs, nl: NL, start: go,
    replay: function () { runs.forEach(function (r) { if (r.legacy || r === heroRun) r.play(); }); },
    freeze: function (which, k) { runs.forEach(function (r) { if ((which === 'hero' && r === heroRun) || (which === 'legacy' && r.legacy)) r.freeze(k); }); }
  };
})();
