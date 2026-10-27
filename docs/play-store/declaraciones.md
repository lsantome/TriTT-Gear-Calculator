# Google Play: cuenta, declaraciones y prueba cerrada

Guía para pasar la validación de una **cuenta personal nueva**. Cada punto cita la ayuda oficial de Google. Lo marcado como *(sin verificar)* viene de mi conocimiento y debe comprobarse en la consola, porque Google cambia nombres y pasos. Última comprobación de las fuentes: 27/10/2026.

## 1. Cuenta de desarrollador

Fuente: [verificación de la cuenta](https://support.google.com/googleplay/android-developer/answer/10841920).

- Documento de identidad oficial, si el perfil de pagos no está verificado.
- **Nombre legal y dirección: públicos**, tomados del perfil de pagos.
- Correo público de la ficha: `rinchasoft@gmail.com`, verificado con un código de seis dígitos.
- Teléfono y correo de contacto no públicos, verificados.
- Comprobación de que tienes un **móvil Android real**, con la app móvil de Play Console.
- La cuenta debe estar verificada antes de enviar apps a revisión.
- Cuota de registro de 25 USD, pago único *(sin verificar ahora)*.

## 2. Crear la app

Fuente: [crear y configurar la app](https://support.google.com/googleplay/android-developer/answer/9859152).

| Campo | Valor |
|---|---|
| Nombre | Calculadora de desarrollos (ver `ficha.md`) |
| Idioma predeterminado | Español (España) |
| Tipo | Aplicación (no juego) |
| Gratuita o de pago | Gratuita. *Una app gratuita no puede pasar a ser de pago más adelante* *(sin verificar)* |
| Correo de contacto | rinchasoft@gmail.com |
| Nombre del paquete | `io.github.lsantome.trittgears`. **Es definitivo** una vez subida la primera versión |

## 3. Contenido de la app (declaraciones)

Fuente: [contenido de la app](https://support.google.com/googleplay/android-developer/answer/9867159) y [Seguridad de los datos](https://support.google.com/googleplay/android-developer/answer/10787469). Respuestas coherentes con lo que hace la app (comprobado en el código: sin peticiones de red, sin anuncios, sin cuentas; solo guarda idioma y tema).

| Declaración | Qué responder |
|---|---|
| Política de privacidad | `https://lsantome.github.io/TriTT-Gear-Calculator/privacidad.html` |
| Anuncios | No contiene anuncios |
| Acceso a la app | Todo el contenido es accesible sin credenciales ni instrucciones especiales |
| Clasificación de contenido | Cuestionario IARC: categoría de utilidad o herramienta y **«No»** a todas las preguntas sobre violencia, contenido sexual, drogas, apuestas, contenido generado por usuarios, compras o ubicación |
| Público objetivo | Solo **18 años o más** (es una herramienta para deportistas adultos). No marques tramos de menores. Si marcas menores, se aplica la Política de Familias. No uses en la ficha elementos que atraigan a niños |
| Seguridad de los datos | «**No**, mi app no recopila ni comparte ninguno de los tipos de datos de usuario requeridos». Indica la URL de la política. Los datos que no salen del dispositivo no cuentan como «recopilados». Aun así el formulario es obligatorio |
| ID de publicidad | No usa el ID de publicidad *(sin verificar el texto exacto)* |
| Otras declaraciones (finanzas, salud, noticias, gobierno…) | «No» en todas: la app no tiene funciones de ese tipo. Play puede mostrar más o menos según el tipo de app |

## 4. Requisitos técnicos

- **Nivel de API:** las apps nuevas deben apuntar a Android 16 (API 36) desde el 31/08/2026 ([fuente](https://support.google.com/googleplay/android-developer/answer/11926878)). La app ya apunta a 36.
- **Formato:** hay que subir un **AAB**. El de cada Release de GitHub (`TriTT-Gear-Calculator-X.Y.Z.aab`) sirve.
- **Firma de Play (Play App Signing)** *(sin verificar ahora)*: al crear la app, Google guarda la clave de firma definitiva y tu keystore pasa a ser la **clave de subida**. Las instalaciones desde Play llevan otra firma que las del APK de GitHub, así que **no se actualizan entre sí**: el APK de GitHub y la versión de Play son instalaciones distintas.
- **Versiones:** cada subida necesita un `versionCode` mayor que la anterior. Súbelo con `package.json` (ver `docs/ANDROID.md`).

## 5. Prueba cerrada obligatoria

Fuente: [requisitos de prueba para cuentas personales](https://support.google.com/googleplay/android-developer/answer/14151465).

1. *Probar y publicar → Pruebas → Pruebas cerradas*: crea una pista y sube el AAB.
2. Añade **al menos 12 testers** y consigue que se inscriban con el enlace de la prueba. Deben permanecer inscritos **14 días seguidos**. Quien se da de baja y vuelve no suma el tiempo anterior.
3. Consejo mío: recluta 15-20 personas para tener margen ante bajas, y pídeles que usen la app de verdad durante esas dos semanas. Google valora la actividad.
4. Pasados los 14 días, en el panel pulsa **Solicitar acceso a producción** y responde tres bloques:
   - *Sobre tu prueba cerrada:* cómo reclutaste, si usaron todas las funciones y qué feedback recibiste.
   - *Sobre tu app:* público objetivo y valor que aporta.
   - *Preparación para producción:* qué cambiaste tras el feedback y cómo decidiste que estaba lista.
5. Google responde normalmente en unos 7 días. Si ve pocos testers o poca actividad, puede pedirte que sigas la prueba.

Para dar de alta a los testers se puede usar una lista de correos o un Grupo de Google *(sin verificar)*. Cada tester necesita una cuenta de Google y un móvil Android.

## 6. Después de la aprobación

Crea la versión de producción con el AAB, completa países y precios (gratuita) y envía a revisión. Las revisiones pueden tardar hasta 7 días o más.
