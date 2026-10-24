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
