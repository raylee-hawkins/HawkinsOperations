#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "VERIFIED_COUNTS.md");
const canonicalOutPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
const detectionsDataPath = path.join(root, "site", "assets", "data", "detections.json");
const withProofPack = process.argv.includes("--with-proof-pack");

function readMatch(lines, regex) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(regex);
    if (m) return { lineNo: i + 1, match: m };
  }
  return null;
}

function headingForLine(lines, lineNo) {
  let heading = "";
  for (let i = 0; i < lineNo; i += 1) {
    if (lines[i].startsWith("## ")) heading = lines[i].slice(3).trim();
  }
  return heading;
}

function parseVerifiedCountsMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sigmaHit = readMatch(lines, /\|\s*\*\*Sigma\*\*.*\|\s*\*\*(\d+)\*\*\s+rules/i);
  const splunkHit = readMatch(lines, /\|\s*\*\*Splunk\*\*.*\|\s*\*\*(\d+)\*\*\s+queries/i);
  const wazuhHit = readMatch(
    lines,
    /\|\s*\*\*Wazuh\*\*.*\|\s*\*\*(\d+)\*\*\s+files,\s*\*\*(\d+)\*\*\s+rule blocks/i
  );
  const irHit = readMatch(lines, /\|\s*\*\*IR Playbooks\*\*.*\|\s*\*\*(\d+)\*\*\s+playbooks/i);

  if (!sigmaHit || !splunkHit || !wazuhHit || !irHit) {
    throw new Error("Could not parse one or more required count rows from PROOF_PACK/VERIFIED_COUNTS.md");
  }

  const sigma = Number(sigmaHit.match[1]);
  const splunk = Number(splunkHit.match[1]);
  const wazuhXmlFiles = Number(wazuhHit.match[1]);
  const wazuh = Number(wazuhHit.match[2]);
  const ir = Number(irHit.match[1]);
  const detections = sigma + splunk + wazuh;

  const sourceRefs = {
    sigma: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: sigmaHit.lineNo,
      heading: headingForLine(lines, sigmaHit.lineNo)
    },
    splunk: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: splunkHit.lineNo,
      heading: headingForLine(lines, splunkHit.lineNo)
    },
    wazuh_xml_files: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    },
    wazuh: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    },
    ir: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: irHit.lineNo,
      heading: headingForLine(lines, irHit.lineNo)
    },
    detections: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    }
  };

  return {
    counts: {
      sigma,
      splunk,
      wazuh_xml_files: wazuhXmlFiles,
      wazuh,
      ir,
      detections
    },
    source_refs: sourceRefs
  };
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
const parsed = parseVerifiedCountsMarkdown(src);

const payload = {
  generated_at_utc: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  source_path: "PROOF_PACK/VERIFIED_COUNTS.md",
  counts: parsed.counts,
  source_refs: parsed.source_refs
};

fs.mkdirSync(path.dirname(canonicalOutPath), { recursive: true });
fs.mkdirSync(path.dirname(siteOutPath), { recursive: true });
fs.writeFileSync(siteOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
syncDetectionsData(parsed.counts);

if (withProofPack) {
  fs.writeFileSync(canonicalOutPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(root, canonicalOutPath)}`);
}
console.log(`Generated ${path.relative(root, siteOutPath)}`);
console.log(`Synced ${path.relative(root, detectionsDataPath)}`);
