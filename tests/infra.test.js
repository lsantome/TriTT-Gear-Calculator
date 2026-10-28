"use strict";
// Pruebas de infraestructura del estándar: sintaxis, manifest, service worker, offline, almacenamiento, Android y build.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const { ROOT, read, buildTo } = require("./helpers.js");

const html = read("index.html");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const pkg = JSON.parse(read("package.json"));
const gradle = read("android/app/build.gradle");
const cap = JSON.parse(read("capacitor.config.json"));

// 1. Sintaxis
test("sintaxis: los scripts inline de index.html y sw.js compilan", () => {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length >= 1);
  scripts.forEach((code, i) => assert.doesNotThrow(() => new vm.Script(code), `script inline #${i + 1}`));
  assert.doesNotThrow(() => new vm.Script(sw), "sw.js");
});

// 2. Manifest
test("manifest: campos obligatorios, id propio y estable, iconos existentes", () => {
  for (const k of ["name", "short_name", "start_url", "scope", "id", "display", "icons", "theme_color", "background_color"]) {
    assert.ok(manifest[k], `falta ${k}`);
  }
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  // El origen lo comparten todas las apps de lsantome.github.io: el id no puede ser genérico ("./" o "/").
  assert.equal(manifest.id, "/desarrollos-calculadora", "el id del manifest no debe cambiar (PWA ya instaladas)");
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
  for (const i of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, i.src)), `no existe ${i.src}`);
});

// 3. Service worker
test("service worker: prefijo propio y borrado solo de cachés propias", () => {
  const prefix = /const PREFIX = "([^"]+)";/.exec(sw);
  const cache = /const CACHE = "([^"]+)";/.exec(sw);
  assert.ok(prefix && cache);
  assert.equal(prefix[1], "desarrollos-");
  assert.ok(cache[1].startsWith(prefix[1]), "CACHE debe empezar por PREFIX");
  const deletes = sw.match(/caches\.delete\(/g) || [];
  assert.equal(deletes.length, 1, "un único borrado de cachés");
  assert.match(sw, /filter\(\(k\) => k\.startsWith\(PREFIX\) && k !== CACHE\)/, "solo borra cachés con su prefijo");
});

test("service worker: todo el SHELL precacheado existe", () => {
  const list = /const SHELL = \[([\s\S]*?)\];/.exec(sw)[1];
  for (const m of list.matchAll(/"([^"]+)"/g)) {
    const f = m[1] === "./" ? "index.html" : m[1];
    assert.ok(fs.existsSync(path.join(ROOT, f)), `SHELL referencia ${m[1]} y no existe`);
  }
});

// 4. Sin referencias externas
test("offline: sin referencias a recursos externos", () => {
  const files = ["index.html", "sw.js", "manifest.webmanifest", "fonts/fonts.css"];
  for (const f of files) {
    const txt = read(f).replace(/http:\/\/www\.w3\.org\/[^\s"')]+/g, ""); // espacios de nombres SVG, no son peticiones
    assert.doesNotMatch(txt, /https?:\/\//, `${f} contiene una URL externa`);
    assert.doesNotMatch(txt, /(?:src|href)\s*=\s*["']\/\//, `${f} contiene una URL sin protocolo`);
  }
});

// 5. Almacenamiento con prefijo
test("almacenamiento: todas las claves llevan el prefijo propio", () => {
  const ns = /var NS = "([^"]+)";/.exec(html);
  assert.ok(ns && ns[1].startsWith("desarrollos"), "NS con prefijo propio");
  const calls = [...html.matchAll(/(?:localStorage|sessionStorage)\.(\w+)\(([^)]*)\)/g)];
  assert.ok(calls.length > 0);
  for (const [all, , args] of calls) assert.match(args, /^\s*NS\s*\+/, `acceso sin prefijo: ${all}`);
  assert.doesNotMatch(html, /indexedDB/, "si se usa IndexedDB, prefijar y añadir prueba");
});

// 6. Coherencia Android
test("android: appId, versión ligada a package.json y sin secretos en build.gradle", () => {
  assert.equal(cap.appId, "io.github.lsantome.trittgears", "el applicationId no debe cambiar");
  assert.match(gradle, new RegExp(`applicationId\\s+"${cap.appId.replace(/\./g, "\\.")}"`));
  assert.match(gradle, new RegExp(`namespace\\s*=\\s*"${cap.appId.replace(/\./g, "\\.")}"`));
  assert.equal(cap.webDir, "dist/app");
  assert.match(gradle, /package\.json/, "build.gradle lee la versión de package.json");
  assert.match(gradle, /versionName\s*=\s*pkg\.version/);
  assert.match(gradle, /VERSION_CODE_OFFSET\s*=\s*30000000/, "no reducir el desplazamiento del versionCode");
  for (const k of ["ANDROID_KEYSTORE_PATH", "ANDROID_KEYSTORE_PASSWORD", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD"]) {
    assert.ok(gradle.includes(k), `build.gradle no lee ${k}`);
  }
  assert.doesNotMatch(gradle, /(?:storePassword|keyPassword)\s*[= ]\s*["'][^"']+["']/, "contraseña literal en build.gradle");
  assert.doesNotMatch(gradle, /storeFile\s+file\(["']/, "ruta de keystore literal en build.gradle");
});

test("android: ningún keystore ni binario versionado", () => {
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n");
  } catch (e) {
    return; // sin git (p. ej. un zip): nada que comprobar
  }
  const bad = tracked.filter((f) => /\.(keystore|jks|p12|apk|aab)$/i.test(f) || /keystore\.properties$|local\.properties$/.test(f));
  assert.deepEqual(bad, []);
});

test("package.json: scripts del estándar y campos obligatorios", () => {
  for (const s of ["test", "build:pwa", "build:android-web", "android:sync", "android:debug", "android:release"]) {
    assert.ok(pkg.scripts[s], `falta el script ${s}`);
  }
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.private, true);
  assert.equal(pkg.license, "MIT");
  assert.match(pkg.engines.node, /22/);
});

// Build y sellado de versión
test("build: build:pwa y build:android-web sellan la versión; el APK no lleva service worker", () => {
  const out = buildTo();
  const site = (f) => fs.readFileSync(path.join(out, "site", f), "utf8");
  const app = (f) => fs.readFileSync(path.join(out, "app", f), "utf8");
  for (const h of [site("index.html"), app("index.html")]) {
    assert.ok(h.includes(`var APP_VERSION = "${pkg.version}";`));
    assert.match(h, /var APP_BUILD = \{ sha: "[0-9a-z-]+", date: "\d{4}-\d{2}-\d{2}" \};/);
  }
  assert.match(site("sw.js"), /const CACHE = "desarrollos-[0-9a-f]{7}(-local)?";/);
  assert.ok(!fs.existsSync(path.join(out, "app", "sw.js")), "dist/app no debe incluir sw.js");
  assert.ok(fs.existsSync(path.join(out, "app", "manifest.webmanifest")));
  // Las fuentes del repo no se sellan: el sellado solo ocurre en la salida del build.
  assert.ok(html.includes('var APP_VERSION = "dev";'));
  assert.ok(sw.includes('const CACHE = "desarrollos-dev";'));
  fs.rmSync(out, { recursive: true, force: true });
});
