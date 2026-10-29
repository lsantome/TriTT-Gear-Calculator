# Calculadora de desarrollos

**App (PWA):** https://lsantome.github.io/TriTT-Gear-Calculator/

Calculadora para triatlón y contrarreloj. Dado el cassette, la potencia media y la cadencia objetivo, estima la velocidad en llano y propone **dos opciones alternativas de plato** (A y B, de dentado par) con la mejor línea de cadena, según cuál de los dos piñones centrales del cassette prefieras usar, junto con la tabla de velocidades de cada marcha y una tabla de **subidas** (potencia y % de FTP por pendiente). También puede analizar un **plato fijo** que tú indiques, sin simulación. Funciona sin conexión.

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
4. Lee las dos tarjetas (Opción A / Opción B) y la tabla de velocidades por marcha. Son **alternativas para un mismo plato** (no una pareja de platos de un 2x) y la explicación sobre ellas dice cuándo elegir cada una.
5. **Subidas.** El desplegable «Subidas» (cerrado por defecto, pensado para usuarios avanzados) da la potencia que cuesta mantener, a tu cadencia objetivo, la velocidad de cada piñón en pendientes del 0 al 15 % (elige Opción A u Opción B). Si indicas tu **FTP**, cada celda muestra también el % de FTP y se colorea según el esfuerzo típico de ese rango (leyenda bajo la tabla). Las celdas de más de 1000 W se ocultan.

La versión instalada se ve bajo el título: `v1.0.0 · build abc1234 · 2026-10-23` (`desarrollo` si se abre `index.html` sin compilar).

## Modelo de cálculo

Potencia en rueda = potencia × eficiencia = ½·ρ·CdA·v³ + Crr·m·g·v, en llano y sin viento. En la tabla de subidas se añade la gravedad: potencia en pedal = (½·ρ·CdA·v³ + m·g·v·(Crr·cosθ + sinθ)) ÷ eficiencia, con θ = arctan(pendiente), velocidad constante, sin viento ni inercias. Valores por defecto: CdA 0,23 m², masa 85 kg, Crr 0,004, ρ 1,19 kg/m³, eficiencia 97,5 %, rueda 700×28c (2136 mm).

Solo se simulan platos de dentado par. Para cada uno se busca el piñón más cercano a la velocidad objetivo; **encaja** si ese piñón está en la banda central del cassette (un tercio de los piñones, mínimo 3) y la cadencia necesaria queda dentro de la tolerancia (±6 rpm por defecto). Con un número par de piñones en la banda central hay **dos piñones centrales** igual de buenos, y cada uno pide un plato distinto para dar casi la misma relación: la **opción A** se apoya en el piñón central mayor (y pide el plato mayor) y la **opción B** en el menor (y pide el plato menor); no son dos platos de un 2x, sino alternativas para un mismo plato; en cada uno se elige el plato par que encaja con menor error de velocidad. Si la banda tiene un número impar de piñones, hay un único piñón central y una única propuesta. La app avisa si alguna de las dos opciones no tiene plato que encaje dentro del rango ensayado.

Anclar cada opción siempre al mismo piñón hace que, al subir la potencia, el plato propuesto solo suba o se mantenga. Con los ajustes por defecto (90 rpm, rango 48–68 T) esto se comprueba en las pruebas para todos los cassettes de la lista de 150 a 400 W, salvo en los extremos del rango (≤ 50 T o ≥ 66 T), donde la familia de platos puede salirse del rango; si cambias la cadencia o la tolerancia, no está garantizado.

## Limitaciones

- La velocidad objetivo y la elección del plato suponen perfil llano y sin viento: con subidas o viento cambia la velocidad media real y, con ella, el piñón óptimo.
- Tabla de subidas: es una estimación, no un perfil de recorrido. Usa el mismo CdA que en llano (en una subida real cambia la postura) y la cadencia objetivo en todos los piñones, así que a pendientes altas con piñones pequeños salen potencias inasumibles a propósito. Con terreno variable la potencia normalizada es mayor que la media, y el % de FTP de la tabla es el de potencia constante.
- Leyenda de esfuerzo por % de FTP: valores típicos de IF por tipo de esfuerzo de Coggan, publicados por TrainingPeaks. No son límites de duración individuales y no cubren esfuerzos de más de 2,5 h.
- Se asume plato único (1x) o el plato grande de un 2x.
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
