"use strict";
// Pruebas de la lógica de cálculo de la calculadora (modelo físico y propuesta de platos).
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadCalc } = require("./helpers.js");

const C = loadCalc();
const O = { cda: 0.23, mass: 85, crr: 0.004, rho: 1.19, eta: 0.975 };
const COGS = [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]; // SRAM 12v 10-30
const CIRC = 2136;
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ""} esperado ${b}, obtenido ${a}`);

test("solveSpeed y powerFor son inversas", () => {
  for (const P of [120, 180, 235, 260, 300, 400]) near(C.powerFor(C.solveSpeed(P, O), O), P, 1e-6, `P=${P}`);
});

test("a más potencia, más velocidad", () => {
  let prev = 0;
  for (let P = 100; P <= 450; P += 25) {
    const v = C.solveSpeed(P, O);
    assert.ok(v > prev);
    prev = v;
  }
});

test("velocidad por marcha y cadencia necesaria son coherentes", () => {
  near(C.speedKmh(52, 17, 90, CIRC), 35.28, 0.01); // 52/17 · 2,136 m · 90 rpm · 0,06
  near(C.cadenceFor(C.speedKmh(56, 15, 87, CIRC), 56, 15, CIRC), 87, 1e-9);
});

test("banda central del cassette: un tercio de los piñones, mínimo 3, centrada", () => {
  const b12 = C.centralBand(12);
  assert.deepEqual([b12.k, b12.start, b12.end], [4, 4, 7]);
  const b11 = C.centralBand(11);
  assert.equal(b11.k, 4);
  assert.ok(b11.start >= 0 && b11.end <= 10);
  const b13 = C.centralBand(13);
  assert.equal(b13.k, 4);
});

test("analyze: Medio = mejor línea de cadena, Grande = Medio+2, Bajo = Medio−2", () => {
  const r = C.analyze(COGS, 40.3, 90, CIRC, 48, 68, undefined, 6);
  assert.ok(r.bestChain !== null, "debe haber un plato que encaje");
  assert.equal(r.bestChain % 2, 0, "solo dentados pares");
  const byLabel = Object.fromEntries(r.props.map((p) => [p.label, p.row.chain]));
  assert.equal(byLabel.medium, r.bestChain);
  assert.equal(byLabel.large, r.bestChain + 2);
  assert.equal(byLabel.small, r.bestChain - 2);
  const medium = r.props.find((p) => p.label === "medium").row;
  assert.ok(medium.fit);
  // Ningún candidato que encaje está más centrado que el Medio.
  for (const f of r.fits) assert.ok(f.off >= medium.off);
});

test("analyze: todo plato que encaja está en la banda central y dentro de la tolerancia de cadencia", () => {
  for (const P of [235, 250, 260, 280]) {
    const v = C.solveSpeed(P, O) * 3.6;
    const r = C.analyze(COGS, v, 90, CIRC, 48, 68, undefined, 6);
    for (const f of r.fits) {
      assert.ok(f.idx >= r.band.start && f.idx <= r.band.end);
      assert.ok(Math.abs(f.cadNeed - 90) <= 6 + 1e-9);
      assert.equal(f.chain % 2, 0);
    }
  }
});

test("analyze: avisa de techo y de suelo del rango y omite la propuesta que no existe", () => {
  const base = C.analyze(COGS, 40.3, 90, CIRC, 48, 68, undefined, 6);
  const atTop = C.analyze(COGS, 40.3, 90, CIRC, 48, base.bestChain, undefined, 6);
  assert.equal(atTop.atCeiling, true);
  assert.ok(!atTop.props.some((p) => p.label === "large"));
  const atBottom = C.analyze(COGS, 40.3, 90, CIRC, base.bestChain, 68, undefined, 6);
  assert.equal(atBottom.atFloor, true);
  assert.ok(!atBottom.props.some((p) => p.label === "small"));
});

test("analyze: si ningún plato encaja no hay propuestas", () => {
  // A 40,3 km/h y 90 rpm hace falta una relación ≈3,49: con platos de 36–38 el piñón sería el de 10 (fuera de la banda central).
  const r = C.analyze(COGS, 40.3, 90, CIRC, 36, 38, undefined, 6);
  assert.equal(r.bestChain, null);
  assert.equal(r.props.length, 0);
});

test("analyze: un rango con extremos impares se recorta a dentados pares", () => {
  const r = C.analyze(COGS, 40.3, 90, CIRC, 49, 67, undefined, 6);
  assert.equal(r.lo, 50);
  assert.equal(r.hi, 66);
  assert.ok(r.rows.every((x) => x.chain % 2 === 0));
});

test("fixedRow: analiza un plato fijo (cualquier dentado) sin simulación", () => {
  const f = C.fixedRow(53, COGS, 40.3, 90, CIRC, undefined, 6);
  assert.equal(f.row.chain, 53);
  near(f.row.v, C.speedKmh(53, COGS[f.row.idx], 90, CIRC), 1e-9);
  near(f.row.dv, f.row.v - 40.3, 1e-9);
  // El piñón elegido es realmente el más cercano a la velocidad objetivo.
  for (const c of COGS) assert.ok(Math.abs(C.speedKmh(53, c, 90, CIRC) - 40.3) >= Math.abs(f.row.dv) - 1e-9);
});

test("parseCogs: ordena y valida", () => {
  const ok = C.parseCogs("30, 27 24 21;19,17,15,14,13,12,11,10");
  assert.deepEqual(Array.from(ok.cogs), [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]);
  assert.equal(C.parseCogs("").err.key, "err_empty");
  assert.equal(C.parseCogs("11 12 13").err.key, "err_count");
  assert.equal(C.parseCogs("11 12 13 14 15 16 17 19 21 23 abc").err.key, "err_num");
  assert.equal(C.parseCogs("11 12 13 14 15 16 17 17 21 23 25").err.key, "err_dup");
});

test("presets: ascendentes, sin duplicados y con el número de piñones de su grupo", () => {
  const expected = { r12: 12, r11: 11, f11: 11, x13: 13, s11: 11, s12: 12 };
  for (const g of C.PRESETS) {
    if (g.group === "custom") continue;
    for (const p of g.items) {
      assert.equal(p.cogs.length, expected[g.group], `${p.id}: nº de piñones`);
      assert.ok(p.cogs.every((c, i) => i === 0 || c > p.cogs[i - 1]), `${p.id}: ascendente y sin duplicados`);
      assert.ok(p.id.startsWith(g.group + "-"), `${p.id}: id coherente con el grupo`);
    }
  }
});
