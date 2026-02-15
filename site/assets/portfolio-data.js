import { applyFilter, normalizeToken } from "./components/ui/filters.js";
import { renderListing } from "./components/sections/listing-renderer.js";
import { initMediaGalleries } from "./components/sections/media-gallery.js";

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function uniqueTags(items) {
  const bag = new Set();
  items.forEach((item) => (item.tags || []).forEach((tag) => bag.add(normalizeToken(tag))));
  return ["all", ...Array.from(bag).sort()];
}

function renderTagButtons(container, tags, active) {
  if (!container) return;
  container.innerHTML = tags
    .map((tag) => {
      const label = tag === "all" ? "all" : tag;
      const pressed = tag === active ? "true" : "false";
      return `<button type="button" class="filter-chip" data-tag="${tag}" aria-pressed="${pressed}">${label}</button>`;
    })
    .join("");
}

function bindFilters({ sourceItems, listingNode, chipsNode, searchNode, kind }) {
  let active = "all";
  let query = "";
  const tags = uniqueTags(sourceItems);

  const redraw = () => {
    renderTagButtons(chipsNode, tags, active);
    const filtered = applyFilter(sourceItems, active, query);
    renderListing(listingNode, filtered, kind);
  };

  chipsNode.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-tag]");
    if (!btn) return;
    active = btn.getAttribute("data-tag") || "all";
    redraw();
  });

  searchNode.addEventListener("input", () => {
    query = searchNode.value || "";
    redraw();
  });

  redraw();
}

async function initProjectsPage() {
  const root = document.querySelector("[data-projects-root]");
  if (!root) return;
  const data = await loadJson("assets/data/projects.json");
  bindFilters({
    sourceItems: data.projects || [],
    listingNode: root.querySelector("[data-listing]"),
    chipsNode: root.querySelector("[data-chips]"),
    searchNode: root.querySelector("[data-search]"),
    kind: "projects"
  });
}

async function initDetectionsPage() {
  const root = document.querySelector("[data-detections-root]");
  if (!root) return;
  const data = await loadJson("assets/data/detections.json");
  bindFilters({
    sourceItems: data.detections || [],
    listingNode: root.querySelector("[data-listing]"),
    chipsNode: root.querySelector("[data-chips]"),
    searchNode: root.querySelector("[data-search]"),
    kind: "detections"
  });

  const chartRoot = document.getElementById("detectionsChart");
  const chartSummary = document.getElementById("detectionsChartSummary");
  const detections = data.detections || [];
  if (chartRoot && detections.length) {
    const width = 620;
    const height = 220;
    const max = Math.max(...detections.map((d) => Number(d.count || 0)), 1);
    const barW = Math.floor(width / detections.length) - 20;
    const bars = detections
      .map((d, i) => {
        const count = Number(d.count || 0);
        const h = Math.max(8, Math.round((count / max) * 150));
        const x = 18 + i * (barW + 20);
        const y = 168 - h;
        const label = String(d.platform || "item");
        return `<g>
  <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="8" fill="url(#detGrad)"></rect>
  <text x="${x + barW / 2}" y="188" text-anchor="middle" font-size="11" fill="currentColor">${label}</text>
  <text x="${x + barW / 2}" y="${y - 8}" text-anchor="middle" font-size="11" fill="currentColor">${count}</text>
</g>`;
      })
      .join("");
    chartRoot.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Detections by platform">
  <defs>
    <linearGradient id="detGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#6cd7ff"></stop>
      <stop offset="100%" stop-color="#7a88ff"></stop>
    </linearGradient>
  </defs>
  <line x1="10" y1="170" x2="${width - 10}" y2="170" stroke="rgba(255,255,255,.3)" />
  ${bars}
</svg>`;
    if (chartSummary) {
      const summary = detections.map((d) => `${d.platform}: ${d.count}`).join(" | ");
      chartSummary.textContent = `Chart summary: ${summary}`;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([initProjectsPage(), initDetectionsPage(), initMediaGalleries()]);
  } catch (err) {
    console.error(err);
  }
});
