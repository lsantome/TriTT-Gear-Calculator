# Ficha de Google Play: textos

Textos para *Play Console → Crecer → Presencia en la tienda → Ficha de Play Store principal*. Límites oficiales ([ayuda de Play](https://support.google.com/googleplay/android-developer/answer/9859152)): nombre 30, descripción corta 80, descripción completa 4.000 caracteres. La descripción corta no admite emojis ni llamadas a la acción. Los bloques de código se cuentan en las pruebas (`tests/docs.test.js`); copia solo el contenido de cada bloque.

Idioma predeterminado: español. Añade el inglés como traducción.

## Español (es-ES)

**Nombre de la app**
```nombre-es
Calculadora de desarrollos
```

**Descripción breve**
```corta-es
Calcula el plato y el piñón que encajan con tu potencia, cadencia y cassette.
```

**Descripción completa**
```larga-es
Calculadora de desarrollos para triatlón y contrarreloj. Dices qué cassette montas, qué potencia media y qué cadencia quieres sostener, y la app estima tu velocidad en llano y propone el plato con la mejor línea de cadena.

QUÉ HACE
• Estima la velocidad a partir de tu potencia con un modelo físico: resistencia aerodinámica (CdA, densidad del aire), rodadura (masa, Crr), eficiencia de la transmisión y circunferencia de la rueda.
• Propone tres platos de dentado par y correlativos: uno medio, con la mejor línea de cadena (piñones centrales del cassette), y uno por arriba y otro por abajo.
• Muestra, para cada propuesta, el piñón de trabajo, la velocidad que da a tu cadencia, la cadencia necesaria para tu velocidad objetivo y una tabla con la velocidad de cada marcha.
• Modo de plato fijo: indica el plato que ya montas y analiza solo ese, sin simular otros tamaños.
• También puedes fijar una velocidad objetivo directamente, sin pasar por la potencia.

CASSETTES
• Cassettes de 11, 12 y 13 velocidades de SRAM y de 11 y 12 velocidades de Shimano.
• Cassette personalizado: escribe los dientes de 11 a 13 piñones.

AJUSTES
• Rango de platos a ensayar, anchura de la banda central y tolerancia de cadencia.
• Masa, Crr, densidad del aire, eficiencia y circunferencia de la rueda.

CARACTERÍSTICAS
• Español e inglés, modo claro y oscuro.
• Funciona sin conexión.
• Sin anuncios, sin cuentas y sin recopilar datos: todo el cálculo se hace en tu dispositivo.

LIMITACIONES
• El modelo supone terreno llano y sin viento. Con subidas o viento, la velocidad media real y el piñón óptimo cambian.
• Es una estimación para orientar la elección y no sustituye una puesta a punto profesional.
• Los dentados de SRAM están contrastados con fichas de fabricante y tiendas. Los de Shimano son los habituales de cada serie: comprueba el tuyo o usa el cassette personalizado.

SRAM y Shimano son marcas de sus respectivos propietarios. Esta aplicación es independiente y no está afiliada ni respaldada por ellos. Se citan solo para indicar la compatibilidad con sus cassettes.
```

## English (en-US)

**App name**
```nombre-en
Chainring Gear Calculator
```

**Short description**
```corta-en
Find the chainring and sprocket that fit your power, cadence and cassette.
```

**Full description**
```larga-en
Gear calculator for triathlon and time trial. Tell it which cassette you run and what average power and cadence you want to hold, and it estimates your flat-road speed and suggests the chainring with the best chain line.

WHAT IT DOES
• Estimates speed from your power with a physical model: aerodynamic drag (CdA, air density), rolling resistance (mass, Crr), drivetrain efficiency and wheel circumference.
• Suggests three consecutive even-toothed chainrings: a middle one with the best chain line (central sprockets of the cassette), plus one size up and one down.
• For each suggestion it shows the working sprocket, the speed it gives at your cadence, the cadence needed for your target speed and a table with the speed in every gear.
• Fixed chainring mode: enter the chainring you already run and only that one is analysed, with no other sizes simulated.
• You can also set a target speed directly, bypassing power.

CASSETTES
• SRAM 11-, 12- and 13-speed and Shimano 11- and 12-speed cassettes.
• Custom cassette: type the tooth counts for 11 to 13 sprockets.

SETTINGS
• Chainring range to test, width of the central band and cadence tolerance.
• Mass, Crr, air density, efficiency and wheel circumference.

FEATURES
• Spanish and English, light and dark mode.
• Works offline.
• No ads, no accounts and no data collection: all calculations run on your device.

LIMITATIONS
• The model assumes flat ground and no wind. With climbs or wind, the real average speed and the best sprocket change.
• It is an estimate to guide your choice and does not replace a professional bike fit.
• SRAM tooth counts were checked against manufacturer sheets and retailers. Shimano ones are the usual counts for each series: check yours or use the custom cassette.

SRAM and Shimano are trademarks of their respective owners. This app is independent and is not affiliated with or endorsed by them. They are named only to indicate cassette compatibility.
```

## Datos de contacto de la ficha

- Correo electrónico: rinchasoft@gmail.com (el de la cuenta de desarrollador; Play lo muestra públicamente).
- Sitio web (opcional): https://lsantome.github.io/TriTT-Gear-Calculator/
- Política de privacidad: https://lsantome.github.io/TriTT-Gear-Calculator/privacidad.html

## Categoría

La categoría se elige en *Presencia en la tienda → Configuración de la app*. Opciones razonables: **Deportes** o **Herramientas**. No he comprobado la lista actual de categorías de Play Console: elige la que aparezca más cercana.

## Gráficos

En `docs/play-store/graficos/`: icono 512×512, gráfico de funciones 1024×500 y capturas de teléfono 1080×1920 en español (`es-*`) y en inglés (`en-*`). Sube las de cada idioma a su traducción.
