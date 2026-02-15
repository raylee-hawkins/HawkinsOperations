#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = process.cwd();
const legacyConfig = path.join(root, "net" + "lify.toml");
const token = ("net" + "lify").toLowerCase();

const textExt = new Set([
  ".md",
  ".txt",
  ".html",
  ".css",
  ".js",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".ps1",
  ".sh",
  ".gitignore",
  ".node-version",
  ".nvmrc"
]);

const historicalAllowPrefixes = [
  path.join("PROOF_PACK", "hosting_transfer_cloudflare", "run_")
];
const selfAllowFiles = new Set([
  path.join("scripts", "verify", "no-netlify.js").replaceAll("\\", "/"),
  path.join("scripts", "verify", "README.md").replaceAll("\\", "/")
]);

function isHistoricalAllowed(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  return historicalAllowPrefixes.some((prefix) =>
    normalized.startsWith(prefix.replaceAll("\\", "/"))
  );
}

function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".claude" || entry.name === ".codex") continue;
      walkFiles(full, out);
      continue;
    }
    out.push(path.relative(root, full).replaceAll("\\", "/"));
  }
}

function sanitizeAllowedSelfReferences(content) {
  return content
    .replaceAll("scripts/verify/no-netlify.js", "scripts/verify/no-hosting-check.js")
    .replaceAll(".\\scripts\\verify\\no-netlify.js", ".\\scripts\\verify\\no-hosting-check.js");
}

if (fs.existsSync(legacyConfig)) {
  console.error("Forbidden deploy config exists: net*lify.toml");
  process.exit(1);
}

let tracked = [];
{
  const probe = cp.spawnSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (probe.status !== 0 || !probe.stdout) {
    walkFiles(root, tracked);
  } else {
    tracked = String(probe.stdout).split("\0").filter(Boolean);
  }
}

const violations = [];
for (const relTracked of tracked) {
  const file = path.join(root, relTracked);
  const ext = path.extname(relTracked).toLowerCase();
  if (!textExt.has(ext) && path.basename(file) !== ".gitignore") continue;

  const relNorm = relTracked.replaceAll("\\", "/");
  if (selfAllowFiles.has(relNorm)) continue;
  if (isHistoricalAllowed(relTracked)) continue;

  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const checkContent = sanitizeAllowedSelfReferences(content).toLowerCase();
  if (checkContent.includes(token)) {
    violations.push(relTracked);
  }
}

if (violations.length) {
  console.error("Forbidden legacy hosting marker found in:");
  violations.forEach((v) => console.error(` - ${v}`));
  process.exit(1);
}

console.log("Cloudflare-only consistency check passed.");
