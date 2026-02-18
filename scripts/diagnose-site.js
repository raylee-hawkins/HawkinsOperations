const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const rootDir = process.cwd();
const siteDir = path.join(rootDir, "site");
const docsDir = path.join(rootDir, "docs", "diagnosis");
const markdownOut = path.join(docsDir, "STATIC_SITE_DIAGNOSIS_REPORT.md");
const jsonOut = path.join(docsDir, "STATIC_SITE_DIAGNOSIS_REPORT.json");

const failOnIssues = process.argv.includes("--fail-on-issues");

const CURRENT_GITHUB_OWNER = "raylee-hawkins";
const OLD_OWNER_PATTERNS = ["raylee-hawkins", "raylee_ops", "rayleeops"];
const GENERATED_ARTIFACTS_EXPECTED = [
  "site/assets/verified-counts.json",
  "site/assets/data/detections.json",
  "site/assets/data/media.json",
  "site/assets/data/projects.json"
];
const DIAGNOSTIC_TEXT_EXTENSIONS = new Set([
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
  ".svg",
  ".xml",
  ".csv",
  ".ts",
  ".tsx",
  ".jsx",
  ".mjs",
  ".cjs",
  ".gitignore",
  ".gitattributes"
]);
const DIAGNOSTIC_IGNORE_PREFIXES = ["docs/diagnosis/"];
const DIAGNOSTIC_IGNORE_FILES = new Set(["scripts/diagnose-site.js", "scripts/diagnose-site.ps1"]);

function toPosix(relPath) {
  return relPath.replaceAll("\\", "/");
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function walkFiles(dirPath, out, predicate) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out, predicate);
      continue;
    }
    if (!predicate || predicate(full)) out.push(full);
  }
}

function getLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function indexToLineCol(lineStarts, index) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      if (mid === lineStarts.length - 1 || lineStarts[mid + 1] > index) {
        return { line: mid + 1, col: index - lineStarts[mid] + 1 };
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return { line: 1, col: 1 };
}

function stripQueryHash(urlValue) {
  return String(urlValue || "").split("#")[0].split("?")[0];
}

function classifyUrl(urlValue) {
  const url = String(urlValue || "").trim();
  if (!url) return "empty";
  if (url.startsWith("#")) return "anchor";
  if (/^(mailto:|tel:|javascript:|data:)/i.test(url)) return "special";
  if (/^https?:\/\//i.test(url) || url.startsWith("//")) return "external";
  if (url.startsWith("/")) return "absolute_root";
  return "relative";
}

function isLocalClass(classification) {
  return classification === "absolute_root" || classification === "relative";
}

function parseTagAttributes(tagText) {
  const attrs = {};
  const attrRe = /([:@A-Za-z0-9_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = attrRe.exec(tagText)) !== null) {
    const name = String(match[1] || "").toLowerCase();
    const value = typeof match[3] === "string" ? match[3] : match[4];
    attrs[name] = value;
  }
  return attrs;
}

function parseHtmlFile(filePath) {
  const relPath = toPosix(path.relative(rootDir, filePath));
  const raw = readUtf8(filePath);
  const lineStarts = getLineStarts(raw);
  const refs = [];
  const pageIds = [];
  const idCounts = new Map();

  const tagRe = /<(link|script|img|source)\b[^>]*>/gi;
  let tagMatch;
  while ((tagMatch = tagRe.exec(raw)) !== null) {
    const tagName = String(tagMatch[1] || "").toLowerCase();
    const tagText = tagMatch[0];
    const attrs = parseTagAttributes(tagText);
    const where = indexToLineCol(lineStarts, tagMatch.index);
    const relAttr = String(attrs.rel || "").toLowerCase();
    const isFavicon = tagName === "link" && /\bicon\b/.test(relAttr);

    function pushRef(attrName, value, extra) {
      const classification = classifyUrl(value);
      refs.push({
        page: relPath,
        tag: tagName,
        attr: attrName,
        value,
        classification,
        line: where.line,
        col: where.col,
        isFavicon,
        ...extra
      });
    }

    if (tagName === "link" && typeof attrs.href === "string") {
      pushRef("href", attrs.href, { rel: relAttr || null });
    }

    if ((tagName === "script" || tagName === "img") && typeof attrs.src === "string") {
      pushRef("src", attrs.src, {});
    }

    if (tagName === "source" && typeof attrs.srcset === "string") {
      const srcsetEntries = attrs.srcset
        .split(",")
        .map((part) => String(part || "").trim())
        .filter(Boolean);
      if (srcsetEntries.length === 0) {
        pushRef("srcset", attrs.srcset, { srcsetItem: null });
      } else {
        for (const srcsetEntry of srcsetEntries) {
          const sourceUrl = srcsetEntry.split(/\s+/)[0] || "";
          pushRef("srcset", sourceUrl, { srcsetItem: srcsetEntry });
        }
      }
    }
  }

  const canonicalRe = /<link\b[^>]*\brel\s*=\s*("|\')canonical\1[^>]*\bhref\s*=\s*("|\')([^"\']+)\2[^>]*>/i;
  const canonicalMatch = raw.match(canonicalRe);
  const canonicalHref = canonicalMatch ? canonicalMatch[3] : null;

  const idRe = /\bid\s*=\s*("([^"]+)"|'([^']+)')/gi;
  let idMatch;
  while ((idMatch = idRe.exec(raw)) !== null) {
    const idValue = typeof idMatch[2] === "string" ? idMatch[2] : idMatch[3];
    const where = indexToLineCol(lineStarts, idMatch.index);
    pageIds.push({ id: idValue, line: where.line, col: where.col });
    idCounts.set(idValue, (idCounts.get(idValue) || 0) + 1);
  }

  const duplicateIds = Array.from(idCounts.entries())
    .filter((entry) => entry[1] > 1)
    .map((entry) => entry[0]);

  return {
    relPath,
    absPath: filePath,
    raw,
    lineStarts,
    refs,
    canonicalHref,
    pageIds,
    duplicateIds
  };
}

function pageRouteScenarios(pageRelPath) {
  const siteRel = toPosix(pageRelPath).replace(/^site\//, "");
  const dir = path.posix.dirname(siteRel);
  const base = path.posix.basename(siteRel, ".html");
  const fileRoute = "/" + siteRel;

  if (base === "index") {
    const rootRoute = dir === "." ? "/" : `/${dir}/`;
    return [{ kind: "root_or_index", routePath: rootRoute }];
  }

  const prettyNoSlash = dir === "." ? `/${base}` : `/${dir}/${base}`;
  const prettyWithSlash = `${prettyNoSlash}/`;
  return [
    { kind: "file", routePath: fileRoute },
    { kind: "pretty_no_slash", routePath: prettyNoSlash },
    { kind: "pretty_with_slash", routePath: prettyWithSlash }
  ];
}

function resolveLocalUrlForScenario(localUrl, scenarioRoutePath) {
  const base = `https://diagnostic.local${scenarioRoutePath}`;
  const clean = stripQueryHash(localUrl);
  try {
    return new URL(clean, base).pathname;
  } catch {
    return null;
  }
}

function resolvedPathToFsPath(pathname) {
  if (!pathname) return null;
  const clean = pathname.replace(/^\/+/, "");
  if (!clean) return path.join(siteDir, "index.html");
  return path.join(siteDir, clean.split("/").join(path.sep));
}

function fsPathExists(fsPath) {
  try {
    return fsPath ? fs.existsSync(fsPath) : false;
  } catch {
    return false;
  }
}

function collectHtmlFiles() {
  const files = [];
  walkFiles(siteDir, files, (full) => full.toLowerCase().endsWith(".html"));
  return files.sort((a, b) => toPosix(path.relative(rootDir, a)).localeCompare(toPosix(path.relative(rootDir, b))));
}

function collectJsFilesUnderAssets() {
  const assetsDir = path.join(siteDir, "assets");
  const files = [];
  if (fs.existsSync(assetsDir)) {
    walkFiles(assetsDir, files, (full) => full.toLowerCase().endsWith(".js"));
  }
  return files.sort((a, b) => toPosix(path.relative(rootDir, a)).localeCompare(toPosix(path.relative(rootDir, b))));
}
function extractLocalScriptLoads(pageAnalysis) {
  const scriptLoads = [];
  for (const page of pageAnalysis) {
    for (const ref of page.refs) {
      if (ref.tag !== "script" || ref.attr !== "src") continue;
      if (!isLocalClass(ref.classification)) continue;
      const pageRoute = pageRouteScenarios(page.relPath.replace(/^site\//, ""))[0].routePath;
      const resolved = resolveLocalUrlForScenario(ref.value, pageRoute);
      const fsPath = resolvedPathToFsPath(resolved);
      const relResolved = fsPath ? toPosix(path.relative(rootDir, fsPath)) : null;
      scriptLoads.push({
        page: page.relPath,
        line: ref.line,
        src: ref.value,
        resolvedPathname: resolved,
        resolvedRelPath: relResolved
      });
    }
  }
  return scriptLoads;
}

function mapScriptsToPages(scriptLoads) {
  const map = new Map();
  for (const load of scriptLoads) {
    if (!load.resolvedRelPath) continue;
    if (!map.has(load.resolvedRelPath)) map.set(load.resolvedRelPath, new Set());
    map.get(load.resolvedRelPath).add(load.page);
  }
  return map;
}

function findLiteralFetches(jsRelPath, jsText, lineStarts) {
  const refs = [];
  const fetchRe = /fetch\s*\(\s*("([^"]+)"|'([^']+)'|`([^`]+)`)/g;
  let match;
  while ((match = fetchRe.exec(jsText)) !== null) {
    const value = match[2] || match[3] || match[4] || "";
    const where = indexToLineCol(lineStarts, match.index);
    refs.push({
      kind: "fetch",
      jsFile: jsRelPath,
      url: value,
      classification: classifyUrl(value),
      line: where.line,
      col: where.col
    });
  }

  const xhrOpenRe = /\.open\s*\(\s*("GET"|'GET'|`GET`|"POST"|'POST'|`POST`|"PUT"|'PUT'|`PUT`|"DELETE"|'DELETE'|`DELETE`)\s*,\s*("([^"]+)"|'([^']+)'|`([^`]+)`)/g;
  while ((match = xhrOpenRe.exec(jsText)) !== null) {
    const value = match[4] || match[5] || match[6] || "";
    const where = indexToLineCol(lineStarts, match.index);
    refs.push({
      kind: "xhr_open",
      jsFile: jsRelPath,
      url: value,
      classification: classifyUrl(value),
      line: where.line,
      col: where.col
    });
  }

  const wrapperFetchers = [];
  const fnRe = /function\s+([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)[^)]*\)\s*{([\s\S]*?)\n}/g;
  while ((match = fnRe.exec(jsText)) !== null) {
    const fnName = match[1];
    const paramName = match[2];
    const body = match[3] || "";
    if (new RegExp(`fetch\\s*\\(\\s*${paramName}\\b`).test(body)) {
      wrapperFetchers.push(fnName);
    }
  }

  for (const fnName of wrapperFetchers) {
    const callRe = new RegExp(`\\b${fnName}\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)'|\\\`([^\\\`]+)\\\`)`, "g");
    let callMatch;
    while ((callMatch = callRe.exec(jsText)) !== null) {
      const value = callMatch[2] || callMatch[3] || callMatch[4] || "";
      const where = indexToLineCol(lineStarts, callMatch.index);
      refs.push({
        kind: "fetch_wrapper_call",
        jsFile: jsRelPath,
        url: value,
        classification: classifyUrl(value),
        line: where.line,
        col: where.col,
        wrapperFunction: fnName
      });
    }
  }

  return refs;
}

function inferSelectorGuards(jsText) {
  const lines = jsText.split(/\r?\n/);
  const lineStarts = getLineStarts(jsText);
  const mountDefs = [];
  const assignRe = /(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:document\.)?(getElementById|querySelector)\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
  let match;
  while ((match = assignRe.exec(jsText)) !== null) {
    const varName = match[2];
    const method = match[3];
    const rawSelector = match[5] || match[6] || "";
    const id = method === "getElementById"
      ? rawSelector
      : rawSelector.startsWith("#")
        ? rawSelector.slice(1)
        : null;
    if (!id) continue;

    const where = indexToLineCol(lineStarts, match.index);
    const scanStart = Math.max(0, where.line - 1);
    const scanEnd = Math.min(lines.length - 1, scanStart + 10);
    const lookahead = lines.slice(scanStart, scanEnd + 1).join("\n");
    const guarded =
      new RegExp(`if\\s*\\(\\s*!\\s*${varName}\\s*\\)`, "m").test(lookahead) ||
      new RegExp(`if\\s*\\(\\s*${varName}\\s*\\)`, "m").test(lookahead) ||
      new RegExp(`${varName}\\s*&&`, "m").test(lookahead);

    mountDefs.push({
      id,
      varName,
      method,
      line: where.line,
      col: where.col,
      guarded
    });
  }
  return mountDefs;
}

function findIdSelectors(jsText) {
  const ids = [];
  const lineStarts = getLineStarts(jsText);
  const selectorRe = /(getElementById|querySelector|querySelectorAll)\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
  let match;
  while ((match = selectorRe.exec(jsText)) !== null) {
    const method = match[1];
    const raw = match[3] || match[4] || "";
    let id = null;
    if (method === "getElementById") id = raw;
    else if (raw.startsWith("#")) id = raw.slice(1);
    if (!id) continue;
    const where = indexToLineCol(lineStarts, match.index);
    ids.push({ id, method, line: where.line, col: where.col });
  }
  return ids;
}

function getGitTrackedFiles() {
  const probe = cp.spawnSync("git", ["ls-files", "-z"], {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (probe.status !== 0) {
    const fallback = [];
    walkFiles(rootDir, fallback, (full) => !full.includes(`${path.sep}.git${path.sep}`));
    return fallback.map((full) => toPosix(path.relative(rootDir, full)));
  }
  return String(probe.stdout || "")
    .split("\0")
    .filter(Boolean)
    .map((entry) => toPosix(entry));
}

function isLikelyTextFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (DIAGNOSTIC_TEXT_EXTENSIONS.has(ext)) return true;
  const basename = path.basename(relPath);
  return basename === ".gitignore" || basename === ".gitattributes" || basename === ".node-version";
}

function searchTextHits(pattern, options = {}) {
  const files = options.files || getGitTrackedFiles();
  const regex = typeof pattern === "string" ? new RegExp(pattern, options.flags || "i") : pattern;
  const hits = [];
  for (const relPath of files) {
    const relNorm = toPosix(relPath);
    if (DIAGNOSTIC_IGNORE_FILES.has(relNorm)) continue;
    if (DIAGNOSTIC_IGNORE_PREFIXES.some((prefix) => relNorm.startsWith(prefix))) continue;
    if (!isLikelyTextFile(relPath)) continue;
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) continue;
    let raw;
    try {
      raw = readUtf8(absPath);
    } catch {
      continue;
    }
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      if (regex.test(lines[i])) {
        hits.push({ file: relPath, line: i + 1, text: lines[i] });
      }
      regex.lastIndex = 0;
    }
  }
  return hits;
}

function collectGeneratorScriptEvidence() {
  const scriptDir = path.join(rootDir, "scripts");
  const files = [];
  if (!fs.existsSync(scriptDir)) return [];
  walkFiles(scriptDir, files, (full) => /\.(js|ps1|sh|md)$/i.test(full));
  const evidence = [];
  for (const filePath of files) {
    const rel = toPosix(path.relative(rootDir, filePath));
    const text = readUtf8(filePath);
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      if (/verified-counts\.json|assets\/data\/detections\.json|assets\/data\/media\.json|assets\/data\/projects\.json/i.test(lines[i])) {
        evidence.push({ file: rel, line: i + 1, text: lines[i] });
      }
    }
  }
  return evidence;
}

function collectCloudflareOutputEvidence() {
  const files = [
    "README.md",
    "START_HERE.md",
    "site/README_DEPLOY.md",
    "docs/hosting/CLOUDFLARE_PAGES.md",
    "docs/execution/HOSTING_TRANSFER_PROOF_PACK.md"
  ];
  const evidence = [];
  for (const rel of files) {
    const abs = path.join(rootDir, rel);
    if (!fs.existsSync(abs)) continue;
    const lines = readUtf8(abs).split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      if (/Cloudflare Pages|publish directory|build output directory|site\//i.test(lines[i])) {
        evidence.push({ file: rel, line: i + 1, text: lines[i] });
      }
    }
  }
  return evidence;
}

function inferCanonicalIntent(canonicalKinds) {
  const ordered = [
    ["pretty_no_slash", canonicalKinds.pretty_no_slash],
    ["pretty_with_slash", canonicalKinds.pretty_with_slash],
    ["file", canonicalKinds.file],
    ["root", canonicalKinds.root],
    ["other", canonicalKinds.other]
  ].sort((a, b) => b[1] - a[1]);

  const top = ordered[0];
  if (!top || top[1] === 0) return "unknown";
  if (top[0] === "pretty_no_slash") return "pretty_no_slash";
  if (top[0] === "pretty_with_slash") return "pretty_with_slash";
  if (top[0] === "file") return "file_html";
  return top[0];
}

function dedupeObjects(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
function buildTopRootCauses(input) {
  const causes = [];

  causes.push({
    rank: 1,
    title: "Mixed local asset path strategies + trailing slash route variance",
    whyIntermittent:
      "Relative asset URLs can resolve differently for /page versus /page/, so different canonicalization outcomes produce different asset paths per deploy and cache state.",
    evidence: {
      siteConvention: input.siteConvention,
      homepageAbsoluteInnerRelativePattern: input.homepageAbsoluteInnerRelativePattern,
      trailingHazardCount: input.trailingHazardCount,
      missingAssetCount: input.missingAssetCount
    },
    howToConfirm:
      "In DevTools Network, compare requests for /security and /security/. Look for /security/assets/... 404s versus /assets/... 200s.",
    minimalFix:
      "Standardize local asset references to root-absolute paths (/assets/...) across all HTML pages."
  });

  causes.push({
    rank: 2,
    title: "Fetch URL inconsistency and missing timeout/fallback behavior",
    whyIntermittent:
      "Relative fetch URLs are document-URL dependent and can fail under slash variants; fetches without timeout/fallback can leave permanent loading placeholders.",
    evidence: {
      inconsistentStrategies: input.fetchInconsistentStrategies,
      timeoutRiskFiles: input.fetchTimeoutRiskFiles,
      suspiciousFetches: input.suspiciousFetches.length
    },
    howToConfirm:
      "Use DevTools Network + Console on live pages and force slow/offline mode. Failed JSON requests without UI fallback indicate hanging lanes.",
    minimalFix:
      "Use root-absolute fetch URLs (/assets/data/...) and enforce a 1.5-2.0s timeout with fallback rendering."
  });

  causes.push({
    rank: 3,
    title: "Generated artifacts can drift from deployment inputs",
    whyIntermittent:
      "If generated JSON artifacts are not consistently present (or generated from stale content), deploy output can differ even when source HTML appears unchanged.",
    evidence: { artifacts: input.generatedArtifactPresence },
    howToConfirm:
      "Check Cloudflare build logs for generation script execution and verify deployed files under /assets/data and /assets/verified-counts.json.",
    minimalFix:
      "Guarantee generation step in build command and add CI assertion that required artifacts exist before deploy."
  });

  causes.push({
    rank: 4,
    title: "Edge/browser cache mixing old HTML with newer JS/CSS payloads",
    whyIntermittent:
      "A stale HTML shell can reference outdated script paths or mount contracts while newer assets are cached separately, causing progressive inconsistent behavior.",
    evidence: { cloudflareEvidenceCount: input.cloudflareEvidence.length },
    howToConfirm:
      "Hard refresh + cache-disabled devtools test. Compare response headers and ETags for HTML vs JS assets across affected and unaffected sessions.",
    minimalFix:
      "Set short cache for HTML and immutable cache strategy for fingerprinted assets; purge cache on critical routing/path changes."
  });

  causes.push({
    rank: 5,
    title: "Repository/owner rename leftovers and external raw URL dependencies",
    whyIntermittent:
      "Old owner URLs may redirect unpredictably across mirrors/caches; raw.githubusercontent dependencies are sensitive to owner/repo/path changes.",
    evidence: {
      legacyOwnerHits: input.legacyOwnerHits.length,
      rawGithubHits: input.rawGithubHits.length,
      legacyHostingHits: input.legacyHostingHits.length
    },
    howToConfirm:
      "Search deployed source for raylee-hawkins and raw.githubusercontent.com, then test those links directly for redirects or 404s.",
    minimalFix:
      "Replace old owner references with raylee-hawkins and prefer same-origin packaged assets over raw external URLs."
  });

  return causes;
}

function toRootAbsoluteAssetPath(rawPath) {
  const clean = stripQueryHash(rawPath);
  const suffix = rawPath.slice(clean.length);
  const noDot = clean.replace(/^(\.\/|\.\.\/)+/, "");
  const noLeading = noDot.replace(/^\/+/, "");
  if (noLeading.startsWith("assets/")) return `/${noLeading}${suffix}`;
  return `/${noLeading}${suffix}`;
}

function buildRecommendedPatchSections(input) {
  const htmlRelativeAssetRefs = input.allLocalAssetRefs
    .filter((ref) => ref.classification === "relative")
    .filter((ref) => /^(assets\/|\.\/assets\/|\.\.\/assets\/)/i.test(ref.value))
    .map((ref) => ({
      file: ref.page,
      line: ref.line,
      current: ref.value,
      suggested: toRootAbsoluteAssetPath(ref.value)
    }));

  const jsRelativeFetchRefs = input.fetchEntries
    .filter((entry) => entry.classification === "relative")
    .filter((entry) => /(^assets\/|^\.\/assets\/|^\.\.\/assets\/)/i.test(entry.url))
    .map((entry) => ({
      file: entry.jsFile,
      line: entry.line,
      current: entry.url,
      suggested: toRootAbsoluteAssetPath(entry.url)
    }));

  const uniquePrettyPages = Array.from(
    new Set(
      input.trailingHazardsDeduped
        .map((hazard) => {
          const rel = hazard.page.replace(/^site\//, "");
          const name = rel.replace(/\.html$/i, "");
          return name === "index" ? null : name;
        })
        .filter(Boolean)
    )
  ).sort();

  const redirectPatch = uniquePrettyPages.map((name) => `/${name}/ /${name} 301`);

  return {
    htmlAssetPathRewrites: htmlRelativeAssetRefs,
    jsFetchPathRewrites: jsRelativeFetchRefs,
    redirectsCanonicalSuggestions: redirectPatch,
    ciSanityCheckSuggestion: {
      command: "node scripts/diagnose-site.js --fail-on-issues",
      description:
        "Fail CI if relative local asset references, slash-hazard paths, or unresolved local assets are detected."
    }
  };
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell)).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

function formatPathLine(file, line) {
  return `\`${file}:${line}\``;
}

function escapePipes(text) {
  return String(text || "").replaceAll("|", "\\|").trim();
}

function analyze() {
  const nowIso = new Date().toISOString();
  const htmlFiles = collectHtmlFiles();
  const pageAnalysis = htmlFiles.map((filePath) => parseHtmlFile(filePath));

  const pageSummaries = [];
  const localAssetMissing = [];
  const trailingSlashHazards = [];
  const canonicalPatterns = [];
  const allLocalAssetRefs = [];

  for (const page of pageAnalysis) {
    let localAbsoluteCount = 0;
    let localRelativeCount = 0;
    let externalCount = 0;
    let specialCount = 0;
    const localStyles = new Set();

    for (const ref of page.refs) {
      if (!isLocalClass(ref.classification) && ref.classification !== "external" && ref.classification !== "special") continue;
      if (ref.classification === "absolute_root") {
        localAbsoluteCount += 1;
        localStyles.add("absolute_root");
      } else if (ref.classification === "relative") {
        localRelativeCount += 1;
        localStyles.add("relative");
      } else if (ref.classification === "external") {
        externalCount += 1;
      } else if (ref.classification === "special") {
        specialCount += 1;
      }

      if (isLocalClass(ref.classification)) {
        allLocalAssetRefs.push({
          page: page.relPath,
          line: ref.line,
          tag: ref.tag,
          attr: ref.attr,
          value: ref.value,
          classification: ref.classification
        });
      }
    }

    const mixedLocalAssetStrategy = localStyles.size > 1;
    const scenarios = pageRouteScenarios(page.relPath.replace(/^site\//, ""));

    for (const ref of page.refs) {
      if (!isLocalClass(ref.classification)) continue;
      for (const scenario of scenarios) {
        const resolvedPathname = resolveLocalUrlForScenario(ref.value, scenario.routePath);
        const resolvedFsPath = resolvedPathToFsPath(resolvedPathname);
        const exists = fsPathExists(resolvedFsPath);
        if (!exists) {
          localAssetMissing.push({
            page: page.relPath,
            line: ref.line,
            refValue: ref.value,
            refClass: ref.classification,
            scenario: scenario.kind,
            scenarioRoutePath: scenario.routePath,
            resolvedPathname,
            resolvedFile: resolvedFsPath ? toPosix(path.relative(rootDir, resolvedFsPath)) : null
          });
        }
      }

      if (ref.classification === "relative") {
        const noSlash = scenarios.find((s) => s.kind === "pretty_no_slash");
        const withSlash = scenarios.find((s) => s.kind === "pretty_with_slash");
        if (noSlash && withSlash) {
          const pathNoSlash = resolveLocalUrlForScenario(ref.value, noSlash.routePath);
          const pathWithSlash = resolveLocalUrlForScenario(ref.value, withSlash.routePath);
          const existsNoSlash = fsPathExists(resolvedPathToFsPath(pathNoSlash));
          const existsWithSlash = fsPathExists(resolvedPathToFsPath(pathWithSlash));
          if (existsNoSlash && !existsWithSlash) {
            trailingSlashHazards.push({
              page: page.relPath,
              line: ref.line,
              refValue: ref.value,
              noSlashRoute: noSlash.routePath,
              withSlashRoute: withSlash.routePath,
              resolvedNoSlash: pathNoSlash,
              resolvedWithSlash: pathWithSlash
            });
          }
        }
      }
    }

    if (page.canonicalHref) {
      canonicalPatterns.push({ page: page.relPath, canonicalHref: page.canonicalHref });
    }

    pageSummaries.push({
      page: page.relPath,
      canonicalHref: page.canonicalHref,
      localAbsoluteCount,
      localRelativeCount,
      externalCount,
      specialCount,
      mixedLocalAssetStrategy,
      duplicateIds: page.duplicateIds
    });
  }
  const absoluteTotal = pageSummaries.reduce((sum, p) => sum + p.localAbsoluteCount, 0);
  const relativeTotal = pageSummaries.reduce((sum, p) => sum + p.localRelativeCount, 0);
  const siteConvention = absoluteTotal >= relativeTotal ? "absolute_root" : "relative";

  const indexSummary = pageSummaries.find((p) => p.page === "site/index.html");
  const nonIndexRelativePages = pageSummaries.filter((p) => p.page !== "site/index.html" && p.localRelativeCount > 0);
  const homepageAbsoluteInnerRelativePattern = Boolean(
    indexSummary && indexSummary.localAbsoluteCount > 0 && indexSummary.localRelativeCount === 0 && nonIndexRelativePages.length > 0
  );

  const redirectsExists = fs.existsSync(path.join(siteDir, "_redirects"));
  const headersExists = fs.existsSync(path.join(siteDir, "_headers"));
  const redirectsRaw = redirectsExists ? readUtf8(path.join(siteDir, "_redirects")) : "";
  const headersRaw = headersExists ? readUtf8(path.join(siteDir, "_headers")) : "";

  const canonicalKinds = { file: 0, pretty_no_slash: 0, pretty_with_slash: 0, root: 0, other: 0 };
  for (const item of canonicalPatterns) {
    if (!item.canonicalHref) continue;
    let pathname = null;
    try {
      pathname = new URL(item.canonicalHref).pathname;
    } catch {
      pathname = item.canonicalHref;
    }
    if (pathname === "/") canonicalKinds.root += 1;
    else if (/\.html$/i.test(pathname)) canonicalKinds.file += 1;
    else if (pathname.endsWith("/")) canonicalKinds.pretty_with_slash += 1;
    else if (pathname.startsWith("/")) canonicalKinds.pretty_no_slash += 1;
    else canonicalKinds.other += 1;
  }

  const jsFiles = collectJsFilesUnderAssets();
  const scriptLoads = extractLocalScriptLoads(pageAnalysis);
  const scriptToPages = mapScriptsToPages(scriptLoads);
  const fetchEntries = [];
  const scriptMountReferences = [];

  for (const jsFile of jsFiles) {
    const jsRel = toPosix(path.relative(rootDir, jsFile));
    const jsRaw = readUtf8(jsFile);
    const lineStarts = getLineStarts(jsRaw);
    const literals = findLiteralFetches(jsRel, jsRaw, lineStarts);
    const mountDefs = inferSelectorGuards(jsRaw);
    const selectorIds = findIdSelectors(jsRaw);
    const loadedBy = Array.from(scriptToPages.get(jsRel) || []).sort();

    const idGuardMap = new Map();
    for (const mount of mountDefs) {
      if (!idGuardMap.has(mount.id)) idGuardMap.set(mount.id, false);
      idGuardMap.set(mount.id, idGuardMap.get(mount.id) || mount.guarded);
    }

    for (const selector of selectorIds) {
      scriptMountReferences.push({
        script: jsRel,
        id: selector.id,
        line: selector.line,
        col: selector.col,
        loadedByPages: loadedBy,
        guarded: idGuardMap.has(selector.id) ? idGuardMap.get(selector.id) : false
      });
    }

    for (const entry of literals) {
      const localChecks = [];
      if (isLocalClass(entry.classification)) {
        if (entry.classification === "absolute_root") {
          const resolvedPathname = stripQueryHash(entry.url);
          const fsPath = resolvedPathToFsPath(resolvedPathname);
          localChecks.push({
            page: null,
            scenario: "absolute_root",
            routePath: "/",
            resolvedPathname,
            resolvedFile: fsPath ? toPosix(path.relative(rootDir, fsPath)) : null,
            exists: fsPathExists(fsPath)
          });
        } else {
          const contexts = loadedBy.length > 0 ? loadedBy : pageAnalysis.map((p) => p.relPath);
          for (const page of contexts) {
            const scenarios = pageRouteScenarios(page.replace(/^site\//, ""));
            for (const scenario of scenarios) {
              const resolvedPathname = resolveLocalUrlForScenario(entry.url, scenario.routePath);
              const fsPath = resolvedPathToFsPath(resolvedPathname);
              localChecks.push({
                page,
                scenario: scenario.kind,
                routePath: scenario.routePath,
                resolvedPathname,
                resolvedFile: fsPath ? toPosix(path.relative(rootDir, fsPath)) : null,
                exists: fsPathExists(fsPath)
              });
            }
          }
        }
      }

      fetchEntries.push({ ...entry, loadedByPages: loadedBy, localChecks });
    }
  }

  const domMissingByScriptPage = [];
  const pageIdSetMap = new Map();
  for (const page of pageAnalysis) {
    pageIdSetMap.set(page.relPath, new Set(page.pageIds.map((item) => item.id)));
  }

  for (const mount of scriptMountReferences) {
    for (const page of mount.loadedByPages) {
      const ids = pageIdSetMap.get(page) || new Set();
      if (!ids.has(mount.id)) {
        domMissingByScriptPage.push({
          script: mount.script,
          page,
          id: mount.id,
          scriptLine: mount.line,
          guarded: mount.guarded
        });
      }
    }
  }

  const duplicateIdFindings = pageAnalysis
    .filter((p) => p.duplicateIds.length > 0)
    .map((p) => ({ page: p.relPath, duplicateIds: p.duplicateIds }));

  const jsonUrlsReferenced = [];
  for (const entry of fetchEntries) {
    if (/\.json(\?|#|$)/i.test(entry.url)) {
      jsonUrlsReferenced.push({ jsFile: entry.jsFile, line: entry.line, url: entry.url, classification: entry.classification });
    }
  }

  const generatedArtifactPresence = GENERATED_ARTIFACTS_EXPECTED.map((rel) => ({
    file: rel,
    exists: fs.existsSync(path.join(rootDir, rel))
  }));

  const generatorScriptEvidence = collectGeneratorScriptEvidence();
  const cloudflareEvidence = collectCloudflareOutputEvidence();

  const legacyOwnerHits = [];
  for (const token of OLD_OWNER_PATTERNS) {
    const hits = searchTextHits(token, { flags: "i" });
    for (const hit of hits) legacyOwnerHits.push({ token, ...hit });
  }

  const rawGithubHits = searchTextHits(/raw\.githubusercontent\.com/i);
  const legacyHostingHits = searchTextHits(/legacy-hosting/i);

  const githubOwnerRegex = /github\.com\/([A-Za-z0-9_.-]+)\//ig;
  const githubOwnerHits = [];
  for (const relPath of getGitTrackedFiles()) {
    if (!isLikelyTextFile(relPath)) continue;
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) continue;
    let text;
    try {
      text = readUtf8(absPath);
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      let match;
      while ((match = githubOwnerRegex.exec(lines[i])) !== null) {
        githubOwnerHits.push({ file: relPath, line: i + 1, owner: match[1], text: lines[i] });
      }
      githubOwnerRegex.lastIndex = 0;
    }
  }

  const legacyOwnersDetected = Array.from(
    new Set(
      githubOwnerHits
        .map((hit) => String(hit.owner || "").toLowerCase())
        .filter((owner) => owner && owner !== CURRENT_GITHUB_OWNER.toLowerCase())
    )
  ).sort();

  const fetchInconsistentStrategies = (() => {
    const classes = new Set(
      fetchEntries
        .map((entry) => entry.classification)
        .filter((classification) => classification === "absolute_root" || classification === "relative")
    );
    return classes.size > 1;
  })();

  const fetchTimeoutRiskFiles = [];
  for (const jsFile of jsFiles) {
    const jsRel = toPosix(path.relative(rootDir, jsFile));
    const raw = readUtf8(jsFile);
    if (!/fetch\s*\(/.test(raw)) continue;
    const hasAbortController = /AbortController/.test(raw);
    const hasTimeoutRace = /setTimeout|Promise\.race/.test(raw);
    if (!hasAbortController && !hasTimeoutRace) {
      fetchTimeoutRiskFiles.push(jsRel);
    }
  }

  const missingLocalAssetsDeduped = dedupeObjects(localAssetMissing, (item) =>
    `${item.page}|${item.line}|${item.refValue}|${item.scenario}|${item.resolvedPathname}`
  );
  const trailingHazardsDeduped = dedupeObjects(trailingSlashHazards, (item) =>
    `${item.page}|${item.line}|${item.refValue}|${item.withSlashRoute}|${item.resolvedWithSlash}`
  );
  const domMissingDeduped = dedupeObjects(domMissingByScriptPage, (item) =>
    `${item.script}|${item.page}|${item.id}|${item.scriptLine}`
  );

  const assetPagesDifferingFromConvention = pageSummaries
    .filter((p) => siteConvention === "absolute_root" ? p.localRelativeCount > 0 : p.localAbsoluteCount > 0)
    .map((p) => p.page);

  const suspiciousFetches = fetchEntries.filter((entry) => {
    if (entry.classification === "external") return true;
    if (entry.classification === "relative") {
      const slashFailures = entry.localChecks.filter((check) => check.scenario === "pretty_with_slash" && !check.exists);
      if (slashFailures.length > 0) return true;
    }
    return entry.localChecks.some((check) => !check.exists);
  });

  const topRootCauses = buildTopRootCauses({
    siteConvention,
    homepageAbsoluteInnerRelativePattern,
    trailingHazardCount: trailingHazardsDeduped.length,
    missingAssetCount: missingLocalAssetsDeduped.length,
    fetchInconsistentStrategies,
    fetchTimeoutRiskFiles,
    suspiciousFetches,
    generatedArtifactPresence,
    cloudflareEvidence,
    legacyOwnerHits,
    rawGithubHits,
    legacyHostingHits
  });

  const canonicalizationIntent = inferCanonicalIntent(canonicalKinds);
  const recommendedPatchSections = buildRecommendedPatchSections({
    allLocalAssetRefs,
    fetchEntries,
    trailingHazardsDeduped
  });

  const summary = {
    generatedAt: nowIso,
    environment: { cwd: rootDir, siteDir: toPosix(path.relative(rootDir, siteDir)) || "site" },
    coverage: { htmlFilesScanned: htmlFiles.length, jsFilesScanned: jsFiles.length, fetchCallsFound: fetchEntries.length },
    checks: {
      assetPathAudit: {
        siteConvention,
        absoluteTotal,
        relativeTotal,
        homepageAbsoluteInnerRelativePattern,
        pagesDifferingFromConvention: assetPagesDifferingFromConvention,
        perPage: pageSummaries
      },
      canonicalization: {
        redirectsFilePresent: redirectsExists,
        headersFilePresent: headersExists,
        redirectsPreview: redirectsRaw.split(/\r?\n/).slice(0, 20),
        headersPreview: headersRaw.split(/\r?\n/).slice(0, 20),
        canonicalKinds,
        canonicalizationIntent,
        trailingSlashHazards: trailingHazardsDeduped
      },
      localResolver: { localAssetMissingReferences: missingLocalAssetsDeduped },
      fetchAudit: {
        inconsistentLocalFetchStrategies: fetchInconsistentStrategies,
        timeoutRiskFiles: fetchTimeoutRiskFiles,
        fetchEntries,
        suspiciousFetches
      },
      dataArtifacts: {
        expectedArtifacts: generatedArtifactPresence,
        referencedJsonUrls: jsonUrlsReferenced,
        generatorScriptEvidence,
        cloudflareOutputEvidence: cloudflareEvidence
      },
      renameRegression: {
        currentOwner: CURRENT_GITHUB_OWNER,
        legacyOwnerTokens: OLD_OWNER_PATTERNS,
        legacyOwnerHits,
        rawGithubHits,
        legacyHostingHits,
        legacyOwnersDetected
      },
      domMounts: {
        duplicateIds: duplicateIdFindings,
        scriptMountReferences,
        missingMountsByPage: domMissingDeduped
      },
      rootCauseRanking: topRootCauses
    },
    fixPlan: {
      recommendedConvention: "Use root-absolute local asset URLs: /assets/...",
      recommendedPatchSections
    },
    runInstructions: {
      node: "node scripts/diagnose-site.js",
      nodeFailOnIssues: "node scripts/diagnose-site.js --fail-on-issues",
      localServer: [
        "python -m http.server --directory site 8000",
        "Open http://127.0.0.1:8000/ in a browser.",
        "Test both /security and /security/ to validate relative-path behavior."
      ]
    }
  };

  return { summary, markdown: buildMarkdownReport(summary) };
}
function buildMarkdownReport(summary) {
  const sections = [];
  const checks = summary.checks;

  sections.push(`# Static Site Diagnosis Report`);
  sections.push("");
  sections.push(`Generated: \`${summary.generatedAt}\``);
  sections.push(`Root: \`${summary.environment.cwd}\``);
  sections.push(`Site directory: \`${summary.environment.siteDir}\``);
  sections.push("");
  sections.push(`## Scope`);
  sections.push(`- HTML asset path consistency audit across all \`site/*.html\` pages`);
  sections.push(`- Trailing slash and canonicalization hazard analysis`);
  sections.push(`- Static-host URL resolution simulation for local assets`);
  sections.push(`- JS fetch/XHR URL audit`);
  sections.push(`- Generated data artifact and hosting build expectations`);
  sections.push(`- Rename regression checks (\`raylee-hawkins\`, \`legacy-hosting\`, raw GitHub URLs)`);
  sections.push(`- DOM mount contract checks (JS selectors vs page IDs)`);
  sections.push("");

  sections.push(`## Sample Run Output`);
  sections.push("```text");
  sections.push(`HTML files scanned: ${summary.coverage.htmlFilesScanned}`);
  sections.push(`JS files scanned: ${summary.coverage.jsFilesScanned}`);
  sections.push(`Fetch calls found: ${summary.coverage.fetchCallsFound}`);
  sections.push(`Trailing-slash hazards: ${checks.canonicalization.trailingSlashHazards.length}`);
  sections.push(`Missing local asset resolutions: ${checks.localResolver.localAssetMissingReferences.length}`);
  sections.push(`Legacy owner hits: ${checks.renameRegression.legacyOwnerHits.length}`);
  sections.push(`Legacy hosting hits: ${checks.renameRegression.legacyHostingHits.length}`);
  sections.push("```");
  sections.push("");

  sections.push(`## A) Asset Path Consistency Audit (HTML)`);
  sections.push(`Site-wide local asset convention inferred: \`${checks.assetPathAudit.siteConvention}\``);
  sections.push(`Homepage absolute + inner-page relative pattern detected: \`${checks.assetPathAudit.homepageAbsoluteInnerRelativePattern}\``);
  sections.push("");
  sections.push(markdownTable(
    ["Page", "Absolute Local", "Relative Local", "External", "Mixed", "Canonical"],
    checks.assetPathAudit.perPage.map((page) => [
      `\`${page.page}\``,
      page.localAbsoluteCount,
      page.localRelativeCount,
      page.externalCount,
      page.mixedLocalAssetStrategy ? "yes" : "no",
      page.canonicalHref ? `\`${page.canonicalHref}\`` : "-"
    ])
  ));
  if (checks.assetPathAudit.pagesDifferingFromConvention.length > 0) {
    sections.push("");
    sections.push(`Pages differing from site convention:`);
    for (const page of checks.assetPathAudit.pagesDifferingFromConvention) {
      sections.push(`- \`${page}\``);
    }
  }
  sections.push("");

  sections.push(`## B) Trailing Slash + Canonicalization Hazards`);
  sections.push(`Canonicalization intent inferred: \`${checks.canonicalization.canonicalizationIntent}\``);
  sections.push(`- \`site/_redirects\` present: \`${checks.canonicalization.redirectsFilePresent}\``);
  sections.push(`- \`site/_headers\` present: \`${checks.canonicalization.headersFilePresent}\``);
  sections.push(``);
  sections.push(`Trailing-slash hazard examples:`);
  const hazardExamples = checks.canonicalization.trailingSlashHazards.slice(0, 20);
  if (hazardExamples.length === 0) {
    sections.push(`- No relative-asset slash hazards detected.`);
  } else {
    for (const hazard of hazardExamples) {
      sections.push(`- ${formatPathLine(hazard.page, hazard.line)} ref \`${hazard.refValue}\` -> \`${hazard.resolvedNoSlash}\` on \`${hazard.noSlashRoute}\`, but \`${hazard.resolvedWithSlash}\` on \`${hazard.withSlashRoute}\``);
    }
  }
  sections.push("");

  sections.push(`## C) Local Static-Serve Fetch/Path Simulation`);
  for (const cmd of summary.runInstructions.localServer) {
    sections.push(`- \`${cmd}\``);
  }
  sections.push(`- Missing local asset resolutions: ${checks.localResolver.localAssetMissingReferences.length}`);
  for (const miss of checks.localResolver.localAssetMissingReferences.slice(0, 40)) {
    sections.push(`- ${formatPathLine(miss.page, miss.line)} \`${miss.refValue}\` scenario \`${miss.scenario}\` -> \`${miss.resolvedPathname}\` (${miss.resolvedFile || "no file"})`);
  }
  sections.push("");

  sections.push(`## D) JS Runtime Fetch Audit`);
  sections.push(`- Inconsistent local fetch strategy: \`${checks.fetchAudit.inconsistentLocalFetchStrategies}\``);
  sections.push(`- Files with fetch but no timeout primitives: ${checks.fetchAudit.timeoutRiskFiles.length}`);
  for (const file of checks.fetchAudit.timeoutRiskFiles) {
    sections.push(`  - \`${file}\``);
  }
  sections.push(markdownTable(
    ["Fetch Site", "URL", "Class", "Loaded By", "Local Check"],
    checks.fetchAudit.fetchEntries.map((entry) => [
      `\`${entry.jsFile}:${entry.line}\``,
      `\`${entry.url}\``,
      entry.classification,
      entry.loadedByPages.length ? entry.loadedByPages.map((p) => `\`${p}\``).join(", ") : "(unknown)",
      entry.localChecks.length ? (entry.localChecks.every((c) => c.exists) ? "ok" : "has-missing") : "-"
    ])
  ));
  sections.push(`Suspicious fetch URLs:`);
  if (checks.fetchAudit.suspiciousFetches.length === 0) {
    sections.push(`- None`);
  } else {
    for (const entry of checks.fetchAudit.suspiciousFetches.slice(0, 120)) {
      sections.push(`- ${formatPathLine(entry.jsFile, entry.line)} \`${entry.url}\` (${entry.classification})`);
    }
  }
  sections.push("");

  sections.push(`## E) Data Artifact Presence + Generation Expectations`);
  for (const item of checks.dataArtifacts.expectedArtifacts) {
    sections.push(`- \`${item.file}\` -> ${item.exists ? "present" : "missing"}`);
  }
  sections.push(`Generation script evidence:`);
  for (const hit of checks.dataArtifacts.generatorScriptEvidence.slice(0, 60)) {
    sections.push(`- ${formatPathLine(hit.file, hit.line)} ${escapePipes(hit.text)}`);
  }
  sections.push(`Cloudflare output evidence:`);
  for (const hit of checks.dataArtifacts.cloudflareOutputEvidence.slice(0, 60)) {
    sections.push(`- ${formatPathLine(hit.file, hit.line)} ${escapePipes(hit.text)}`);
  }
  sections.push("");

  sections.push(`## F) Old Identifier / Rename Regression Checks`);
  sections.push(`Current owner baseline: \`${checks.renameRegression.currentOwner}\``);
  sections.push(`Legacy owners detected: ${checks.renameRegression.legacyOwnersDetected.length ? checks.renameRegression.legacyOwnersDetected.map((owner) => `\`${owner}\``).join(", ") : "(none)"}`);
  sections.push(``);
  sections.push(`raylee-hawkins/old owner hits:`);
  for (const hit of checks.renameRegression.legacyOwnerHits.slice(0, 160)) {
    sections.push(`- ${formatPathLine(hit.file, hit.line)} [${hit.token}] ${escapePipes(hit.text)}`);
  }
  sections.push(`raw.githubusercontent.com hits:`);
  for (const hit of checks.renameRegression.rawGithubHits.slice(0, 160)) {
    sections.push(`- ${formatPathLine(hit.file, hit.line)} ${escapePipes(hit.text)}`);
  }
  sections.push(`legacy-hosting hits:`);
  for (const hit of checks.renameRegression.legacyHostingHits.slice(0, 160)) {
    sections.push(`- ${formatPathLine(hit.file, hit.line)} ${escapePipes(hit.text)}`);
  }
  sections.push("");

  sections.push(`## G) Content/DOM Mount Mismatch Checks`);
  sections.push(`Duplicate ID findings: ${checks.domMounts.duplicateIds.length}`);
  for (const dup of checks.domMounts.duplicateIds) {
    sections.push(`- \`${dup.page}\` duplicate IDs: ${dup.duplicateIds.map((id) => `\`${id}\``).join(", ")}`);
  }
  sections.push(`Missing script mount IDs by page: ${checks.domMounts.missingMountsByPage.length}`);
  for (const miss of checks.domMounts.missingMountsByPage.slice(0, 160)) {
    sections.push(`- ${formatPathLine(miss.script, miss.scriptLine)} expects \`#${miss.id}\` on \`${miss.page}\` (guarded=${miss.guarded})`);
  }
  sections.push("");

  sections.push(`## H) Ranked Top 5 Causes of Progressive Degradation`);
  for (const cause of checks.rootCauseRanking) {
    sections.push(`### ${cause.rank}. ${cause.title}`);
    sections.push(`- Why intermittent: ${cause.whyIntermittent}`);
    sections.push(`- How to confirm: ${cause.howToConfirm}`);
    sections.push(`- Minimal fix: ${cause.minimalFix}`);
    sections.push(`- Evidence: \`${JSON.stringify(cause.evidence)}\``);
    sections.push("");
  }

  sections.push(`## Minimal Safe Fix Plan`);
  sections.push(`1. Standardize local asset references in HTML to root-absolute \`/assets/...\`.`);
  sections.push(`2. Standardize local fetch URLs in JS to root-absolute \`/assets/data/...\`.`);
  sections.push(`3. Add canonical slash redirects in \`site/_redirects\` if pretty-no-slash is canonical.`);
  sections.push(`4. Enforce timeout + fallback rendering for all async loading lanes.`);
  sections.push(`5. Add CI sanity gate: \`node scripts/diagnose-site.js --fail-on-issues\`.`);
  sections.push("");

  sections.push(`### Recommended Fix Patch Sections`);
  sections.push(`#### HTML asset path rewrites`);
  for (const item of summary.fixPlan.recommendedPatchSections.htmlAssetPathRewrites.slice(0, 220)) {
    sections.push(`- ${formatPathLine(item.file, item.line)} \`${item.current}\` -> \`${item.suggested}\``);
  }
  sections.push(`#### JS fetch path rewrites`);
  for (const item of summary.fixPlan.recommendedPatchSections.jsFetchPathRewrites.slice(0, 220)) {
    sections.push(`- ${formatPathLine(item.file, item.line)} \`${item.current}\` -> \`${item.suggested}\``);
  }
  sections.push(`#### _redirects canonical suggestions`);
  if (summary.fixPlan.recommendedPatchSections.redirectsCanonicalSuggestions.length > 0) {
    sections.push("```text");
    for (const line of summary.fixPlan.recommendedPatchSections.redirectsCanonicalSuggestions) {
      sections.push(line);
    }
    sections.push("```");
  } else {
    sections.push(`- No canonical redirect additions suggested.`);
  }
  sections.push(`#### CI sanity check`);
  sections.push(`- ${summary.fixPlan.recommendedPatchSections.ciSanityCheckSuggestion.description}`);
  sections.push(`- Command: \`${summary.fixPlan.recommendedPatchSections.ciSanityCheckSuggestion.command}\``);
  sections.push("");

  sections.push(`## Re-run Instructions`);
  sections.push(`- Node only: \`${summary.runInstructions.node}\``);
  sections.push(`- Fail CI on issues: \`${summary.runInstructions.nodeFailOnIssues}\``);
  sections.push(`- Report outputs: \`${toPosix(path.relative(rootDir, markdownOut))}\`, \`${toPosix(path.relative(rootDir, jsonOut))}\``);

  return sections.join("\n");
}

function main() {
  if (!fs.existsSync(siteDir)) {
    console.error(`Missing site directory: ${siteDir}`);
    process.exit(1);
  }

  const { summary, markdown } = analyze();
  ensureDir(docsDir);
  fs.writeFileSync(markdownOut, markdown + "\n", "utf8");
  fs.writeFileSync(jsonOut, JSON.stringify(summary, null, 2) + "\n", "utf8");

  const rootCauses = summary.checks.rootCauseRanking;
  console.log([
    `Static site diagnosis complete.`,
    `Report: ${toPosix(path.relative(rootDir, markdownOut))}`,
    `JSON: ${toPosix(path.relative(rootDir, jsonOut))}`,
    `HTML files scanned: ${summary.coverage.htmlFilesScanned}`,
    `JS files scanned: ${summary.coverage.jsFilesScanned}`,
    `Fetch calls found: ${summary.coverage.fetchCallsFound}`,
    `Trailing-slash hazards: ${summary.checks.canonicalization.trailingSlashHazards.length}`,
    `Missing local asset resolutions: ${summary.checks.localResolver.localAssetMissingReferences.length}`,
    `Top cause #1: ${rootCauses[0] ? rootCauses[0].title : "n/a"}`
  ].join("\n"));

  const criticalIssueCount =
    summary.checks.canonicalization.trailingSlashHazards.length +
    summary.checks.localResolver.localAssetMissingReferences.length +
    summary.checks.fetchAudit.suspiciousFetches.length;

  if (failOnIssues && criticalIssueCount > 0) {
    console.error(`Failing due to critical issues count: ${criticalIssueCount}`);
    process.exit(1);
  }
}

main();

