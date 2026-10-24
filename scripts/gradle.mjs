#!/usr/bin/env node
// Ejecuta Gradle en android/ con el entorno preparado: comprueba Node/JDK, localiza el Android SDK,
// instala plataforma 36 y build-tools 36.0.0 si faltan y escribe android/local.properties (ignorado por Git).
// Uso (lo llaman los scripts de package.json):  node scripts/gradle.mjs assembleDebug
// La firma de release se lee de ANDROID_KEYSTORE_* o de keystore.properties (ver docs/ANDROID.md).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
const log = (m) => console.log(`\n▶ ${m}`);
const fail = (m) => { console.error(`\n✖ ${m}`); process.exit(1); };
const tasks = process.argv.slice(2);
if (!tasks.length) fail("Indica las tareas de Gradle, p. ej.: node scripts/gradle.mjs assembleDebug");

// En Windows se usa shell (para .bat): las rutas con espacios deben ir entre comillas.
const q = (c) => (isWin && /\s/.test(c) ? `"${c}"` : c);
function run(cmd, args, opts = {}) {
  const r = spawnSync(q(cmd), args, { cwd: root, stdio: "inherit", shell: isWin, ...opts });
  if (r.status !== 0) fail(`Falló: ${cmd} ${args.join(" ")}`);
}

log("Comprobando requisitos");
if (Number(process.versions.node.split(".")[0]) < 22) fail(`Hace falta Node 22 o superior (tienes ${process.versions.node}).`);
const jv = spawnSync("java", ["-version"], { encoding: "utf8", shell: isWin });
const jm = /version "(\d+)/.exec((jv.stderr || "") + (jv.stdout || ""));
if (jv.error || !jm) fail("No encuentro Java. Instala un JDK 21 (ver docs/ANDROID.md) y abre una terminal nueva.");
if (Number(jm[1]) < 21) fail(`Hace falta JDK 21 o superior (tienes ${jm[1]}).`);
console.log(`  Node ${process.versions.node} · Java ${jm[1]}`);

const home = os.homedir();
const sdk = [
  process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT,
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Android", "Sdk"),
  path.join(home, "Library", "Android", "sdk"), path.join(home, "Android", "Sdk"),
].filter(Boolean).find((p) => fs.existsSync(path.join(p, "platforms")) || fs.existsSync(path.join(p, "cmdline-tools")));
if (!sdk) fail("No encuentro el Android SDK. Instala Android Studio o define ANDROID_HOME (ver docs/ANDROID.md).");
console.log(`  Android SDK: ${sdk}`);

const sdkmanager = ["cmdline-tools/latest/bin", "cmdline-tools/bin", "tools/bin"]
  .map((d) => path.join(sdk, d, isWin ? "sdkmanager.bat" : "sdkmanager")).find((p) => fs.existsSync(p));
const missing = !fs.existsSync(path.join(sdk, "platforms", "android-36")) || !fs.existsSync(path.join(sdk, "build-tools", "36.0.0"));
if (missing && sdkmanager) {
  log("Instalando plataforma 36 y build-tools 36.0.0 del SDK");
  const env = { ...process.env, ANDROID_HOME: sdk };
  spawnSync(q(sdkmanager), ["--licenses"], { input: "y\n".repeat(60), stdio: ["pipe", "ignore", "inherit"], shell: isWin, env });
  run(sdkmanager, ["platforms;android-36", "build-tools;36.0.0"], { env });
} else if (missing) {
  console.warn("  Aviso: falta la plataforma 36 o build-tools 36.0.0 y no hay sdkmanager; Gradle intentará descargarlas.");
}
fs.writeFileSync(path.join(root, "android", "local.properties"), `sdk.dir=${sdk.replace(/\\/g, "/")}\n`);

log(`Gradle: ${tasks.join(" ")} (la primera vez descarga dependencias y tarda varios minutos)`);
const androidDir = path.join(root, "android");
if (!isWin) fs.chmodSync(path.join(androidDir, "gradlew"), 0o755);
run(isWin ? "gradlew.bat" : "./gradlew", tasks, { cwd: androidDir, env: { ...process.env, ANDROID_HOME: sdk } });

const outputs = [
  "app/build/outputs/apk/debug/app-debug.apk",
  "app/build/outputs/apk/release/app-release.apk",
  "app/build/outputs/apk/release/app-release-unsigned.apk",
  "app/build/outputs/bundle/release/app-release.aab",
].map((p) => path.join(androidDir, p)).filter((p) => fs.existsSync(p));
console.log("\n✔ Salidas:");
for (const p of outputs) console.log(`  ${path.relative(root, p)}  (${(fs.statSync(p).size / 1048576).toFixed(1)} MB)`);
