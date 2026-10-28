// Genera la web sellada con la versión.
//   node scripts/build-pwa.js site  ->  dist/site  (lo que se publica en GitHub Pages; incluye service worker)
//   node scripts/build-pwa.js app   ->  dist/app   (lo que entra en el APK; sin service worker)
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, getVersionInfo, stampHtml, stampSw } = require("./version.js");

const target = process.argv[2];
if (target !== "site" && target !== "app") {
  console.error("Uso: node scripts/build-pwa.js <site|app>");
  process.exit(1);
}

const info = getVersionInfo();
const out = path.join(ROOT, "dist", target);
const files = ["index.html", "manifest.webmanifest", "fonts", "icons"].concat(target === "site" ? ["sw.js", "privacidad.html"] : []);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) {
  const src = path.join(ROOT, f);
  if (!fs.existsSync(src)) throw new Error(`Falta ${f} en la raíz del repositorio`);
  fs.cpSync(src, path.join(out, f), { recursive: true });
}

const idx = path.join(out, "index.html");
fs.writeFileSync(idx, stampHtml(fs.readFileSync(idx, "utf8"), info));
if (target === "site") {
  const sw = path.join(out, "sw.js");
  fs.writeFileSync(sw, stampSw(fs.readFileSync(sw, "utf8"), info));
}
console.log(`dist/${target}: v${info.version} · build ${info.sha} · ${info.date}`);
