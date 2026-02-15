#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const sourceDir = path.join(root, "content");
const outDir = path.join(root, "site", "assets", "data");

const files = ["projects.json", "detections.json"];

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function validateProjects(payload) {
  if (!payload || !Array.isArray(payload.projects)) fail("content/projects.json must contain a projects array.");
  payload.projects.forEach((p, i) => {
    const at = `projects[${i}]`;
    if (!p.id || !p.title || !p.summary) fail(`${at} is missing required id/title/summary.`);
    if (!Array.isArray(p.tags)) fail(`${at}.tags must be an array.`);
    if (!Array.isArray(p.evidence) || p.evidence.length === 0) fail(`${at}.evidence must include at least one link.`);
  });
}

function validateDetections(payload) {
  if (!payload || !Array.isArray(payload.detections)) fail("content/detections.json must contain a detections array.");
  payload.detections.forEach((d, i) => {
    const at = `detections[${i}]`;
    if (!d.id || !d.platform || typeof d.count !== "number" || !d.location) {
      fail(`${at} is missing required id/platform/count/location.`);
    }
    if (!Array.isArray(d.tags)) fail(`${at}.tags must be an array.`);
    if (!Array.isArray(d.evidence) || d.evidence.length === 0) fail(`${at}.evidence must include at least one link.`);
  });
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Missing content directory: ${sourceDir}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

files.forEach((name) => {
  const src = path.join(sourceDir, name);
  const dest = path.join(outDir, name);
  if (!fs.existsSync(src)) {
    console.error(`Missing source file: ${src}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(src, "utf8");
  const parsed = JSON.parse(raw);
  if (name === "projects.json") validateProjects(parsed);
  if (name === "detections.json") validateDetections(parsed);
  fs.writeFileSync(dest, raw.trimEnd() + "\n", "utf8");
  console.log(`Generated ${path.relative(root, dest)}`);
});
