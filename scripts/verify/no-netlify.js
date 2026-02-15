#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

const skipDirs = new Set([
  ".git",
  ".claude",
  ".codex",
  "node_modules"
]);

const historicalAllowPrefixes = [
  path.join("PROOF_PACK", "hosting_transfer_cloudflare", "run_")
];
const selfAllowFiles = new Set([
  path.join("scripts", "verify", "no-netlify.js").replaceAll("\\", "/"),
  path.join("scripts", "verify", "README.md").replaceAll("\\", "/")
]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(full, out);
      continue;
    }
    out.push(full);
  }
}

function isHistoricalAllowed(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  return historicalAllowPrefixes.some((prefix) =>
    normalized.startsWith(prefix.replaceAll("\\", "/"))
  );
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

const files = [];
walk(root, files);

const violations = [];
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!textExt.has(ext) && path.basename(file) !== ".gitignore") continue;

  const rel = path.relative(root, file);
  const relNorm = rel.replaceAll("\\", "/");
  if (selfAllowFiles.has(relNorm)) continue;
  if (isHistoricalAllowed(rel)) continue;

  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const checkContent = sanitizeAllowedSelfReferences(content).toLowerCase();
  if (checkContent.includes(token)) {
    violations.push(rel);
  }
}

if (violations.length) {
  console.error("Forbidden legacy hosting marker found in:");
  violations.forEach((v) => console.error(` - ${v}`));
  process.exit(1);
}

console.log("Cloudflare-only consistency check passed.");
