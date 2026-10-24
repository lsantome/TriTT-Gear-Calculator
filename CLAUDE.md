# CLAUDE.md — TriTT-Gear-Calculator

Calculadora de desarrollos (plato/cassette) para triatlón y contrarreloj. PWA en GitHub Pages + APK Android (Capacitor). Responde siempre en español.

## Stack
HTML/CSS/JS puros en un único `index.html` (sin dependencias en la app). Node ≥ 22 para build y pruebas; Capacitor 8.5.3, Gradle 8.14.3, AGP 8.13, JDK 21 para Android.

## Comandos
`npm ci` · `npm test` · `npm run build:pwa` (dist/site) · `npm run build:android-web` (dist/app) · `npm run android:sync` · `npm run android:debug` · `npm run android:release`.

## Estructura
`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `fonts/` en la **raíz** · `scripts/` (version.js, build-pwa.js, gradle.mjs) · `android/` + `capacitor.config.json` · `tests/` · `docs/ANDROID.md` · `.github/workflows/` (pages.yml, android.yml). La lógica de cálculo está entre `// ==CALC-START==` y `// ==CALC-END==` en `index.html` y la cargan las pruebas.

## Reglas
- **Nunca** subir claves: keystores, `.jks`, `keystore.properties`, contraseñas ni tokens. Los secretos van en GitHub (ver docs/ANDROID.md).
- No mover el HTML de la raíz.
- No renombrar el repo ni cambiar el `appId` de Android (`io.github.lsantome.trittgears`) ni el `id` del manifest (`/desarrollos-calculadora`): romperían la URL de Pages y las instalaciones existentes.
- Prefijos propios: cachés `desarrollos-<hash>` (el SW solo borra las suyas) y claves `desarrollos:` (el origen lo comparten otras apps). No renombrar claves existentes.
- `versionCode` = 30.000.000 + major·10000 + minor·100 + patch; no reducir el desplazamiento.
- `main` siempre desplegable: cambios por rama + PR. Sin `push --force` ni reescribir historial.
- Commits en español, `tipo: resumen` (`feat`, `fix`, `chore`, `docs`, `test`, `ci`).

## Subir versión
1. Edita `version` en `package.json` y `CHANGELOG.md`. 2. Commit y merge a `main`. 3. `git tag vX.Y.Z` y `git push origin vX.Y.Z` (APK/AAB a la Release).
