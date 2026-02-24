#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

const targetPages = [
  path.join("site", "index.html"),
  path.join("site", "proof.html"),
  path.join("site", "security.html")
];

const includeDefs = {
  nav: path.join("site", "partials", "nav.html"),
  footer: path.join("site", "partials", "footer.html")
};

const routesPath = path.join("scripts", "config", "routes.json");

function fail(msg) {
  console.error(`include-build error: ${msg}`);
  process.exit(1);
}

function readUtf8(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) fail(`missing required file: ${relPath}`);
  return fs.readFileSync(full, "utf8");
}

function detectNewline(raw) {
  return raw.includes("\r\n") ? "\r\n" : "\n";
}

function normalize(raw) {
  return raw.replace(/\r\n/g, "\n");
}

function markerRegex(name, kind) {
  return new RegExp(`<!--\\s*@include:${name}:${kind}\\s*-->`, "g");
}

function findBlock(html, name, relPath) {
  const startMatches = [...html.matchAll(markerRegex(name, "start"))];
  const endMatches = [...html.matchAll(markerRegex(name, "end"))];

  if (startMatches.length !== 1 || endMatches.length !== 1) {
    fail(
      `${relPath} must contain exactly one include marker pair for "${name}" ` +
      `(found starts=${startMatches.length}, ends=${endMatches.length})`
    );
  }

  const startIndex = startMatches[0].index;
  const endIndex = endMatches[0].index;
  if (startIndex > endIndex) {
    fail(`${relPath} has invalid marker order for "${name}"`);
  }

  const startText = startMatches[0][0];
  const endText = endMatches[0][0];
  const contentStart = startIndex + startText.length;
  const content = html.slice(contentStart, endIndex);

  if (/<!--\s*@include:[a-z-]+:(start|end)\s*-->/.test(content)) {
    fail(`${relPath} include block "${name}" cannot contain nested include markers`);
  }

  return {
    startIndex,
    endIndex,
    startText,
    endText,
    contentStart
  };
}

function replaceBlock(html, block, replacement) {
  return html.slice(0, block.contentStart) + "\n" + replacement + "\n" + html.slice(block.endIndex);
}

function parseRoutes() {
  const parsed = JSON.parse(readUtf8(routesPath));
  if (!parsed || !Array.isArray(parsed.navItems) || !parsed.cta) {
    fail(`${routesPath} must contain navItems[] and cta`);
  }
  if (parsed.navItems.length === 0) fail(`${routesPath} navItems must not be empty`);
  parsed.navItems.forEach((item, idx) => {
    if (!item || !item.label || !item.href) {
      fail(`${routesPath} navItems[${idx}] is missing label/href`);
    }
  });
  if (!parsed.cta.label || !parsed.cta.href) {
    fail(`${routesPath} cta is missing label/href`);
  }
  return parsed;
}

function renderNav(routes) {
  const navTemplate = normalize(readUtf8(includeDefs.nav));
  const desktopItems = routes.navItems.map((item) => `      <li><a href="${item.href}">${item.label}</a></li>`).join("\n");
  const mobileItems = routes.navItems.map((item) => `  <a href="${item.href}">${item.label}</a>`).join("\n");

  return navTemplate
    .replace("{{DESKTOP_NAV_ITEMS}}", desktopItems)
    .replace("{{MOBILE_NAV_ITEMS}}", mobileItems)
    .replaceAll("{{CTA_HREF}}", routes.cta.href)
    .replaceAll("{{CTA_LABEL}}", routes.cta.label);
}

function renderFooter() {
  return normalize(readUtf8(includeDefs.footer));
}

const routes = parseRoutes();
const includes = {
  nav: renderNav(routes),
  footer: renderFooter()
};

const changedFiles = [];

targetPages.forEach((relPath) => {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) fail(`target page not found: ${relPath}`);

  const raw = fs.readFileSync(full, "utf8");
  const newline = detectNewline(raw);
  let html = normalize(raw);

  const navBlock = findBlock(html, "nav", relPath);
  html = replaceBlock(html, navBlock, includes.nav);

  const footerBlock = findBlock(html, "footer", relPath);
  html = replaceBlock(html, footerBlock, includes.footer);

  const next = html.replace(/\n/g, newline);
  if (next !== raw) {
    changedFiles.push(relPath);
    if (!checkOnly) {
      fs.writeFileSync(full, next, "utf8");
    }
  }
});

if (checkOnly) {
  if (changedFiles.length > 0) {
    console.error("include-build check failed. These files are out of date:");
    changedFiles.forEach((item) => console.error(` - ${item}`));
    process.exit(1);
  }
  console.log("include-build check passed.");
  process.exit(0);
}

if (changedFiles.length === 0) {
  console.log("include-build: no changes.");
} else {
  console.log("include-build: updated files:");
  changedFiles.forEach((item) => console.log(` - ${item}`));
}
