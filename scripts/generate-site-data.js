#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const metricsPath = path.join(root, "data", "metrics.json");
const canonicalOutPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
const siteCountsJsOutPath = path.join(root, "site", "data", "counts.js");
const siteOpsJsonOutPath = path.join(root, "site", "assets", "data", "ops-metrics.json");
const siteOpsJsOutPath = path.join(root, "site", "data", "ops-metrics.js");
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

function toMmDdYyyy(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${mm}-${dd}-${yyyy}`;
}

function parseMetricsJson(rawJson) {
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid data/metrics.json payload");
  }
  const runningTotals = parsed.running_totals;
  const detectionInventory = parsed.detection_inventory;
  if (!runningTotals || typeof runningTotals !== "object") {
    throw new Error("Missing running_totals object in data/metrics.json");
  }
  if (!detectionInventory || typeof detectionInventory !== "object") {
    throw new Error("Missing detection_inventory object in data/metrics.json");
  }

  const requiredNumericTotals = [
    "total_cases",
    "auto_closed_benign",
    "known_fp",
    "escalated",
    "review",
    "staged_pending"
  ];
  for (const key of requiredNumericTotals) {
    if (!Number.isFinite(runningTotals[key])) {
      throw new Error(`Missing or invalid numeric total '${key}' in data/metrics.json`);
    }
  }

  const requiredInventoryKeys = ["sigma", "wazuh_files", "wazuh_rule_blocks", "splunk", "ir_playbooks"];
  for (const key of requiredInventoryKeys) {
    if (!Number.isFinite(detectionInventory[key])) {
      throw new Error(`Missing or invalid detection inventory '${key}' in data/metrics.json`);
    }
  }

  const autoCloseCount = Number(runningTotals.auto_closed_benign) + Number(runningTotals.known_fp);
  const totalCases = Number(runningTotals.total_cases);
  const autoCloseRate = totalCases > 0 ? `${((autoCloseCount / totalCases) * 100).toFixed(2)}%` : "0.00%";

  return {
    generated_at_utc: parsed.last_updated,
    source_note: "Canonical SignalFoundry metrics generated from data/metrics.json.",
    metrics: {
      total_cases: totalCases,
      auto_close_rate: autoCloseRate,
      escalated: Number(runningTotals.escalated),
      review: Number(runningTotals.review),
      staged_pending: Number(runningTotals.staged_pending),
      known_fp: Number(runningTotals.known_fp),
      auto_closed_benign: Number(runningTotals.auto_closed_benign),
      reconciliation: Number(parsed.reconciliation_mismatch) === 0 ? "PASS" : "FAIL",
      reconciliation_mismatch: Number(parsed.reconciliation_mismatch),
      heartbeat: parsed.heartbeat,
      coverage_ratio: parsed.host_coverage,
      coverage_status: String(parsed.host_coverage).trim() === "8/8" ? "PASS" : "FAIL",
      last_updated: toMmDdYyyy(parsed.last_updated),
      sigma: Number(detectionInventory.sigma),
      splunk: Number(detectionInventory.splunk),
      wazuh: Number(detectionInventory.wazuh_rule_blocks),
      ir: Number(detectionInventory.ir_playbooks)
    }
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

function writeSiteOpsMetrics(payload) {
  fs.mkdirSync(path.dirname(siteOpsJsonOutPath), { recursive: true });
  fs.mkdirSync(path.dirname(siteOpsJsOutPath), { recursive: true });
  fs.writeFileSync(siteOpsJsonOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(siteOpsJsOutPath, `window.HAWKINSOPS_OPS_METRICS = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
}

if (!fs.existsSync(srcPath)) {
  console.error(`Missing source file: ${srcPath}`);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, "utf8");
const parsed = parseVerifiedCountsJson(src);
if (!fs.existsSync(metricsPath)) {
  console.error(`Missing metrics source file: ${metricsPath}`);
  process.exit(1);
}
const metricsRaw = fs.readFileSync(metricsPath, "utf8");
const metricsPayload = parseMetricsJson(metricsRaw);

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
writeSiteOpsMetrics(metricsPayload);

if (withProofPack) {
  fs.writeFileSync(canonicalOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(root, canonicalOutPath)}`);
}
console.log(`Generated ${path.relative(root, siteOutPath)}`);
console.log(`Generated ${path.relative(root, siteCountsJsOutPath)}`);
console.log(`Generated ${path.relative(root, siteOpsJsonOutPath)}`);
console.log(`Generated ${path.relative(root, siteOpsJsOutPath)}`);
console.log(`Synced ${path.relative(root, detectionsDataPath)}`);
