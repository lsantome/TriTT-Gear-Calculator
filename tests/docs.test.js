"use strict";
// Coherencia de la documentación con el código.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, read } = require("./helpers.js");

const pkg = JSON.parse(read("package.json"));

test("documentación: ficheros del estándar presentes", () => {
  for (const f of ["README.md", "CHANGELOG.md", "CLAUDE.md", "LICENSE", "docs/ANDROID.md", ".gitignore"]) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), `falta ${f}`);
  }
});

test("CHANGELOG: la última versión coincide con package.json", () => {
  const m = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/m.exec(read("CHANGELOG.md"));
  assert.ok(m, "no hay ninguna entrada de versión");
  assert.equal(m[1], pkg.version);
});

test("README: incluye la URL de la PWA", () => {
  assert.ok(read("README.md").includes("https://lsantome.github.io/TriTT-Gear-Calculator/"));
});

test("privacidad.html: bilingüe, sin recursos externos y publicada en el sitio", () => {
  const fs2 = require("node:fs");
  const html = read("privacidad.html");
  assert.match(html, /id="es" lang="es"/);
  assert.match(html, /id="en" lang="en"/);
  // Enlaces (<a href>) permitidos; recursos que se cargan solos (src, link, @import, url()) no.
  assert.doesNotMatch(html, /<(?:script|img|iframe|video|audio|source)[^>]+(?:src)=["']https?:/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);
  assert.doesNotMatch(html, /@import|url\(\s*["']?https?:/i);
  assert.doesNotMatch(html, /\[(?:TU|YOUR)[^\]]*\]/i, "quedan marcadores de relleno");
  // El build del sitio la incluye y el del APK no.
  const { execFileSync } = require("node:child_process");
  const run = (t) => execFileSync(process.execPath, [path.join(ROOT, "scripts", "build-pwa.js"), t], { cwd: ROOT, encoding: "utf8" });
  run("site"); run("app");
  assert.ok(fs2.existsSync(path.join(ROOT, "dist", "site", "privacidad.html")));
  assert.ok(!fs2.existsSync(path.join(ROOT, "dist", "app", "privacidad.html")));
});

test("README: enlaza la política de privacidad publicada", () => {
  assert.ok(read("README.md").includes("https://lsantome.github.io/TriTT-Gear-Calculator/privacidad.html"));
});
