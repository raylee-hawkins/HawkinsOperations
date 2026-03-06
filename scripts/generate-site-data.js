#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const canonicalOutPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
const siteCountsJsOutPath = path.join(root, "site", "data", "counts.js");
const detectionsDataPath = path.join(root, "site", "assets", "data", "detections.json");
const withProofPack = process.argv.includes("--with-proof-pack");

function parseVerifiedCountsJson(rawJson) {
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== "object" || !parsed.counts || typeof parsed.counts !== "object") {
    throw new Error("Missing counts object in PROOF_PACK/verified_counts.json");
  }

  const requiredKeys = ["sigma", "splunk", "wazuh_xml_files", "wazuh", "ir", "detections"];
  for (const key of requiredKeys) {
    if (!Number.isFinite(parsed.counts[key])) {
      throw new Error(`Missing or invalid numeric count '${key}' in PROOF_PACK/verified_counts.json`);
    }
  }

  const counts = {
    sigma: Number(parsed.counts.sigma),
    splunk: Number(parsed.counts.splunk),
    wazuh_xml_files: Number(parsed.counts.wazuh_xml_files),
    wazuh: Number(parsed.counts.wazuh),
    ir: Number(parsed.counts.ir),
    detections: Number(parsed.counts.detections)
  };

  return {
    source_path: "PROOF_PACK/verified_counts.json",
    generated_at_utc: parsed.generated_at_utc || new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    counts,
    source_refs: parsed.source_refs && typeof parsed.source_refs === "object" ? parsed.source_refs : {}
  };
}

function writeSiteCountsJs(payload) {
  const countsPayload = {
    generated_at_utc: payload.generated_at_utc,
    source_path: payload.source_path,
    last_verified_utc: payload.generated_at_utc,
    counts: payload.counts,
    detections: payload.counts.detections,
    sigma: payload.counts.sigma,
    wazuh: payload.counts.wazuh,
    splunk: payload.counts.splunk,
    playbooks: payload.counts.ir,
    ir: payload.counts.ir,
    wazuh_xml_files: payload.counts.wazuh_xml_files
  };
  const js = `window.HAWKINSOPS_COUNTS = ${JSON.stringify(countsPayload, null, 2)};\n`;
  fs.mkdirSync(path.dirname(siteCountsJsOutPath), { recursive: true });
  fs.writeFileSync(siteCountsJsOutPath, js, "utf8");
}

function syncDetectionsData(counts) {
  if (!fs.existsSync(detectionsDataPath)) return;
  const raw = fs.readFileSync(detectionsDataPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.detections)) return;

  const map = {
    sigma: counts.sigma,
    wazuh: counts.wazuh,
    splunk: counts.splunk,
    "ir-playbooks": counts.ir
  };

  let changed = false;
  parsed.detections.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const next = map[entry.id];
    if (typeof next === "number" && entry.count !== next) {
      entry.count = next;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(detectionsDataPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  }
}

if (!fs.existsSync(srcPath)) {
  console.error(`Missing source file: ${srcPath}`);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, "utf8");
const parsed = parseVerifiedCountsJson(src);

const payload = {
  generated_at_utc: parsed.generated_at_utc,
  source_path: "PROOF_PACK/verified_counts.json",
  counts: parsed.counts,
  source_refs: parsed.source_refs
};

fs.mkdirSync(path.dirname(canonicalOutPath), { recursive: true });
fs.mkdirSync(path.dirname(siteOutPath), { recursive: true });
fs.writeFileSync(siteOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
writeSiteCountsJs(payload);
syncDetectionsData(parsed.counts);

if (withProofPack) {
  fs.writeFileSync(canonicalOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(root, canonicalOutPath)}`);
}
console.log(`Generated ${path.relative(root, siteOutPath)}`);
console.log(`Generated ${path.relative(root, siteCountsJsOutPath)}`);
console.log(`Synced ${path.relative(root, detectionsDataPath)}`);
