"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

// Carga el bloque de cálculo de index.html (entre // ==CALC-START== y // ==CALC-END==) en un contexto aislado.
function loadCalc() {
  const html = read("index.html");
  const a = html.indexOf("// ==CALC-START==");
  const b = html.indexOf("// ==CALC-END==");
  if (a < 0 || b < 0) throw new Error("Faltan los marcadores CALC-START / CALC-END en index.html");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    html.slice(a, b) +
      ";this.api={G:G,PRESETS:PRESETS,solveSpeed:solveSpeed,powerFor:powerFor,powerGrade:powerGrade,zoneOf:zoneOf,climbTable:climbTable,CLIMB_GRADES:CLIMB_GRADES,HIDE_W:HIDE_W,speedKmh:speedKmh,cadenceFor:cadenceFor," +
      "centralBand:centralBand,analyze:analyze,fixedRow:fixedRow,parseCogs:parseCogs};",
    ctx
  );
  return ctx.api;
}

// Compila site y app en una carpeta temporal propia de la prueba (nunca en dist/: las pruebas se ejecutan en paralelo).
function buildTo() {
  const os = require("node:os");
  const { execFileSync } = require("node:child_process");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tritt-build-"));
  for (const t of ["site", "app"]) {
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "build-pwa.js"), t], {
      cwd: ROOT, encoding: "utf8", env: { ...process.env, BUILD_OUT_DIR: dir },
    });
  }
  return dir;
}

module.exports = { ROOT, read, loadCalc, buildTo };
