#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const contentOut = path.join(root, "content", "media.json");
const siteMediaDir = path.join(root, "site", "assets", "media");
const siteDataOut = path.join(root, "site", "assets", "data", "media.json");
const reportOut = path.join(root, "docs", "ui", "MEDIA_TRIAGE_REPORT.md");

const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);
const skipDirs = new Set([
  ".git",
  ".claude",
  ".codex",
  "node_modules",
  "site/assets/media"
]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (!skipDirs.has(rel) && !skipDirs.has(entry.name)) walk(full, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (exts.has(ext)) out.push(full);
  }
}

function readUInt32BE(buf, offset) {
  return (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3];
}

function readUInt16BE(buf, offset) {
  return (buf[offset] << 8) | buf[offset + 1];
}

function pngSize(buf) {
  if (buf.length < 24) return { width: 0, height: 0 };
  return { width: readUInt32BE(buf, 16), height: readUInt32BE(buf, 20) };
}

function gifSize(buf) {
  if (buf.length < 10) return { width: 0, height: 0 };
  return { width: buf[6] | (buf[7] << 8), height: buf[8] | (buf[9] << 8) };
}

function jpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    const size = readUInt16BE(buf, i + 2);
    if (size < 2) break;
    if (
      marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3 ||
      marker === 0xc5 || marker === 0xc6 || marker === 0xc7 ||
      marker === 0xc9 || marker === 0xca || marker === 0xcb ||
      marker === 0xcd || marker === 0xce || marker === 0xcf
    ) {
      return { height: readUInt16BE(buf, i + 5), width: readUInt16BE(buf, i + 7) };
    }
    i += size + 2;
  }
  return { width: 0, height: 0 };
}

function webpSize(buf) {
  if (buf.length < 30) return { width: 0, height: 0 };
  const tag = buf.toString("ascii", 12, 16);
  if (tag === "VP8X") {
    const w = 1 + buf.readUIntLE(24, 3);
    const h = 1 + buf.readUIntLE(27, 3);
    return { width: w, height: h };
  }
  if (tag === "VP8 ") {
    return { width: readUInt16BE(buf, 26), height: readUInt16BE(buf, 28) };
  }
  if (tag === "VP8L") {
    const b0 = buf[21];
    const b1 = buf[22];
    const b2 = buf[23];
    const b3 = buf[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  return { width: 0, height: 0 };
}

function svgSize(text) {
  const w = text.match(/\bwidth=["']?([0-9.]+)/i);
  const h = text.match(/\bheight=["']?([0-9.]+)/i);
  if (w && h) return { width: Math.round(Number(w[1])), height: Math.round(Number(h[1])) };
  const vb = text.match(/\bviewBox=["']?([0-9.\s-]+)/i);
  if (vb) {
    const parts = vb[1].trim().split(/\s+/);
    if (parts.length === 4) return { width: Math.round(Number(parts[2])), height: Math.round(Number(parts[3])) };
  }
  return { width: 0, height: 0 };
}

function imageMeta(file) {
  const ext = path.extname(file).toLowerCase();
  const bytes = fs.statSync(file).size;
  if (ext === ".svg") {
    const text = fs.readFileSync(file, "utf8");
    const s = svgSize(text);
    return { ...s, bytes };
  }
  const buf = fs.readFileSync(file);
  if (ext === ".png") return { ...pngSize(buf), bytes };
  if (ext === ".gif") return { ...gifSize(buf), bytes };
  if (ext === ".jpg" || ext === ".jpeg") return { ...jpegSize(buf), bytes };
  if (ext === ".webp") return { ...webpSize(buf), bytes };
  return { width: 0, height: 0, bytes };
}

function inferType(rel) {
  const l = rel.toLowerCase();
  if (l.includes("logo") || l.includes("favicon") || l.includes("badge")) return "logo";
  if (l.includes("flow") || l.includes("diagram")) return "diagram";
  if (l.includes("table")) return "table";
  if (l.includes("dashboard")) return "dashboard";
  return "screenshot";
}

function inferTags(rel) {
  const tags = [];
  const l = rel.toLowerCase();
  const map = ["wazuh", "sigma", "splunk", "proof", "security", "triage", "resume", "lab", "dashboard", "incident", "detection"];
  map.forEach((tag) => {
    if (l.includes(tag)) tags.push(tag);
  });
  if (!tags.includes("proof")) tags.push("proof");
  return Array.from(new Set(tags));
}

function privacyReview(rel) {
  const l = rel.toLowerCase();
  const riskyPath = l.includes("incident-response/incidents") || l.includes("resume") || l.includes("export") || l.includes("proof_pack/features");
  const riskyName = /(token|secret|key|email|host|ip|personal|profile|agent|full)/i.test(l);
  return (riskyPath || riskyName) ? "required" : "ok";
}

function toId(rel) {
  return rel
    .toLowerCase()
    .replaceAll("\\", "/")
    .replace(/[^a-z0-9/._-]+/g, "-")
    .replaceAll("/", "-")
    .replace(/\.[a-z0-9]+$/, "")
    .slice(0, 80);
}

function captionFromName(file) {
  return path.basename(file).replace(/\.[a-z0-9]+$/i, "").replaceAll("_", " ").replaceAll("-", " ");
}

function placement(type, tags) {
  if (tags.includes("dashboard") || tags.includes("detection")) return "security page proof gallery";
  if (tags.includes("lab") || tags.includes("triage")) return "projects page gallery";
  if (type === "logo") return "global identity strip";
  return "home proof strip";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, payload) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

const files = [];
walk(root, files);

const entries = files.map((file) => {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const ext = path.extname(file).toLowerCase();
  const meta = imageMeta(file);
  const tags = inferTags(rel);
  const type = inferType(rel);
  const review = privacyReview(rel);
  return {
    id: toId(rel),
    path: review === "ok" ? `assets/media/${toId(rel)}${ext}` : rel,
    type,
    tags,
    caption: captionFromName(rel),
    alt: `${type} artifact: ${captionFromName(rel)}`,
    privacy_review: review,
    source: rel,
    width: meta.width || 0,
    height: meta.height || 0,
    bytes: meta.bytes || 0,
    suggested_placement: placement(type, tags)
  };
});

const safe = entries.filter((e) => e.privacy_review === "ok");
const needs = entries.filter((e) => e.privacy_review === "required");

ensureDir(siteMediaDir);
safe.forEach((e) => {
  const src = path.join(root, e.source);
  const dest = path.join(root, "site", e.path);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
});

const contentPayload = {
  generated_on: new Date().toISOString().slice(0, 10),
  total_assets: entries.length,
  safe_assets: safe.length,
  review_required_assets: needs.length,
  media: entries
};

const sitePayload = {
  generated_on: contentPayload.generated_on,
  media: safe
};

writeJson(contentOut, contentPayload);
writeJson(siteDataOut, sitePayload);

function topList(items, n = 10) {
  return items
    .slice()
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, n);
}

const safeTop = topList(safe, 10);
const needsTop = topList(needs, 10);

const report = [
  "# MEDIA TRIAGE REPORT",
  "",
  `Generated: \`${contentPayload.generated_on}\``,
  "",
  `- Total discovered assets: **${entries.length}**`,
  `- Safe to publish: **${safe.length}**`,
  `- Needs privacy review: **${needs.length}**`,
  "",
  "## Top 10 safe to publish",
  "",
  "| id | source | type | tags | size | suggested placement |",
  "|---|---|---|---|---:|---|",
  ...safeTop.map((e) => `| \`${e.id}\` | \`${e.source}\` | ${e.type} | ${e.tags.join(", ")} | ${e.bytes} | ${e.suggested_placement} |`),
  "",
  "## Top 10 needs review",
  "",
  "| id | source | reason | tags | size | suggested placement |",
  "|---|---|---|---|---:|---|",
  ...needsTop.map((e) => `| \`${e.id}\` | \`${e.source}\` | privacy_review=required | ${e.tags.join(", ")} | ${e.bytes} | ${e.suggested_placement} |`),
  "",
  "## Placement suggestions",
  "",
  "- Home: use 3-6 safe assets tagged `proof` / `security`.",
  "- Projects: prefer `lab`, `triage`, `diagram` safe assets.",
  "- Security: prefer `dashboard`, `detection`, `table` safe assets.",
  "",
  "## Performance notes",
  "",
  "- Prefer `svg` and `webp` where possible.",
  "- Keep gallery image weights small and use `loading=\"lazy\"`.",
  "- Review oversized assets before publishing.",
  ""
].join("\n");

ensureDir(path.dirname(reportOut));
fs.writeFileSync(reportOut, report, "utf8");

console.log(`Generated ${path.relative(root, contentOut)}`);
console.log(`Generated ${path.relative(root, siteDataOut)}`);
console.log(`Generated ${path.relative(root, reportOut)}`);
