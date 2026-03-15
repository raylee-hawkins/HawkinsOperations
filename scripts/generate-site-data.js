#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const canonicalOutPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
const siteCountsJsOutPath = path.join(root, "site", "data", "counts.js");
const autosocMetricsPath = path.join(root, "content", "metrics", "autosoc_latest.json");
const siteOpsMetricsJsonOutPath = path.join(root, "site", "assets", "data", "ops-metrics.json");
const siteOpsMetricsJsOutPath = path.join(root, "site", "data", "ops-metrics.js");
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

  const sourceRefs = parsed.source_refs && typeof parsed.source_refs === "object"
    ? Object.fromEntries(
        Object.entries(parsed.source_refs).map(([key, value]) => [
          key,
          value && typeof value === "object"
            ? { ...value, file: "proof/verified-counts.md" }
            : value
        ])
      )
    : {};

  return {
    source_path: "proof/verified-counts.md",
    generated_at_utc: parsed.generated_at_utc || new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    counts,
    source_refs: sourceRefs
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

function parseAutosocMetricsJson(rawJson) {
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("content/metrics/autosoc_latest.json must contain an object payload");
  }

  const requiredFields = [
    "generated_at_utc",
    "source_note",
    "metrics"
  ];
  for (const key of requiredFields) {
    if (!(key in parsed)) {
      throw new Error(`Missing required key '${key}' in content/metrics/autosoc_latest.json`);
    }
  }

  const metrics = parsed.metrics;
  if (!metrics || typeof metrics !== "object") {
    throw new Error("content/metrics/autosoc_latest.json is missing a metrics object");
  }

  const requiredMetricKeys = [
    "total_cases_processed",
    "auto_close_rate",
    "case_directories",
    "auto_closed_benign",
    "auto_closed_known_fp",
    "escalated",
    "published_escalations",
    "reconciliation",
    "coverage_ratio",
    "coverage_status",
    "heartbeat_status",
    "freshness_status"
  ];
  for (const key of requiredMetricKeys) {
    if (!(key in metrics)) {
      throw new Error(`Missing required metric '${key}' in content/metrics/autosoc_latest.json`);
    }
  }

  return parsed;
}

function writeSiteOpsMetricsJs(payload) {
  const js = `window.HAWKINSOPS_OPS_METRICS = ${JSON.stringify(payload, null, 2)};\n`;
  fs.mkdirSync(path.dirname(siteOpsMetricsJsOutPath), { recursive: true });
  fs.writeFileSync(siteOpsMetricsJsOutPath, js, "utf8");
}

function writeSiteOpsMetricsJson(payload) {
  fs.mkdirSync(path.dirname(siteOpsMetricsJsonOutPath), { recursive: true });
  fs.writeFileSync(siteOpsMetricsJsonOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
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

if (!fs.existsSync(autosocMetricsPath)) {
  console.error(`Missing source file: ${autosocMetricsPath}`);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, "utf8");
const parsed = parseVerifiedCountsJson(src);

const payload = {
  generated_at_utc: parsed.generated_at_utc,
  source_path: "proof/verified-counts.md",
  counts: parsed.counts,
  source_refs: parsed.source_refs
};

fs.mkdirSync(path.dirname(canonicalOutPath), { recursive: true });
fs.mkdirSync(path.dirname(siteOutPath), { recursive: true });
fs.writeFileSync(siteOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
writeSiteCountsJs(payload);
syncDetectionsData(parsed.counts);

const autosocRaw = fs.readFileSync(autosocMetricsPath, "utf8");
const autosocPayload = parseAutosocMetricsJson(autosocRaw);
writeSiteOpsMetricsJson(autosocPayload);
writeSiteOpsMetricsJs(autosocPayload);

if (withProofPack) {
  fs.writeFileSync(canonicalOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(root, canonicalOutPath)}`);
}
console.log(`Generated ${path.relative(root, siteOutPath)}`);
console.log(`Generated ${path.relative(root, siteCountsJsOutPath)}`);
console.log(`Generated ${path.relative(root, siteOpsMetricsJsonOutPath)}`);
console.log(`Generated ${path.relative(root, siteOpsMetricsJsOutPath)}`);
console.log(`Synced ${path.relative(root, detectionsDataPath)}`);
