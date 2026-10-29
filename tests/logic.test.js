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

test("analyze: dos opciones, cada una anclada a uno de los dos piñones centrales (grande = piñón mayor, pequeño = piñón menor)", () => {
  const r = C.analyze(COGS, 40.3, 90, CIRC, 48, 68, undefined, 6);
  assert.deepEqual(Array.from(r.props, (p) => p.label), ["high", "low"]);
  const [hi, lo] = r.props;
  assert.equal(COGS[hi.row.idx], 17); // banda 14-15-17-19 → centrales 15 y 17
  assert.equal(COGS[lo.row.idx], 15);
  assert.ok(hi.row.chain > lo.row.chain, "el piñón mayor da el plato mayor");
  for (const p of r.props) {
    assert.ok(p.row.fit);
    assert.equal(p.row.chain % 2, 0, "solo dentados pares");
    // Es el plato que encaja con ese piñón con menor error de velocidad.
    for (const f of r.fits) if (f.idx === p.row.idx) assert.ok(Math.abs(f.dv) >= Math.abs(p.row.dv) - 1e-9);
  }
  assert.equal(r.missing.length, 0);
});

test("analyze: un solo piñón central (banda de nº impar) da una única propuesta", () => {
  const r = C.analyze(COGS, 40.3, 90, CIRC, 48, 68, 3, 6);
  assert.equal(r.props.length, 1);
  assert.equal(r.props[0].label, "one");
  assert.equal(r.props[0].row.idx, Math.round(r.band.center));
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

test("analyze: si una ancla no tiene plato en el rango, lo indica en missing y no mezcla familias", () => {
  // 40,3 km/h a 90 rpm con 10-30: el 17T pide ~60T; con el rango limitado a 54T ya no hay plato que encaje con él.
  const r = C.analyze(COGS, 40.3, 90, CIRC, 48, 54, undefined, 6);
  assert.deepEqual(Array.from(r.props, (p) => p.label), ["low"]);
  assert.deepEqual(Array.from(r.missing, (m) => m.label), ["high"]);
  assert.equal(COGS[r.missing[0].idx], 17);
  // Si ninguna ancla tiene plato pero otros sí encajan, se propone el mejor de ellos y se avisa de las dos anclas.
  const f = C.analyze(COGS, 40.3, 90, CIRC, 48, 50, undefined, 6);
  assert.deepEqual(Array.from(f.props, (p) => p.label), ["one"]);
  assert.equal(f.missing.length, 2);
});

test("analyze: si ningún plato encaja no hay propuestas", () => {
  // A 40,3 km/h y 90 rpm hace falta una relación ≈3,49: con platos de 36–38 el piñón sería el de 10 (fuera de la banda central).
  const r = C.analyze(COGS, 40.3, 90, CIRC, 36, 38, undefined, 6);
  assert.equal(r.fits.length, 0);
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

// Subidas: potencia con pendiente, rangos de %FTP y tabla por piñón.
test("powerGrade: sin pendiente coincide con powerFor y crece con la pendiente", () => {
  for (const v of [5, 8, 11]) near(C.powerGrade(v, 0, O), C.powerFor(v, O), 1e-9, `v=${v}`);
  let prev = 0;
  for (const g of [0, 0.02, 0.05, 0.1, 0.15]) { const p = C.powerGrade(8, g, O); assert.ok(p > prev); prev = p; }
});

test("powerGrade: valor de referencia calculado a mano (85 kg, 8 %, 20 km/h)", () => {
  const v = 20 / 3.6, g = 0.08, s = g / Math.sqrt(1 + g * g), c = 1 / Math.sqrt(1 + g * g);
  const esperado = (0.5 * 1.19 * 0.23 * v ** 3 + 85 * 9.81 * v * (0.004 * c + s)) / 0.975;
  near(C.powerGrade(v, g, O), esperado, 1e-9);
  // Aritmética a mano: gravedad ≈ 369 W + rodadura ≈ 18 W + aire ≈ 24 W = 411 W en rueda; ÷ 0,975 ≈ 422 W en pedal.
  near(C.powerGrade(v, g, O), 422, 1.5, "orden de magnitud");
});

test("zoneOf: límites de los rangos de %FTP (inferior incluido, superior excluido)", () => {
  const casos = [[0, 0], [74.9, 0], [75, 1], [84.9, 1], [85, 2], [94.9, 2], [95, 3], [104.9, 3], [105, 4], [114.9, 4], [115, 5], [200, 5]];
  for (const [pct, z] of casos) assert.equal(C.zoneOf(pct), z, `${pct} %`);
});

test("climbTable: una fila por piñón, velocidad del desarrollo y celdas por pendiente", () => {
  const tb = C.climbTable(COGS, 52, 90, CIRC, C.CLIMB_GRADES, O, 300, C.HIDE_W);
  assert.equal(tb.length, COGS.length);
  assert.deepEqual(Array.from(C.CLIMB_GRADES), [0, 2, 4, 6, 8, 10, 12, 15]);
  tb.forEach((r, i) => {
    assert.equal(r.cog, COGS[i]);
    near(r.v, C.speedKmh(52, COGS[i], 90, CIRC), 1e-9);
    assert.equal(r.cells.length, C.CLIMB_GRADES.length);
    near(r.cells[0].p, C.powerFor(r.v / 3.6, O), 1e-9, "0 % = llano");
    near(r.cells[0].pct, r.cells[0].p / 300 * 100, 1e-9);
    assert.equal(r.cells[0].zone, C.zoneOf(r.cells[0].pct));
    r.cells.forEach((c, k) => { if (k) assert.ok(c.p > r.cells[k - 1].p, "la potencia crece con la pendiente"); });
  });
  // más piñón (más pequeño el desarrollo) = menos velocidad = menos potencia a igual pendiente
  for (let i = 1; i < tb.length; i++) assert.ok(tb[i].cells[4].p < tb[i - 1].cells[4].p);
});

test("climbTable: oculta lo que supera el umbral y sin FTP no hay %FTP ni rango", () => {
  const tb = C.climbTable(COGS, 56, 90, CIRC, C.CLIMB_GRADES, O, 0, 1000);
  tb.forEach((r) => r.cells.forEach((c) => {
    assert.equal(c.hidden, c.p > 1000);
    assert.equal(c.pct, null);
    assert.equal(c.zone, null);
  }));
  assert.ok(tb[0].cells[7].hidden, "10T, 56T, 15 % a 90 rpm debe quedar oculto");
  assert.ok(!tb[COGS.length - 1].cells[0].hidden, "30T en llano no se oculta");
  const sin = C.climbTable(COGS, 56, 90, CIRC, C.CLIMB_GRADES, O, 0, 0);
  assert.ok(sin.every((r) => r.cells.every((c) => !c.hidden)), "umbral 0 = no oculta nada");
});

// Monotonía: con cada ancla fija, el plato propuesto no baja al subir la potencia.
test("analyze: con los ajustes por defecto, cada opción solo sube o se mantiene al subir la potencia (150–400 W, todos los cassettes)", () => {
  for (const g of C.PRESETS) for (const it of g.items) {
    if (!it.cogs) continue;
    const prev = {};
    for (let P = 150; P <= 400; P += 1) {
      const r = C.analyze(it.cogs, C.solveSpeed(P, O) * 3.6, 90, CIRC, 48, 68, undefined, 6);
      for (const p of r.props) {
        if (p.label === "one") continue;
        // Los extremos del rango (48 y 68 T) rompen la familia por diseño: se comprueba solo en el interior.
        if (p.row.chain <= 50 || p.row.chain >= 66) { delete prev[p.label]; continue; }
        if (prev[p.label] != null) assert.ok(p.row.chain >= prev[p.label], `${it.id} ${p.label} ${P} W: ${prev[p.label]} → ${p.row.chain}`);
        prev[p.label] = p.row.chain;
      }
    }
  }
});

test("analyze: 10-30 a 90 rpm, 200–300 W: platos esperados de cada opción", () => {
  const cogs = C.PRESETS[0].items.find((i) => i.id === "r12-10-30").cogs;
  const esperado = { 200: [56, 50], 220: [58, 52], 250: [60, 54], 280: [64, 56], 300: [66, 58] }; // [grande, pequeño]
  for (const [P, [g, p]] of Object.entries(esperado)) {
    const r = C.analyze(cogs, C.solveSpeed(+P, O) * 3.6, 90, CIRC, 48, 68, undefined, 6);
    assert.equal(r.props.find((x) => x.label === "high").row.chain, g, `${P} W grande`);
    assert.equal(r.props.find((x) => x.label === "low").row.chain, p, `${P} W pequeño`);
  }
});
