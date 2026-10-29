# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Cambiado
- Los tres platos Grande / Medio / Bajo (Medio ±2 dientes) pasan a **dos opciones alternativas**: «Opción A» y «Opción B», apoyadas respectivamente en el piñón central mayor y en el menor del cassette (alternativas para un mismo plato, no un 2x), con una explicación para el usuario. Así el plato propuesto ya no salta entre dos familias al subir la potencia (antes, p. ej. 56 → 50 → 58 → 52 T entre 200 y 220 W en un 10-30). Con una banda de nº impar de piñones hay una única propuesta. Cierra el pendiente del desempate de «Medio».
- Capturas y gráfico de funciones de la ficha de Google Play regenerados con la nueva interfaz; se añade una captura de la tabla de subidas.

### Añadido
- Desplegable «Subidas» (cerrado por defecto): potencia necesaria (W) para mantener la velocidad de cada piñón a la cadencia objetivo en pendientes del 0 al 15 %, para la opción A o B (o el plato fijo). Nueva entrada opcional **FTP**: la tabla añade el % de FTP y colorea cada celda por rango de esfuerzo, con leyenda. Las celdas de más de 1000 W se ocultan.
- `privacidad.html`: política de privacidad pública en español e inglés, publicada con la PWA (exigida por Google Play).
- `docs/play-store/`: textos de la ficha (ES/EN), guía de declaraciones y prueba cerrada de Google Play, y gráficos (icono, gráfico de funciones y capturas).

### Corregido
- Los campos de entrada ya no vuelven a calcular al perder el foco (solo al editar), lo que hacía perder el primer clic en los controles de los resultados.
- Pruebas: cada prueba compila en una carpeta temporal propia (`BUILD_OUT_DIR`) en vez de compartir `dist/`; al ejecutarse en paralelo se pisaban y fallaba el CI de forma intermitente, lo que impidió desplegar `privacidad.html` en Pages.

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
