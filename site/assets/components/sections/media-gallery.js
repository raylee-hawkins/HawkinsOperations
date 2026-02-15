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

function renderGallery(root, items) {
  const tags = (root.getAttribute("data-tags") || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const limit = Number(root.getAttribute("data-limit") || "6");
  const selected = items.filter((m) => hasTag(m, tags)).slice(0, limit);
  if (!selected.length) {
    root.innerHTML = '<p class="lupd">No safe media assets matched this gallery yet.</p>';
    return;
  }
  root.innerHTML = `<div class="media-grid">${selected.map((m) => `
    <figure class="media-item">
      <button type="button" class="media-btn" data-src="${esc(m.path)}" data-caption="${esc(m.caption)}">
        <img src="${esc(m.path)}" alt="${esc(m.alt)}" loading="lazy" width="${m.width || 480}" height="${m.height || 320}">
      </button>
      <figcaption>${esc(m.caption)}</figcaption>
    </figure>
  `).join("")}</div>`;

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

export async function initMediaGalleries() {
  const roots = Array.from(document.querySelectorAll("[data-media-gallery]"));
  if (!roots.length) return;
  const res = await fetch("assets/data/media.json", { cache: "no-store" });
  if (!res.ok) return;
  const payload = await res.json();
  const items = Array.isArray(payload.media) ? payload.media : [];
  roots.forEach((root) => renderGallery(root, items));
}
