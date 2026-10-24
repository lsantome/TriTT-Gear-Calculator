// Versión única de la app: package.json -> version (semver). Aquí se lee y se "sella" en index.html y sw.js.
// Lo usan build:pwa y build:android-web (scripts/build-pwa.js). Sin dependencias.
"use strict";
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SLUG = "desarrollos"; // prefijo propio de cachés y claves (el origen lo comparten varias apps)

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch (e) {
    return null;
  }
}

function getVersionInfo() {
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`version de package.json no es semver X.Y.Z: ${version}`);
  const full = process.env.GITHUB_SHA || git("rev-parse", "HEAD");
  const dirty = !process.env.GITHUB_SHA && !!git("status", "--porcelain");
  let sha = full ? full.slice(0, 7) : "nogit";
  const iso = full && !dirty ? git("show", "-s", "--format=%cI", full) : null;
  const when = iso ? new Date(iso) : new Date();
  if (dirty) sha += "-local";
  return { version, sha, date: when.toISOString().slice(0, 10), cache: `${SLUG}-${sha}` };
}

function stampHtml(html, info) {
  const a = /var APP_VERSION = "[^"]*";/;
  const b = /var APP_BUILD = \{[^}]*\};/;
  if (!a.test(html) || !b.test(html)) throw new Error("index.html no tiene las constantes APP_VERSION / APP_BUILD");
  return html
    .replace(a, `var APP_VERSION = "${info.version}";`)
    .replace(b, `var APP_BUILD = { sha: "${info.sha}", date: "${info.date}" };`);
}

function stampSw(sw, info) {
  const c = /const CACHE = "[^"]*";/;
  if (!c.test(sw)) throw new Error("sw.js no tiene la constante CACHE");
  return sw.replace(c, `const CACHE = "${info.cache}";`);
}

module.exports = { ROOT, SLUG, getVersionInfo, stampHtml, stampSw };

if (require.main === module) console.log(JSON.stringify(getVersionInfo(), null, 2));
