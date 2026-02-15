import { applyFilter, normalizeToken } from "./components/ui/filters.js";
import { renderListing } from "./components/sections/listing-renderer.js";
import { initMediaGalleries } from "./components/sections/media-gallery.js";
import { renderCoverageChart, renderDetectionsByTagChart, renderDetectionsByTagMiniChart } from "./components/sections/svg-charts.js";

const jsonCache = new Map();

async function loadJson(path) {
  if (jsonCache.has(path)) return jsonCache.get(path);
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  const payload = await res.json();
  jsonCache.set(path, payload);
  return payload;
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isSafeMedia(item) {
  return String(item && item.privacy_review ? item.privacy_review : "").toLowerCase() === "ok";
}

function emitContentUpdated() {
  window.dispatchEvent(new Event("rh:content-updated"));
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
    emitContentUpdated();
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

function renderProjectProofCards(container, projects) {
  if (!container) return;
  const rows = Array.isArray(projects) ? projects : [];
  if (!rows.length) {
    container.innerHTML = '<article class="proof-card"><h3>No project records</h3><p>Project proof cards will appear when project metadata is available.</p></article>';
    return;
  }
  container.innerHTML = rows.map((project) => {
    const title = esc(project.title || "Project");
    const summary = esc(project.summary || "Project summary pending.");
    const pageUrl = esc(project.page_url || "#");
    const repoUrl = esc(project.repo_url || "#");
    const evidence = Array.isArray(project.evidence) ? project.evidence : [];
    const evidenceLinks = evidence.slice(0, 3).map((entry) => {
      return `<a href="${esc(entry.url)}" target="_blank" rel="noreferrer">${esc(entry.label)}</a>`;
    }).join("");
    return `<article class="proof-card">
      <h3><a href="${pageUrl}">${title}</a></h3>
      <p>${summary}</p>
      <div class="proof-card-links">
        <a href="${repoUrl}" target="_blank" rel="noreferrer">Repository lane</a>
        ${evidenceLinks}
      </div>
    </article>`;
  }).join("");
}

function renderProjectToolMarks(container, mediaItems) {
  if (!container) return;
  const rows = (Array.isArray(mediaItems) ? mediaItems : [])
    .filter((item) => isSafeMedia(item) && /logo|badge/i.test(String(item.type || "")));
  if (!rows.length) {
    container.innerHTML = '<p class="lupd">Tool marks will appear when approved logo assets are available.</p>';
    return;
  }

  const seen = new Set();
  const selected = rows.filter((item) => {
    const key = String(item.caption || item.id || "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);

  container.innerHTML = `<div class="tool-marks">${selected.map((item) => `
    <span class="tool-mark">
      <img src="${esc(item.path)}" alt="${esc(item.alt || item.caption || "tool mark")}" loading="lazy" width="${item.width || 64}" height="${item.height || 64}">
      <span>${esc(item.caption || item.id || "tool")}</span>
    </span>
  `).join("")}</div>`;
}

function renderSecurityKpis(container, verified) {
  if (!container || !verified || !verified.counts) return;
  const counts = verified.counts;
  const map = [
    ["sec-count-detections", counts.detections],
    ["sec-count-sigma", counts.sigma],
    ["sec-count-wazuh", counts.wazuh],
    ["sec-count-splunk", counts.splunk],
    ["sec-count-ir", counts.ir]
  ];
  map.forEach(([id, value]) => {
    const el = container.querySelector(`#${id}`);
    if (!el || typeof value !== "number") return;
    el.textContent = String(value);
  });
}

function renderMitreCoverageStatus(container, detections) {
  if (!container) return;
  const rows = Array.isArray(detections) ? detections : [];
  const withMitre = rows.filter((item) => item && (item.tactic || item.technique_id || item.technique_name));
  if (!rows.length || !withMitre.length) {
    container.innerHTML = 'Coverage not available yet. Add optional fields <code>tactic</code>, <code>technique_id</code>, and <code>technique_name</code> to detection entries to enable MITRE heatmap rendering.';
    return;
  }
  container.innerHTML = `MITRE metadata is present on <b>${withMitre.length}</b> of <b>${rows.length}</b> records. Heatmap rendering is ready once tactic and technique coverage is complete.`;
}

async function initProjectsPage() {
  const root = document.querySelector("[data-projects-root]");
  if (!root) return;
  const [data, mediaData] = await Promise.all([
    loadJson("assets/data/projects.json"),
    loadJson("assets/data/media.json")
  ]);
  const projects = data.projects || [];
  bindFilters({
    sourceItems: projects,
    listingNode: root.querySelector("[data-listing]"),
    chipsNode: root.querySelector("[data-chips]"),
    searchNode: root.querySelector("[data-search]"),
    kind: "projects"
  });
  renderProjectProofCards(root.querySelector("[data-project-proof]"), projects);
  renderProjectToolMarks(root.querySelector("[data-project-tools]"), mediaData.media || []);
}

async function initDetectionsPage() {
  const root = document.querySelector("[data-detections-root]");
  if (!root) return;
  const [data, verified] = await Promise.all([
    loadJson("assets/data/detections.json"),
    loadJson("assets/verified-counts.json").catch(() => null)
  ]);
  const detections = data.detections || [];
  bindFilters({
    sourceItems: detections,
    listingNode: root.querySelector("[data-listing]"),
    chipsNode: root.querySelector("[data-chips]"),
    searchNode: root.querySelector("[data-search]"),
    kind: "detections"
  });

  const chartRoot = document.getElementById("detectionsChart");
  if (chartRoot) renderDetectionsByTagChart(chartRoot, detections, { limit: 8, idPrefix: "security-tag" });
  const miniTagChart = document.getElementById("securityTagMiniChart");
  if (miniTagChart) renderDetectionsByTagMiniChart(miniTagChart, detections, { limit: 5, idPrefix: "security-mini-tag", width: 560 });
  renderSecurityKpis(root.querySelector("[data-security-kpis]"), verified);
  renderMitreCoverageStatus(document.getElementById("mitre-coverage-status"), detections);
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
    emitContentUpdated();
  } catch (err) {
    console.error(err);
  }
});
