#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = process.cwd();
const requiredFiles = [
  path.join("site", "_headers"),
  path.join("site", "_redirects"),
  path.join("site", "404.html")
];

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

const missing = requiredFiles.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  console.error("Cloudflare Pages consistency check failed. Missing required files:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const trackedProbe = cp.spawnSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

let tracked = [];
if (trackedProbe.status !== 0 || !trackedProbe.stdout) {
  walkFiles(root, tracked);
} else {
  tracked = String(trackedProbe.stdout).split("\0").filter(Boolean);
}

if (!tracked.some((entry) => entry.replaceAll("\\", "/") === "site/assets/Raylee_Hawkins_Resume.pdf")) {
  console.error("Cloudflare Pages consistency check failed. Missing tracked resume PDF at site/assets/Raylee_Hawkins_Resume.pdf");
  process.exit(1);
}

console.log("Cloudflare-only hosting consistency check passed.");
