(function () {
  var GITHUB = {
    username: "raylee-hawkins",
    repo: "HawkinsOperations"
  };

  var STORAGE_KEY = "rh-theme";
  var KPI_TIMEOUT_MS = 1800;
  var TAG_TIMEOUT_MS = 1500;

  var FALLBACK_COUNTS = {
    detections: 142,
    sigma: 105,
    wazuh: 29,
    splunk: 8,
    ir: 10,
    verified_on: "2026-02-15"
  };

  var FALLBACK_TAGS = ["detection", "mitre", "response", "automation", "triage", "validation"];

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function safeTheme(raw) {
    return raw === "light" || raw === "dark" ? raw : "dark";
  }

  function currentTheme() {
    return safeTheme(document.documentElement.getAttribute("data-theme"));
  }

  function applyTheme(theme) {
    var resolved = safeTheme(theme);
    var btn = qs("#themeToggle");
    document.documentElement.setAttribute("data-theme", resolved);
    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch (err) {
      // no-op
    }

    if (btn) {
      var next = resolved === "dark" ? "light" : "dark";
      btn.textContent = next === "light" ? "Light mode" : "Dark mode";
      btn.setAttribute("aria-label", "Switch to " + next + " mode");
    }
  }

  function wireThemeToggle() {
    var btn = qs("#themeToggle");
    if (!btn) return;

    var stored;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      stored = null;
    }

    applyTheme(stored || currentTheme() || "dark");
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      window.dispatchEvent(new CustomEvent("rh:theme-changed", { detail: next }));
    });
  }

  function wireMenu() {
    var menuBtn = qs("#menuToggle");
    var nav = qs("#siteNav");
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    qsa("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function wireHeaderScrollState() {
    var header = qs("#siteHeader");
    if (!header) return;

    var ticking = false;
    function paintState() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(paintState);
      },
      { passive: true }
    );

    paintState();
  }

  function setYear() {
    var yearNode = qs("#yearNow");
    if (yearNode) yearNode.textContent = String(new Date().getFullYear());
  }

  function repoBase() {
    return "https://github.com/" + GITHUB.username + "/" + GITHUB.repo;
  }

  function wireGithubLinks() {
    qsa("[data-gh-url]").forEach(function (node) {
      var suffix = (node.getAttribute("data-gh-url") || "").replace(/^\/+/, "");
      node.setAttribute("href", suffix ? repoBase() + "/" + suffix : repoBase());
      if (!node.getAttribute("target")) node.setAttribute("target", "_blank");
      if (!node.getAttribute("rel")) node.setAttribute("rel", "noreferrer");
    });

    qsa("[data-gh-clone]").forEach(function (node) {
      node.textContent = "git clone " + repoBase() + ".git";
    });

    qsa("[data-gh-repo]").forEach(function (node) {
      node.textContent = GITHUB.repo;
    });
  }

  function fetchJsonWithTimeout(url, timeoutMs) {
    if (typeof window.fetchJsonWithTimeout !== "function") return Promise.resolve(null);
    return window.fetchJsonWithTimeout(url, { timeoutMs: timeoutMs });
  }

  function toNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }

  function renderKpis(counts, verifiedOn) {
    var safe = {
      detections: toNumber(counts.detections, FALLBACK_COUNTS.detections),
      sigma: toNumber(counts.sigma, FALLBACK_COUNTS.sigma),
      wazuh: toNumber(counts.wazuh, FALLBACK_COUNTS.wazuh),
      splunk: toNumber(counts.splunk, FALLBACK_COUNTS.splunk),
      ir: toNumber(counts.ir, FALLBACK_COUNTS.ir)
    };

    var max = Math.max(safe.detections, 1);
    Object.keys(safe).forEach(function (key) {
      var valueNode = qs("#kpi-" + key);
      var card = qs('[data-kpi="' + key + '"]');
      if (valueNode) valueNode.textContent = String(safe[key]);
      if (card) {
        var progress = Math.max(6, Math.min(100, Math.round((safe[key] / max) * 100)));
        card.style.setProperty("--p", String(progress));
      }
    });

    var verifiedNode = qs("#verifiedOn");
    if (verifiedNode) verifiedNode.textContent = verifiedOn || FALLBACK_COUNTS.verified_on;
  }

  function loadKpis() {
    return fetchJsonWithTimeout("/assets/verified-counts.json", KPI_TIMEOUT_MS)
      .then(function (payload) {
        if (!payload || typeof payload !== "object") {
          throw new Error("Missing verified counts payload");
        }
        var counts = payload && payload.counts && typeof payload.counts === "object" ? payload.counts : {};
        var verifiedOn = payload && typeof payload.verified_on === "string" ? payload.verified_on : FALLBACK_COUNTS.verified_on;
        renderKpis(counts, verifiedOn);
      })
      .catch(function (err) {
        console.warn("[home] KPI fallback in use:", err && err.message ? err.message : err);
        renderKpis(FALLBACK_COUNTS, FALLBACK_COUNTS.verified_on);
      });
  }

  function normalizeTag(tag) {
    return String(tag || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function prettyTag(tag) {
    return String(tag || "")
      .split("-")
      .map(function (part) {
        return part ? part.charAt(0).toUpperCase() + part.slice(1) : "";
      })
      .join(" ");
  }

  function collectTagStats(payload) {
    var detections = payload && Array.isArray(payload.detections) ? payload.detections : [];
    var bag = new Map();

    detections.forEach(function (entry) {
      var tags = Array.isArray(entry.tags) ? entry.tags : [];
      var weight = toNumber(entry.count, 1);
      tags.forEach(function (rawTag) {
        var tag = normalizeTag(rawTag);
        if (!tag) return;
        bag.set(tag, (bag.get(tag) || 0) + Math.max(weight, 1));
      });
    });

    return Array.from(bag.entries())
      .sort(function (a, b) {
        return b[1] - a[1];
      })
      .slice(0, 6)
      .map(function (pair) {
        return { tag: pair[0], count: pair[1] };
      });
  }

  function renderTagChart(stats) {
    var root = qs("#tagCoverage");
    var statusNode = qs("#tagCoverageStatus");
    if (!root) return;

    var max = Math.max.apply(
      null,
      stats.map(function (row) {
        return row.count;
      }).concat([1])
    );

    var rows = stats
      .map(function (row) {
        var width = Math.max(8, Math.round((row.count / max) * 100));
        return (
          '<div class="tag-row">' +
          "<span>" + prettyTag(row.tag) + "</span>" +
          "<small>" + row.count + "</small>" +
          '<div class="tag-meter"><span style="width:' + width + '%"></span></div>' +
          "</div>"
        );
      })
      .join("");

    root.innerHTML = '<div class="tag-chart">' + rows + "</div>";
    root.setAttribute("aria-busy", "false");
    if (statusNode) statusNode.textContent = "Coverage loaded from detection inventory.";
  }

  function renderTagFallback(reason) {
    var root = qs("#tagCoverage");
    var statusNode = qs("#tagCoverageStatus");
    if (!root) return;

    var pills = FALLBACK_TAGS.map(function (tag) {
      return '<span class="tag-pill">' + prettyTag(tag) + "</span>";
    }).join("");

    root.innerHTML =
      '<div class="tag-fallback">' +
      "<p>Tag coverage is temporarily unavailable. Showing fallback tags.</p>" +
      '<div class="tag-pills">' + pills + "</div>" +
      '<a href="/security.html#detection-inventory">View full inventory</a>' +
      "</div>";
    root.setAttribute("aria-busy", "false");
    if (statusNode) statusNode.textContent = "Fallback tag set active.";

    if (reason) {
      console.warn("[home] Tag coverage fallback in use:", reason);
    }
  }

  function loadTagCoverage() {
    fetchJsonWithTimeout("/assets/data/detections.json", TAG_TIMEOUT_MS)
      .then(function (payload) {
        if (!payload || typeof payload !== "object") {
          throw new Error("Missing detections payload");
        }
        var stats = collectTagStats(payload);
        if (!stats.length) {
          renderTagFallback("No tag data found in payload");
          return;
        }
        renderTagChart(stats);
      })
      .catch(function (err) {
        renderTagFallback(err && err.message ? err.message : String(err));
      });
  }

  function initCanvasBackground() {
    var canvas = qs("#neuralBg");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var width = 0;
    var height = 0;
    var dpr = 1;
    var nodes = [];
    var rafId = 0;
    var lastFrame = 0;

    function shouldReduceMotion() {
      return Boolean(reducedMotion && reducedMotion.matches);
    }

    function rebuildNodes() {
      var area = width * height;
      var count = Math.max(20, Math.min(56, Math.round(area / 36000)));
      nodes = [];
      for (var i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          size: 0.7 + Math.random() * 1.8
        });
      }
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(window.innerWidth, 320);
      height = Math.max(window.innerHeight, 320);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildNodes();
      drawFrame(true);
    }

    function themeRgb() {
      return currentTheme() === "light" ? "40, 88, 130" : "184, 227, 255";
    }

    function drawFrame(staticOnly) {
      var rgb = themeRgb();
      var edge = 158;

      ctx.clearRect(0, 0, width, height);

      if (!staticOnly) {
        for (var i = 0; i < nodes.length; i += 1) {
          var n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -12) n.x = width + 12;
          if (n.y < -12) n.y = height + 12;
          if (n.x > width + 12) n.x = -12;
          if (n.y > height + 12) n.y = -12;
        }
      }

      for (var a = 0; a < nodes.length; a += 1) {
        var na = nodes[a];
        for (var b = a + 1; b < nodes.length; b += 1) {
          var nb = nodes[b];
          var dx = na.x - nb.x;
          var dy = na.y - nb.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > edge) continue;
          var alpha = (1 - dist / edge) * 0.16;
          ctx.strokeStyle = "rgba(" + rgb + ", " + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }

      for (var j = 0; j < nodes.length; j += 1) {
        var node = nodes[j];
        ctx.fillStyle = "rgba(" + rgb + ", 0.44)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(ts) {
      if (!lastFrame || ts - lastFrame > 32) {
        lastFrame = ts;
        drawFrame(false);
      }
      rafId = window.requestAnimationFrame(tick);
    }

    function start() {
      if (rafId) window.cancelAnimationFrame(rafId);
      lastFrame = 0;
      if (shouldReduceMotion()) {
        drawFrame(true);
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    }

    resizeCanvas();
    start();

    window.addEventListener("resize", function () {
      resizeCanvas();
      start();
    });

    window.addEventListener("rh:theme-changed", function () {
      drawFrame(true);
    });

    if (reducedMotion && typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", function () {
        start();
      });
    }
  }

  function init() {
    wireGithubLinks();
    wireThemeToggle();
    wireMenu();
    wireHeaderScrollState();
    setYear();
    loadKpis();
    loadTagCoverage();
    initCanvasBackground();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
