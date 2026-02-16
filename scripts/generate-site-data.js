#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "VERIFIED_COUNTS.md");
const outPath = path.join(root, "site", "assets", "verified-counts.json");

function readCount(label, text) {
  const re = new RegExp(`\\*\\*${label}\\*\\*[^\\n]*\\|\\s*\\*\\*(\\d+)\\*\\*`, "i");
  const m = text.match(re);
  return m ? Number(m[1]) : null;
}

function readWazuhBlocks(text) {
  const m = text.match(/\|\s*\*\*Wazuh\*\*[\s\S]*?\*\*(\d+)\*\*\s+rule blocks/i);
  return m ? Number(m[1]) : null;
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

if (!fs.existsSync(srcPath)) {
  console.error(`Missing source file: ${srcPath}`);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, "utf8");
const sigma = readCount("Sigma", src);
const splunk = readCount("Splunk", src);
const ir = readCount("IR Playbooks", src);
const wazuh = readWazuhBlocks(src);

if ([sigma, splunk, wazuh, ir].some(v => typeof v !== "number")) {
  console.error("Could not parse one or more counts from VERIFIED_COUNTS.md");
  process.exit(1);
}

const payload = {
  verified_on: todayIso(),
  counts: {
    detections: sigma + splunk + wazuh,
    sigma,
    splunk,
    wazuh,
    ir
  },
  source_path: "PROOF_PACK/VERIFIED_COUNTS.md",
  source_url: "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/PROOF_PACK/VERIFIED_COUNTS.md"
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Generated ${path.relative(root, outPath)}`);
