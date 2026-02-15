import { applyFilter, normalizeToken } from "./components/ui/filters.js";
import { renderListing } from "./components/sections/listing-renderer.js";
import { initMediaGalleries } from "./components/sections/media-gallery.js";
import { renderCoverageChart, renderDetectionsByTagChart } from "./components/sections/svg-charts.js";

const jsonCache = new Map();

async function loadJson(path) {
  if (jsonCache.has(path)) return jsonCache.get(path);
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  const payload = await res.json();
  jsonCache.set(path, payload);
  return payload;
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
  const tagParam = new URLSearchParams(window.location.search).get("tag");
  let active = normalizeToken(tagParam || "all") || "all";
  let query = "";
  const tags = uniqueTags(sourceItems);
  if (!tags.includes(active)) active = "all";

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
  const detections = data.detections || [];
  if (chartRoot) renderDetectionsByTagChart(chartRoot, detections, { limit: 8, idPrefix: "security-tag" });
}

async function initHomeDashboard() {
  const coverageRoot = document.getElementById("coverage-chart");
  const tagRoot = document.getElementById("detections-tag-chart");
  const galleryRoot = document.getElementById("proof-gallery-strip");
  if (!coverageRoot && !tagRoot && !galleryRoot) return null;

  const [verified, detectionsData, mediaData] = await Promise.all([
    loadJson("assets/verified-counts.json"),
    loadJson("assets/data/detections.json"),
    loadJson("assets/data/media.json")
  ]);

  if (coverageRoot) renderCoverageChart(coverageRoot, verified);
  if (tagRoot) renderDetectionsByTagChart(tagRoot, detectionsData.detections || [], { limit: 10, idPrefix: "home-tag" });

  return Array.isArray(mediaData.media) ? mediaData.media : [];
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const homeMedia = await initHomeDashboard();
    await Promise.all([
      initProjectsPage(),
      initDetectionsPage(),
      initMediaGalleries(homeMedia)
    ]);
  } catch (err) {
    console.error(err);
  }
});
