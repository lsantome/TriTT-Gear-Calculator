# Calculadora de desarrollos

**App (PWA):** https://lsantome.github.io/TriTT-Gear-Calculator/

Calculadora para triatlón y contrarreloj. Dado el cassette, la potencia media y la cadencia objetivo, estima la velocidad en llano y propone **tres platos de dentado par y correlativos**: el **medio** es el de mejor línea de cadena, con uno por arriba y otro por abajo, junto con la tabla de velocidades de cada marcha. También puede analizar un **plato fijo** que tú indiques, sin simulación. Funciona sin conexión.

- Español e inglés (español por defecto) y modo claro/oscuro (claro por defecto).
- Cassettes SRAM Red/Force de 11, 12 y 13 velocidades, Shimano de 11 y 12 velocidades y cassette personalizado de 11 a 13 piñones.
- Sin dependencias en la app: HTML, CSS y JavaScript puros, sin recursos externos.

## Instalación

**PWA (móvil u ordenador).** Abre la URL de arriba. En iOS usa *Añadir a pantalla de inicio*; en Android y en Chrome/Edge de escritorio, *Instalar app*.

**APK (Android).** Descarga el `.apk` de la última [Release](https://github.com/lsantome/TriTT-Gear-Calculator/releases), permite «instalar apps desconocidas» para la aplicación desde la que lo abres e instálalo. Para actualizar, instala el APK nuevo encima; no hace falta desinstalar. Si la Release dice «depuración» (`-debug.apk`), se compiló sin la clave de release y no se instala sobre una versión firmada con ella.

## Uso

1. Elige el cassette (o escribe los piñones en «Personalizado»).
2. Indica potencia media, cadencia objetivo y CdA (0,23 m² por defecto). La velocidad objetivo se calcula con el modelo de abajo.
3. Ajusta el rango de platos a simular, o fija un plato concreto.
4. Lee las tres tarjetas (Grande / Medio / Bajo) y la tabla de velocidades por marcha.

La versión instalada se ve bajo el título: `v1.0.0 · build abc1234 · 2026-10-23` (`desarrollo` si se abre `index.html` sin compilar).

## Modelo de cálculo

Potencia en rueda = potencia × eficiencia = ½·ρ·CdA·v³ + Crr·m·g·v, en llano y sin viento. Valores por defecto: CdA 0,23 m², masa 85 kg, Crr 0,004, ρ 1,19 kg/m³, eficiencia 97,5 %, rueda 700×28c (2136 mm).

Solo se simulan platos de dentado par. Para cada uno se busca el piñón más cercano a la velocidad objetivo; **encaja** si ese piñón está en la banda central del cassette (un tercio de los piñones, mínimo 3) y la cadencia necesaria queda dentro de la tolerancia (±6 rpm por defecto). **Medio** es el plato que encaja con el piñón más centrado (a igualdad, el de menor error de velocidad); **Grande** es Medio + 2 dientes y **Bajo** es Medio − 2. La app avisa si Medio está en el borde del rango y falta una de las dos.

## Limitaciones

- Perfil llano y sin viento: con subidas o viento cambia la velocidad media real y, con ella, el piñón óptimo.
- Se asume plato único (1x) o el plato grande de un 2x.
- Con dos piñones centrales (cassettes de piñones pares), «Medio» puede saltar entre dos familias de platos al variar la potencia, porque ambos están igual de centrados.
- Los dentados de SRAM están contrastados con fichas del fabricante y tiendas; los de Shimano son los habituales de la serie y **no están verificados contra fichas oficiales**. Si el tuyo difiere, usa «Personalizado».

## Datos y privacidad

Política de privacidad pública: https://lsantome.github.io/TriTT-Gear-Calculator/privacidad.html (también la usa la ficha de Google Play). La app no envía nada a ningún servidor ni usa analítica. Solo guarda en el dispositivo el idioma y el tema (claves `desarrollos:lang` y `desarrollos:theme` en `localStorage`). **La PWA y el APK no comparten datos**: cada uno guarda su propio idioma y tema. No hay ficheros de exportación.

## Desarrollo

Requisitos: Node ≥ 22. Para Android, además JDK 21 y Android SDK (ver [docs/ANDROID.md](docs/ANDROID.md)).

```bash
npm ci
npm test                  # pruebas de infraestructura y de lógica
npm run build:pwa         # dist/site  (lo que se publica en Pages)
npm run build:android-web # dist/app   (la web que entra en el APK, sin service worker)
npm run android:sync      # build:android-web + cap sync
npm run android:debug     # APK de depuración
npm run android:release   # APK + AAB de release (firmados si hay credenciales)
```

| Ruta | Función |
|---|---|
| `index.html` | Interfaz, cálculo y textos en ambos idiomas |
| `privacidad.html` | Política de privacidad (ES/EN), solo en la web; la exige Google Play |
| `docs/play-store/` | Textos de la ficha de Google Play, guía de declaraciones y gráficos |
| `manifest.webmanifest`, `sw.js`, `icons/`, `fonts/` | PWA (fuentes IBM Plex y Barlow Semi Condensed, licencia SIL OFL 1.1) |
| `scripts/` | `version.js` (sellado de versión), `build-pwa.js`, `gradle.mjs` |
| `android/`, `capacitor.config.json` | Proyecto Android (Capacitor 8.5.3) |
| `tests/` | Pruebas (`node --test`) |
| `.github/workflows/` | `pages.yml` (PWA) y `android.yml` (APK/AAB) |

### Convivencia con otras apps en `lsantome.github.io`

Todas comparten origen, y por tanto `localStorage` y el espacio de cachés. Esta app usa cachés `desarrollos-<hash>` (el service worker solo borra las suyas), claves `desarrollos:` y el `id` de manifest `/desarrollos-calculadora`, que identifica la PWA instalada y **no debe cambiar** (ni coincidir con el de otra app).

## Releases

La versión sale de `package.json` (semver). Para publicar `X.Y.Z`: edita `version` y `CHANGELOG.md`, haz commit, crea la etiqueta `vX.Y.Z` y súbela; `android.yml` compila y adjunta APK y AAB a la Release. La PWA se despliega sola al hacer merge a `main` (*Settings → Pages → Source = GitHub Actions*). Detalle en [docs/ANDROID.md](docs/ANDROID.md).

## Licencia

[MIT](LICENSE). Las fuentes conservan sus propias licencias en `fonts/`.
