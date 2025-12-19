import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import http from "node:http";

const DIST_DIR = path.resolve(process.cwd(), "build");
const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;

const ROUTES = [
  "/",
  "/quote",
  "/quote/auto",
  "/quote/homeowners",
  "/quote/renters",
  "/quote/umbrella",
  "/quote/life",
  "/quote/pet",
  "/quote/bop",
  "/quote/commercial-building",
  "/about",
  "/contact",
  "/blog",
  "/coverage/auto",
  "/coverage/business",
  "/compliance",
  "/terms",
  "/privacy",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) resolve();
          else reject(new Error(`HTTP ${res.statusCode}`));
        });
        req.on("error", reject);
        req.setTimeout(2_000, () => req.destroy(new Error("timeout")));
      });
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

function startVitePreview() {
  const viteBin = path.resolve(process.cwd(), "node_modules", "vite", "bin", "vite.js");
  const proc = spawn(process.execPath, [viteBin, "preview", "--host", HOST, "--port", String(PORT), "--strictPort"], {
    stdio: "inherit",
    env: { ...process.env, BROWSER: "none" },
  });
  return proc;
}

function routeToOutFile(route) {
  if (route === "/") return path.join(DIST_DIR, "index.html");
  const clean = route.replace(/^\//, "");
  return path.join(DIST_DIR, clean, "index.html");
}

async function prerender() {
  let previewProc;
  try {
    previewProc = startVitePreview();
    await waitForServer(`${BASE_URL}/`);

    let puppeteer;
    try {
      puppeteer = await import("puppeteer");
    } catch (e) {
      throw new Error(
        "Missing dependency: puppeteer. Install it with `npm i -D puppeteer` and rerun `npm run prerender`."
      );
    }

    const browser = await puppeteer.default.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60_000);

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      console.log(`\n[prerender] ${route} -> ${url}`);

      await page.goto(url, { waitUntil: "networkidle2" });

      // Wait for client-side SEO to apply
      await page.waitForSelector('link[rel="canonical"]');
      await page.waitForSelector('meta[property="og:title"]');

      // Give any async SEO override fetch a brief moment
      await sleep(250);

      const html = await page.content();
      const outFile = routeToOutFile(route);
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, html, "utf-8");
      console.log(`[prerender] wrote ${path.relative(process.cwd(), outFile)}`);
    }

    await browser.close();
  } finally {
    if (previewProc) {
      previewProc.kill("SIGTERM");
    }
  }
}

prerender().catch((err) => {
  console.error("\n[prerender] failed:", err);
  process.exitCode = 1;
});
