# Android (Capacitor)

El APK es la misma web empaquetada con [Capacitor](https://capacitorjs.com/) 8.5.3 (`dist/app`, sin service worker). Funciona sin conexión y no depende de GitHub Pages.

- `appId`: `io.github.lsantome.trittgears` (**no cambiar**: identifica la app en Android y en Google Play).
- Versiones fijadas: Capacitor 8.5.3, Gradle 8.14.3, Android Gradle Plugin 8.13.0, compileSdk/targetSdk 36, minSdk 24, JDK 21, Node 22.
- **Funciones nativas propias: ninguna.** `MainActivity` es la de Capacitor por defecto y el único permiso es `INTERNET` (el de Capacitor por defecto). Impresión, compartir, pantalla encendida, etc. no están implementadas.

## Versiones

`versionName` = `version` de `package.json`. `versionCode` = `30000000 + major·10000 + minor·100 + patch` (1.0.0 → 30010000). El desplazamiento de 30.000.000 existe porque el esquema anterior usaba minutos desde 1970 (~29,9 millones en octubre de 2026); **no lo reduzcas**, o Android rechazaría actualizaciones sobre esas instalaciones. Android exige que cada versión publicada tenga un `versionCode` mayor, así que sube siempre la versión de `package.json`.

## Compilar en local

Una sola vez, en Windows (PowerShell):

```powershell
winget install EclipseAdoptium.Temurin.21.JDK
winget install OpenJS.NodeJS.LTS            # Node 22 o superior
winget install Google.AndroidStudio         # trae el Android SDK
```

Abre Android Studio una vez, completa el asistente (instala el SDK en `%LOCALAPPDATA%\Android\Sdk`) y ciérralo. Si tu SDK está en otra ruta, define `ANDROID_HOME`. `scripts/gradle.mjs` comprueba Node y JDK, localiza el SDK, instala plataforma 36 y build-tools 36.0.0 si faltan y escribe `android/local.properties` (ignorado por Git). Usa una ruta corta (`C:\dev\...`): Windows limita las rutas largas.

```bash
npm ci
npm run android:debug     # APK de depuración  -> android/app/build/outputs/apk/debug/app-debug.apk
npm run android:release   # APK + AAB de release -> android/app/build/outputs/{apk,bundle}/release/
```

Sin credenciales de firma, `android:release` genera binarios **sin firmar** (`app-release-unsigned.apk`).

## Crear el keystore de release (una vez por app)

Una clave por app, **nunca dentro del repositorio**. Ejecuta tú el comando (te pedirá las contraseñas por teclado; no las escribas en ningún fichero del repo):

```bash
keytool -genkeypair -v -keystore release.keystore -alias <alias> -keyalg RSA -keysize 2048 -validity 10000
```

Apunta el alias y las dos contraseñas. **Copia de seguridad fuera del PC** (gestor de contraseñas o similar) del fichero `.keystore`, el alias y las contraseñas: es lo único irrecuperable del proyecto. Con otra clave, las actualizaciones no se instalan sobre la versión anterior.

### Firmar en local

Define variables de entorno (`ANDROID_KEYSTORE_PATH` con ruta absoluta, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) o crea `keystore.properties` en la raíz (ignorado por Git):

```properties
storeFile=C:/ruta/absoluta/release.keystore
storePassword=<contraseña del keystore>
keyAlias=<alias>
keyPassword=<contraseña de la clave>
```

### Firmar en GitHub Actions

Codifica el keystore en base64 y copia el resultado al portapapeles:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Set-Clipboard   # Windows
```
```bash
base64 -w0 release.keystore                                                             # Linux/macOS
```

En el repositorio: *Settings → Secrets and variables → Actions → New repository secret*, y crea estos cuatro:

| Secreto | Contenido |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | El base64 del keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_ALIAS` | Alias de la clave |
| `ANDROID_KEY_PASSWORD` | Contraseña de la clave |

Sin los cuatro, `android.yml` genera un APK de **depuración**, lo avisa en el log y lo marca como *pre-release*.

## Publicar una versión

1. Edita `version` en `package.json` y añade la entrada en `CHANGELOG.md`.
2. `git commit` y merge a `main` (despliega la PWA).
3. Crea la etiqueta `vX.Y.Z` (debe coincidir con `package.json`; el CI falla si no), de una de estas dos formas:
   - Por consola: `git tag vX.Y.Z` y `git push origin vX.Y.Z`. El workflow crea la Release.
   - Desde la web: *Releases → Draft a new release → Choose a tag → escribe `vX.Y.Z` → Create new tag on publish* (destino `main`), pon título y notas y publícala. El workflow se lanza con la etiqueta y **adjunta APK y AAB a esa Release** (no hace falta subirlos a mano).
4. `android.yml` compila, firma, verifica el APK con `apksigner` y adjunta APK y AAB a la Release. También puedes lanzarlo a mano (*Actions → Android → Run workflow*): sube los binarios como artefacto sin crear Release.

## Google Play

Play exige el **AAB** (no el APK), una cuenta de desarrollador y una política de privacidad publicada. Las cuentas personales nuevas necesitan además un mínimo de testers en pruebas cerradas durante un periodo antes de pedir acceso a producción; consulta los requisitos vigentes en la ayuda de Play Console.
