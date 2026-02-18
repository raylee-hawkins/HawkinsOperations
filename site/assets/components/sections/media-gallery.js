function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hasTag(item, tags) {
  if (!tags.length) return true;
  const itemTags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : [];
  return tags.some((tag) => itemTags.includes(tag));
}

const PROOF_TYPE_ORDER = ["screenshot", "dashboard", "diagram", "flowchart", "table"];
const TOOL_MARK_TYPES = new Set(["logo", "badge", "brand", "toolmark"]);

function normalizeType(item) {
  return String(item && item.type ? item.type : "")
    .trim()
    .toLowerCase();
}

function isToolMark(item) {
  const t = normalizeType(item);
  return TOOL_MARK_TYPES.has(t) || t.includes("logo") || t.includes("badge");
}

function proofTypeRank(item) {
  const t = normalizeType(item);
  const idx = PROOF_TYPE_ORDER.indexOf(t);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function normalizeSafeItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (!item || !item.path) return false;
    return String(item.privacy_review || "").toLowerCase() === "ok";
  });
}

function dedupeToolMarks(items) {
  const seen = new Set();
  return items.filter((item) => {
    const label = String(item.caption || item.alt || item.id || "").toLowerCase();
    if (!label || seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

function pickGalleryItems(items, limit) {
  const sorted = [...items].sort((a, b) => {
    const rankDelta = proofTypeRank(a) - proofTypeRank(b);
    if (rankDelta !== 0) return rankDelta;
    return String(a.caption || a.id || "").localeCompare(String(b.caption || b.id || ""));
  });

  const proofTiles = sorted.filter((item) => !isToolMark(item));
  const tileItems = proofTiles.slice(0, limit);
  const toolMarks = dedupeToolMarks(sorted.filter((item) => isToolMark(item))).slice(0, 12);
  return { tileItems, toolMarks };
}

function ensureLightbox() {
  let lb = document.getElementById("mediaLightbox");
  if (lb) return lb;
  lb = document.createElement("div");
  lb.id = "mediaLightbox";
  lb.className = "media-lightbox";
  lb.innerHTML = '<button type="button" class="media-lightbox-close" aria-label="Close image viewer">Close</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  const closeBtn = lb.querySelector(".media-lightbox-close");
  closeBtn.addEventListener("click", () => lb.classList.remove("open"));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) lb.classList.remove("open");
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("open");
  });
  return lb;
}

export function renderMediaGallery(root, items) {
  if (!root) return;
  const tags = (root.getAttribute("data-tags") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const requestedLimit = Number(root.getAttribute("data-limit") || "6");
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 6;
  const selected = normalizeSafeItems(items).filter((m) => hasTag(m, tags));
  const { tileItems, toolMarks } = pickGalleryItems(selected, limit);
  if (!tileItems.length && !toolMarks.length) {
    root.innerHTML = '<p class="lupd">No safe media assets matched this gallery yet.</p>';
    return;
  }
  if (!tileItems.length && toolMarks.length) {
    root.innerHTML = `<div class="tool-marks" aria-label="Tool marks">${toolMarks.map((m) => `
      <span class="tool-mark">
        <img src="${esc(m.path)}" alt="${esc(m.alt || m.caption || "tool mark")}" loading="lazy" width="${m.width || 64}" height="${m.height || 64}">
        <span>${esc(m.caption || m.id || "tool")}</span>
      </span>
    `).join("")}</div>`;
    return;
  }

  const toolMarksHtml = toolMarks.length ? `<div class="tool-marks" aria-label="Tool marks" style="margin-top:0.7rem">${toolMarks.map((m) => `
    <span class="tool-mark">
      <img src="${esc(m.path)}" alt="${esc(m.alt || m.caption || "tool mark")}" loading="lazy" width="${m.width || 64}" height="${m.height || 64}">
      <span>${esc(m.caption || m.id || "tool")}</span>
    </span>
  `).join("")}</div>` : "";

  root.innerHTML = `<div class="media-grid">${tileItems.map((m) => `
    <figure class="media-item">
      <button type="button" class="media-btn" data-src="${esc(m.path)}" data-caption="${esc(m.caption)}">
        <span class="media-thumb">
          <img src="${esc(m.path)}" alt="${esc(m.alt)}" loading="lazy" width="${m.width || 480}" height="${m.height || 300}">
        </span>
      </button>
      <figcaption><span class="media-type-badge">${esc(normalizeType(m) || "proof")}</span>${esc(m.caption)}</figcaption>
    </figure>
  `).join("")}</div>${toolMarksHtml}`;

  const lightbox = ensureLightbox();
  root.querySelectorAll(".media-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = lightbox.querySelector("img");
      const cap = lightbox.querySelector("p");
      img.src = btn.getAttribute("data-src") || "";
      img.alt = btn.getAttribute("data-caption") || "Proof artifact";
      cap.textContent = btn.getAttribute("data-caption") || "";
      lightbox.classList.add("open");
    });
  });
}

export async function initMediaGalleries(preloadedItems) {
  const roots = Array.from(document.querySelectorAll("[data-media-gallery]"));
  if (!roots.length) return;
  let items = normalizeSafeItems(preloadedItems);
  if (!items.length && typeof window.fetchJsonWithTimeout === "function") {
    const payload = await window.fetchJsonWithTimeout("/assets/data/media.json", { timeoutMs: 1500 });
    items = normalizeSafeItems(payload && payload.media);
  }
  roots.forEach((root) => renderMediaGallery(root, items));
}
