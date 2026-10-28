"use strict";
// Coherencia de la documentación con el código.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, read, buildTo } = require("./helpers.js");

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
  const out = buildTo();
  assert.ok(fs2.existsSync(path.join(out, "site", "privacidad.html")));
  assert.ok(!fs2.existsSync(path.join(out, "app", "privacidad.html")));
  fs2.rmSync(out, { recursive: true, force: true });
});

test("README: enlaza la política de privacidad publicada", () => {
  assert.ok(read("README.md").includes("https://lsantome.github.io/TriTT-Gear-Calculator/privacidad.html"));
});

test("ficha de Play: textos dentro de los límites de Google (30 / 80 / 4000)", () => {
  const txt = read("docs/play-store/ficha.md");
  const blocks = [...txt.matchAll(/```([\w-]+)\n([\s\S]*?)```/g)].map((m) => [m[1], m[2].replace(/\n$/, "")]);
  const limits = { nombre: 30, corta: 80, larga: 4000 };
  assert.equal(blocks.length, 6, "se esperan 6 bloques: nombre, corta y larga en es y en");
  for (const [tag, body] of blocks) {
    const [kind] = tag.split("-");
    assert.ok(limits[kind], `bloque desconocido ${tag}`);
    assert.ok([...body].length <= limits[kind], `${tag}: ${[...body].length} > ${limits[kind]}`);
    if (kind === "corta") assert.doesNotMatch(body, /\p{Extended_Pictographic}/u, `${tag}: sin emojis`);
  }
});

test("gráficos de Play: dimensiones y formato (PNG sin transparencia salvo el icono)", () => {
  const dir = path.join(ROOT, "docs", "play-store", "graficos");
  const dims = (f) => {
    const b = fs.readFileSync(path.join(dir, f));
    assert.equal(b.subarray(1, 4).toString(), "PNG", `${f} no es PNG`);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25], size: b.length };
  };
  const icon = dims("icono-512.png");
  assert.deepEqual([icon.w, icon.h], [512, 512]);
  assert.ok(icon.size <= 1024 * 1024, "el icono supera 1024 KB");
  for (const l of ["es", "en"]) {
    const g = dims(`grafico-funciones-${l}.png`);
    assert.deepEqual([g.w, g.h], [1024, 500]);
    assert.notEqual(g.colorType, 6, "el gráfico de funciones no puede tener canal alfa");
    const caps = fs.readdirSync(dir).filter((f) => f.startsWith(`captura-${l}-`));
    assert.ok(caps.length >= 4, `al menos 4 capturas en ${l}`);
    for (const f of caps) {
      const c = dims(f);
      assert.deepEqual([c.w, c.h], [1080, 1920], f);
      assert.notEqual(c.colorType, 6, `${f} no puede tener canal alfa`);
    }
  }
});
