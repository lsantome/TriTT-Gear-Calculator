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
      ";this.api={G:G,PRESETS:PRESETS,solveSpeed:solveSpeed,powerFor:powerFor,speedKmh:speedKmh,cadenceFor:cadenceFor," +
      "centralBand:centralBand,analyze:analyze,fixedRow:fixedRow,parseCogs:parseCogs};",
    ctx
  );
  return ctx.api;
}

module.exports = { ROOT, read, loadCalc };
