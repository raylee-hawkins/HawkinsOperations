function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

function slugTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compactLabel(value, max = 12) {
  const str = String(value || "");
  if (str.length <= max) return str;
  return `${str.slice(0, Math.max(3, max - 3))}...`;
}

function escAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ensureTooltip(container) {
  let tooltip = container.querySelector(".chart-tooltip");
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;
  container.appendChild(tooltip);
  return tooltip;
}

function ensureSummary(container, text) {
  let summary = container.querySelector(".sr-only.chart-summary");
  if (!summary) {
    summary = document.createElement("p");
    summary.className = "sr-only chart-summary";
    container.appendChild(summary);
  }
  summary.textContent = text;
}

function showTooltip(tooltip, evt, label, value) {
  tooltip.textContent = `${label}: ${value}`;
  tooltip.hidden = false;
  const margin = 8;
  const tipW = Math.max(120, tooltip.offsetWidth || 120);
  const tipH = Math.max(24, tooltip.offsetHeight || 24);
  const rawX = Number(evt && evt.clientX) || margin;
  const rawY = Number(evt && evt.clientY) || margin;
  const x = clamp(rawX + 10, margin, Math.max(margin, window.innerWidth - tipW - margin));
  const y = clamp(rawY - tipH - 10, margin, Math.max(margin, window.innerHeight - tipH - margin));
  tooltip.style.position = "fixed";
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip(tooltip) {
  tooltip.hidden = true;
}

function renderFallbackList(container, points, emptyMessage) {
  if (!points.length) {
    container.innerHTML = `<p class="lupd">${emptyMessage}</p>`;
    return;
  }
  container.innerHTML = `<ul class="chart-fallback-list">${points
    .map((p) => `<li><span>${p.label}</span><strong>${p.value}</strong></li>`)
    .join("")}</ul>`;
}

function mountBarChart(container, points, config) {
  const host = container;
  host.classList.add("chart-host");
  if (!points.length) {
    renderFallbackList(host, [], config.emptyMessage);
    return;
  }

  const width = clamp(config.width || 740, 420, 960);
  const height = clamp(config.height || 320, 220, 460);
  const margin = { top: 24, right: 14, bottom: 64, left: 54 };
  const chartW = Math.max(10, width - margin.left - margin.right);
  const chartH = Math.max(10, height - margin.top - margin.bottom);
  const maxValue = Math.max(...points.map((p) => p.value), 1);
  const gap = 12;
  const barW = clamp((chartW - gap * (points.length - 1)) / points.length, 16, 88);
  const chartUsedW = barW * points.length + gap * (points.length - 1);
  const startX = margin.left + Math.max(0, (chartW - chartUsedW) / 2);
  const gradId = `${config.idPrefix}-grad`;

  const bars = points
    .map((point, idx) => {
      const hRaw = (point.value / maxValue) * chartH;
      const barH = clamp(Math.round(hRaw), 4, chartH);
      const x = Math.round(startX + idx * (barW + gap));
      const y = Math.round(margin.top + chartH - barH);
      const valueY = Math.max(12, y - 8);
      const labelX = Math.round(x + barW / 2);
      const shortLabel = compactLabel(point.label, 12);
      const navLabel = point.navLabel || "details";
      const aria = `${point.label}: ${point.value}. Navigate to ${navLabel}.`;
      return `
        <g class="chart-bar-group" data-label="${escAttr(point.label)}" data-value="${point.value}">
          <a class="chart-bar-link" href="${escAttr(point.url)}" tabindex="0" aria-label="${escAttr(aria)}">
            <rect class="chart-bar" x="${x}" y="${y}" width="${Math.round(barW)}" height="${barH}" rx="10"></rect>
            <text class="chart-value" x="${labelX}" y="${valueY}" text-anchor="middle">${point.value}</text>
            <text class="chart-label" x="${labelX}" y="${height - 24}" text-anchor="middle">${shortLabel}</text>
          </a>
        </g>
      `;
    })
    .join("");

  host.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${config.ariaLabel}">
      <defs>
        <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--acc)"></stop>
          <stop offset="100%" stop-color="var(--acc2)"></stop>
        </linearGradient>
      </defs>
      <line class="chart-axis" x1="${margin.left}" y1="${margin.top + chartH}" x2="${width - margin.right}" y2="${margin.top + chartH}"></line>
      <g style="fill:url(#${gradId})">${bars}</g>
    </svg>
  `;

  const tooltip = ensureTooltip(host);
  ensureSummary(host, config.summary);

  const links = Array.from(host.querySelectorAll(".chart-bar-link"));
  links.forEach((link) => {
    const group = link.closest(".chart-bar-group");
    if (!group) return;
    const label = group.getAttribute("data-label") || "item";
    const value = group.getAttribute("data-value") || "0";
    link.addEventListener("mousemove", (evt) => showTooltip(tooltip, evt, label, value));
    link.addEventListener("mouseenter", (evt) => showTooltip(tooltip, evt, label, value));
    link.addEventListener("mouseleave", () => hideTooltip(tooltip));
    link.addEventListener("focus", () => {
      const rect = link.getBoundingClientRect();
      showTooltip(tooltip, { clientX: rect.left + rect.width / 2, clientY: rect.top }, label, value);
    });
    link.addEventListener("blur", () => hideTooltip(tooltip));
  });
}

export function renderCoverageChart(container, verifiedCounts, options = {}) {
  if (!container) return;
  const counts = verifiedCounts && verifiedCounts.counts ? verifiedCounts.counts : verifiedCounts || {};
  const map = [
    { key: "detections", label: "Detections", url: "/security.html#detection-inventory", navLabel: "Detection Inventory" },
    { key: "sigma", label: "Sigma Rules", url: "/security.html#detection-inventory", navLabel: "Detection Inventory" },
    { key: "wazuh", label: "Wazuh Blocks", url: "/security.html#detection-inventory", navLabel: "Detection Inventory" },
    { key: "splunk", label: "Splunk Queries", url: "/security.html#detection-inventory", navLabel: "Detection Inventory" },
    { key: "ir", label: "Playbooks", url: "/projects.html#project-evidence", navLabel: "Project Evidence" },
    { key: "migrations", label: "Migrations", url: "/projects.html#project-evidence", navLabel: "Project Evidence" }
  ];
  const points = map
    .map((item) => ({ label: item.label, value: toInt(counts[item.key]), url: item.url, navLabel: item.navLabel }))
    .filter((item) => item.value > 0);
  if (!points.length) {
    renderFallbackList(container, [], "Coverage values are not available yet.");
    return;
  }
  const summary = `Coverage overview: ${points.map((p) => `${p.label} ${p.value}`).join(", ")}.`;
  mountBarChart(container, points, {
    idPrefix: options.idPrefix || "coverage",
    ariaLabel: "Coverage overview chart",
    summary,
    emptyMessage: "Coverage values are not available yet."
  });
}

export function renderDetectionsByTagChart(container, detections, options = {}) {
  if (!container) return;
  const rows = Array.isArray(detections) ? detections : [];
  const counts = new Map();
  rows.forEach((row) => {
    const value = toInt(row && row.count);
    const tags = Array.isArray(row && row.tags) ? row.tags : [];
    tags.forEach((tag) => {
      const key = slugTag(tag);
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + value);
    });
  });

  const points = Array.from(counts.entries())
    .map(([tag, value]) => ({
      label: tag,
      value: toInt(value),
      url: `/security.html?tag=${encodeURIComponent(tag)}#detection-inventory`,
      navLabel: "Detection Inventory"
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, clamp(options.limit || 10, 3, 12));

  if (!points.length) {
    renderFallbackList(container, [], "Tags not available yet.");
    return;
  }

  const summary = `Top detection tags: ${points.map((p) => `${p.label} ${p.value}`).join(", ")}.`;
  mountBarChart(container, points, {
    idPrefix: options.idPrefix || "tag",
    ariaLabel: "Detections by tag chart",
    summary,
    emptyMessage: "Tags not available yet."
  });
}
