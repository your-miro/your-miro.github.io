/* Site behaviour: theme, nav, scroll-spy, TOC, log filters, reveal, spectrum trace. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return !window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  /* ---------- Theme toggle ---------- */
  document.querySelectorAll("[data-themetoggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      var frame = document.querySelector("iframe.giscus-frame");
      if (frame) {
        frame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: next === "dark" ? "transparent_dark" : "light" } } },
          "https://giscus.app"
        );
      }
    });
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector("[data-navtoggle]");
  var nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Top bar border on scroll ---------- */
  var topbar = document.querySelector("[data-topbar]");
  if (topbar) {
    var onScroll = function () { topbar.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll-spy for home sections ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId[en.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".sechead, .fig-card, .entry, .tablefig, .contrib");
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); rev.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { el.classList.add("reveal"); rev.observe(el); });
  }

  /* ---------- Post table of contents ---------- */
  var prose = document.querySelector("[data-prose]");
  var toc = document.querySelector("[data-toc]");
  if (prose && toc) {
    var heads = Array.prototype.slice.call(prose.querySelectorAll("h2[id], h3[id]"))
      .filter(function (h) { return !/^discussions?:?$/i.test(h.textContent.trim()) && h.textContent.trim() !== "."; });
    if (heads.length >= 3) {
      var list = toc.querySelector("[data-toc-list]");
      var links = heads.map(function (h) {
        var li = document.createElement("li");
        li.className = "lvl-" + h.tagName.charAt(1);
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent.replace(/:$/, "");
        li.appendChild(a);
        list.appendChild(li);
        return a;
      });
      toc.hidden = false;
      if ("IntersectionObserver" in window) {
        var tocSpy = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var i = heads.indexOf(en.target);
            links.forEach(function (a, j) { a.classList.toggle("is-active", j === i); });
          });
        }, { rootMargin: "0px 0px -70% 0px" });
        heads.forEach(function (h) { tocSpy.observe(h); });
      }
    }
  }

  /* ---------- Log filters ---------- */
  var filters = document.querySelector("[data-filters]");
  if (filters) {
    var empty = document.querySelector("[data-filters-empty]");
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      var cat = btn.getAttribute("data-filter");
      filters.querySelectorAll("[data-filter]").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      var shown = 0;
      document.querySelectorAll("[data-year]").forEach(function (sec) {
        var any = false;
        sec.querySelectorAll("[data-cats]").forEach(function (row) {
          var ok = !cat || row.getAttribute("data-cats").split("|").indexOf(cat) !== -1;
          row.hidden = !ok;
          if (ok) { any = true; shown++; }
        });
        sec.hidden = !any;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ---------- Spectrum analyzer trace ---------- */
  var canvas = document.querySelector("[data-spectrum]");
  if (canvas && canvas.getContext) spectrum(canvas);

  function spectrum(cv) {
    var ctx = cv.getContext("2d");
    // Display settings (match the status bar): CF 1.6725 GHz, SPAN 700 MHz.
    var F0 = 1322.5, SPAN = 700;           // MHz, left edge and span
    var DIV_X = 10, DIV_Y = 8;
    var N = 601;                            // trace points
    // Signals: the two LO±IF tones, LO leakage, and low-level spurs (dBm)
    var tones = [
      { f: 1742.5, p: 9.45, w: 2.2 },
      { f: 1942.5, p: 9.38, w: 2.2 },
      { f: 1842.5, p: -24, w: 2.0 },
      { f: 1642.5, p: -46, w: 2.0 },
      { f: 2042.5, p: -47, w: 2.0 },
      { f: 1792.5, p: -53, w: 1.8 },
      { f: 1892.5, p: -52, w: 1.8 }
    ];
    var FLOOR = -50;
    var trace = new Float32Array(N), hold = new Float32Array(N);
    var W = 0, H = 0, dpr = 1, plot = null;
    var sweepMs = 2600, start = performance.now(), lastIdx = 0;

    function model(f) {
      var lin = Math.pow(10, FLOOR / 10);
      for (var i = 0; i < tones.length; i++) {
        var t = tones[i], x = (f - t.f) / t.w;
        // Gaussian RBW response + a phase-noise skirt
        var shape = Math.exp(-x * x) + 6e-5 / (1 + x * x / 25);
        lin += Math.pow(10, t.p / 10) * shape;
      }
      return 10 * Math.log10(lin);
    }
    function noisy(f) {
      // Rayleigh-ish video noise on the floor, in dB
      // (a few averaged exponential samples ≈ light video averaging)
      var acc = 0;
      for (var k = 0; k < 4; k++) acc += -Math.log(Math.max(1e-6, Math.random()));
      return model(f) + 10 * Math.log10(acc / 4) * 0.9;
    }
    for (var i = 0; i < N; i++) { trace[i] = noisy(F0 + SPAN * i / (N - 1)); hold[i] = trace[i]; }

    function layout() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var narrow = W < 760;
      // On narrow screens the text stacks over the top, so the plot sits lower.
      plot = {
        x: 0, w: W,
        y: narrow ? H * 0.6 : H * 0.1,
        h: narrow ? H * 0.37 : H * 0.84,
        ref: narrow ? 14 : 20, dbDiv: narrow ? 10 : 10
      };
    }

    function yOf(db) {
      var top = plot.ref, bottom = plot.ref - plot.dbDiv * DIV_Y;
      var t = (top - db) / (top - bottom);
      return plot.y + Math.min(1.02, Math.max(-0.02, t)) * plot.h;
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      // Graticule
      ctx.lineWidth = 1;
      for (var gx = 0; gx <= DIV_X; gx++) {
        var x = Math.round(plot.x + plot.w * gx / DIV_X) + 0.5;
        ctx.strokeStyle = gx === DIV_X / 2 ? "rgba(177,140,255,.2)" : "rgba(177,140,255,.09)";
        ctx.beginPath(); ctx.moveTo(x, plot.y); ctx.lineTo(x, plot.y + plot.h); ctx.stroke();
      }
      for (var gy = 0; gy <= DIV_Y; gy++) {
        var y = Math.round(plot.y + plot.h * gy / DIV_Y) + 0.5;
        ctx.strokeStyle = gy === DIV_Y / 2 ? "rgba(177,140,255,.2)" : "rgba(177,140,255,.09)";
        ctx.beginPath(); ctx.moveTo(plot.x, y); ctx.lineTo(plot.x + plot.w, y); ctx.stroke();
      }

      // Max-hold (dim)
      ctx.beginPath();
      for (var i = 0; i < N; i++) {
        var px = plot.x + plot.w * i / (N - 1), py = yOf(hold[i]);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = "rgba(242,214,117,.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Live trace: glow pass + crisp pass
      ctx.beginPath();
      for (var j = 0; j < N; j++) {
        var qx = plot.x + plot.w * j / (N - 1), qy = yOf(trace[j]);
        j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
      }
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(177,140,255,.28)"; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = "#c2a4ff"; ctx.lineWidth = 1.4; ctx.stroke();

      // Sweep cursor
      if (!reduceMotion && now != null) {
        var sx = plot.x + plot.w * lastIdx / (N - 1);
        var g = ctx.createLinearGradient(sx - 60, 0, sx, 0);
        g.addColorStop(0, "rgba(177,140,255,0)"); g.addColorStop(1, "rgba(177,140,255,.10)");
        ctx.fillStyle = g; ctx.fillRect(sx - 60, plot.y, 60, plot.h);
      }

      // Markers on the two tones
      ctx.font = "500 11px 'Geist Mono', monospace";
      [[0, "M1"], [1, "M2"]].forEach(function (m) {
        var t = tones[m[0]];
        var mx = plot.x + plot.w * (t.f - F0) / SPAN, my = yOf(t.p);
        ctx.fillStyle = "#f2d675";
        ctx.beginPath(); ctx.moveTo(mx, my - 4); ctx.lineTo(mx + 5, my - 11); ctx.lineTo(mx - 5, my - 11); ctx.closePath(); ctx.fill();
        ctx.fillText(m[1], mx + 8, my - 6);
      });

      // Frequency axis labels
      ctx.fillStyle = "rgba(200,190,220,.55)";
      ctx.font = "500 10.5px 'Geist Mono', monospace";
      var by = plot.y + plot.h - 8;
      ctx.textAlign = "left"; ctx.fillText((F0 / 1000).toFixed(4) + " GHz", plot.x + 10, by);
      ctx.textAlign = "right"; ctx.fillText(((F0 + SPAN) / 1000).toFixed(4) + " GHz", plot.x + plot.w - 10, by);
      ctx.textAlign = "left";
    }

    function tick(now) {
      var phase = ((now - start) % sweepMs) / sweepMs;
      var idx = Math.floor(phase * (N - 1));
      if (idx < lastIdx) { // new sweep
        for (var k = lastIdx; k < N; k++) update(k);
        lastIdx = 0;
      }
      for (var i = lastIdx; i <= idx; i++) update(i);
      lastIdx = idx;
      draw(now);
      raf = requestAnimationFrame(tick);
    }
    function update(i) {
      trace[i] = noisy(F0 + SPAN * i / (N - 1));
      hold[i] = Math.max(trace[i], hold[i] - 0.15);
    }

    var raf = 0, visible = true;
    layout();
    draw(null);
    window.addEventListener("resize", function () { layout(); draw(null); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(null); });

    if (reduceMotion) return;
    // Only animate while the hero is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) { start = performance.now() - (lastIdx / (N - 1)) * sweepMs; raf = requestAnimationFrame(tick); }
        if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
      }).observe(cv);
    } else {
      raf = requestAnimationFrame(tick);
    }
  }
})();
