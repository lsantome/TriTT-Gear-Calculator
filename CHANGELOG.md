# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido
- `privacidad.html`: política de privacidad pública en español e inglés, publicada con la PWA (exigida por Google Play).
- `docs/play-store/`: textos de la ficha (ES/EN), guía de declaraciones y prueba cerrada de Google Play, y gráficos (icono, gráfico de funciones y capturas).

## [1.0.0] - 2026-10-23

Primera versión con el estándar de repositorios y compilación.

### Añadido
- Proyecto Android (Capacitor 8.5.3) versionado en el repositorio; APK y AAB de release firmados por GitHub Actions al etiquetar `vX.Y.Z`.
- Versión única en `package.json`, sellada en el build (versión, hash y fecha del commit) y visible en la app.
- Scripts `test`, `build:pwa`, `build:android-web`, `android:sync`, `android:debug` y `android:release`.
- Pruebas de infraestructura y de lógica de cálculo; workflows `pages.yml` y `android.yml`.
- `CHANGELOG.md`, `CLAUDE.md`, `docs/ANDROID.md` y `.gitignore`.

### Cambiado
- Etiqueta de versión: ahora `v1.0.0 · build abc1234 · fecha` (`desarrollo` sin sellar).
- La firma de release lee solo de variables de entorno o de `keystore.properties` (ignorado por Git); se retira la clave de depuración con contraseña en texto plano.
- `versionCode` de Android = 30.000.000 + major·10000 + minor·100 + patch.
- El service worker no se registra dentro del APK.

### Funcionalidad de la app (sin cambios en esta versión)
- Medio = plato con la mejor línea de cadena, más uno por arriba y uno por abajo; opción de plato fijo sin simulación; español/inglés; claro/oscuro.
