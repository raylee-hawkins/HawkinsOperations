#!/usr/bin/env node

const baseUrl = process.argv[2] || "https://hawkinsops.com";

const assetUrls = [
  `${baseUrl}/assets/styles.css`,
  `${baseUrl}/assets/app.js`,
  `${baseUrl}/assets/portfolio-data.js`,
  `${baseUrl}/assets/data/detections.json`,
  `${baseUrl}/assets/data/media.json`,
  `${baseUrl}/assets/verified-counts.json`
];

const jsonUrls = [
  `${baseUrl}/assets/data/detections.json`,
  `${baseUrl}/assets/data/media.json`,
  `${baseUrl}/assets/verified-counts.json`
];

const redirectCases = [
  { name: "security", slash: `${baseUrl}/security/`, allowed: ["/security", "/security.html"] },
  { name: "projects", slash: `${baseUrl}/projects/`, allowed: ["/projects", "/projects.html"] },
  { name: "lab", slash: `${baseUrl}/lab/`, allowed: ["/lab", "/lab.html"] },
  { name: "proof", slash: `${baseUrl}/proof/`, allowed: ["/proof", "/proof.html"] }
];

function firstNonWhitespaceChar(text) {
  if (!text) return "";
  const t = String(text).trimStart();
  return t.length ? t[0] : "";
}

function toAbsolute(base, location) {
  if (!location) return null;
  if (/^https?:\/\//i.test(location)) return location;
  if (location.startsWith("/")) return `${base}${location}`;
  return `${base}/${location}`;
}

async function request(url, redirect = "follow") {
  try {
    const res = await fetch(url, { redirect, cache: "no-store" });
    const body = await res.text();
    return {
      ok: true,
      status: res.status,
      body,
      location: res.headers.get("location") || "",
      error: ""
    };
  } catch (err) {
    return { ok: false, status: 0, body: "", location: "", error: err && err.message ? err.message : String(err) };
  }
}

function normalizeLocationPath(location) {
  if (!location) return "";
  try {
    if (/^https?:\/\//i.test(location)) {
      return new URL(location).pathname;
    }
  } catch {
    return location;
  }
  return location;
}

function pushResult(results, check, url, expected, actual, pass, detail) {
  results.push({ check, url, expected, actual, pass, detail: detail || "" });
}

function printTable(results) {
  const headers = ["Check", "Url", "Expected", "Actual", "Pass", "Detail"];
  const widths = {
    Check: 18,
    Url: 52,
    Expected: 35,
    Actual: 22,
    Pass: 6
  };

  const pad = (value, width) => {
    const s = String(value ?? "");
    if (s.length <= width) return s.padEnd(width, " ");
    return `${s.slice(0, Math.max(0, width - 1))}…`;
  };

  console.log(
    `${pad(headers[0], widths.Check)} ${pad(headers[1], widths.Url)} ${pad(headers[2], widths.Expected)} ${pad(headers[3], widths.Actual)} ${pad(headers[4], widths.Pass)} ${headers[5]}`
  );
  console.log(
    `${"-".repeat(widths.Check)} ${"-".repeat(widths.Url)} ${"-".repeat(widths.Expected)} ${"-".repeat(widths.Actual)} ${"-".repeat(widths.Pass)} ${"-".repeat(40)}`
  );

  for (const row of results) {
    console.log(
      `${pad(row.check, widths.Check)} ${pad(row.url, widths.Url)} ${pad(row.expected, widths.Expected)} ${pad(row.actual, widths.Actual)} ${pad(String(row.pass), widths.Pass)} ${row.detail}`
    );
  }
}

async function main() {
  const results = [];
  const responseMap = new Map();

  for (const url of assetUrls) {
    const res = await request(url, "follow");
    responseMap.set(url, res);
    const pass = res.ok && res.status === 200;
    pushResult(results, "ASSET_200", url, "HTTP 200", res.ok ? `HTTP ${res.status}` : "ERROR", pass, res.ok ? "" : res.error);
  }

  for (const url of jsonUrls) {
    const res = responseMap.get(url) || (await request(url, "follow"));
    const first = firstNonWhitespaceChar(res.body);
    const pass = res.ok && res.status === 200 && (first === "{" || first === "[");
    const detail = !res.ok ? res.error : first === "<" ? "Response begins with '<' (likely HTML error page)" : "";
    pushResult(
      results,
      "JSON_SHAPE",
      url,
      "Starts with { or [ (not <)",
      res.ok ? `HTTP ${res.status}, starts '${first}'` : "ERROR",
      pass,
      detail
    );
  }

  for (const item of redirectCases) {
    const redirectRes = await request(item.slash, "manual");
    const locationPath = normalizeLocationPath(redirectRes.location);
    const statusPass = redirectRes.ok && (redirectRes.status === 301 || redirectRes.status === 308);
    const locationPass = item.allowed.includes(locationPath);
    const passShape = statusPass && locationPass;

    pushResult(
      results,
      "REDIRECT_SHAPE",
      item.slash,
      `301/308 to ${item.allowed.join(" or ")}`,
      redirectRes.ok ? `HTTP ${redirectRes.status}, Location: ${redirectRes.location}` : "ERROR",
      passShape,
      redirectRes.ok ? "" : redirectRes.error
    );

    const finalUrl = toAbsolute(baseUrl, redirectRes.location) || `${baseUrl}${item.allowed[0]}`;
    const finalRes = await request(finalUrl, "follow");
    pushResult(
      results,
      "REDIRECT_FINAL_200",
      finalUrl,
      "HTTP 200",
      finalRes.ok ? `HTTP ${finalRes.status}` : "ERROR",
      finalRes.ok && finalRes.status === 200,
      finalRes.ok ? "" : finalRes.error
    );
  }

  printTable(results);
  const failed = results.filter((r) => !r.pass).length;
  const passed = results.length - failed;
  console.log("");
  console.log(`Smoke summary: ${passed}/${results.length} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
