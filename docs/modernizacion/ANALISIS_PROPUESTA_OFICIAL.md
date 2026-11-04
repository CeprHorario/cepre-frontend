# Análisis de la propuesta oficial y validada

Fecha: 2026-11-03. Referencia visual solicitada por el cliente:
[maqueta oficial](propuestas/monitor.html) e [índice de evidencias](propuestas/README.md).
Este documento analiza; **no modifica, corrige ni encarga implementar Partes**.
Las reglas trasladables al resto del sistema están en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## 1. Alcance, fuentes y método

- Lectura completa de HTML, CSS y JavaScript de `propuestas/monitor.html`, incluidos
  estados, delegación de eventos, temporizadores, validación local y foco.
- Revisión de capturas de tabla, móvil, tooltip, horas, estado, observaciones,
  carga pendiente y previsualización íntegra. Las 15 capturas existentes se conservan.
- Inspección exploratoria en Chromium mediante CLI gestionada 0.1.21, servida
  localmente, sin API, autenticación, datos reales ni subida de archivos.
- Contraste con manifiesto, `Button`/`IconButton`, `RowActions`, `Field`,
  `Dialog`/`Drawer`, `CursosPage` y contratos funcionales del producto.
- Consulta de documentación oficial de Floating UI para resolver las ayudas y
  superficies flotantes de los **otros módulos**, sin instalar dependencias.

Las 66 comprobaciones citadas por la propuesta son su antecedente documental;
**no se presentan como 66 pruebas repetidas en este análisis**. Tampoco se declara
auditoría integral WCAG, lector de pantalla, Firefox/WebKit ni integración real.
Se registró una huella de archivos antes del trabajo para comprobar la conservación
de la propuesta, fuentes, recursos, tests y manifiestos al terminar.

## 2. La decisión principal: el dato es la entrada a la tarea

La maqueta no es un dashboard de indicadores ni un formulario desplegado. Su unidad
es el bloque de clase, comparable en una tabla. Horas, estado, observaciones e
imagen son a la vez información y entradas contextuales a tareas pequeñas.

```
Cabecera institucional discreta / ubicación / cuenta
Título de tarea                          pendientes / hora
Contexto breve: fecha · aula · turno · monitor
Línea mínima | tabla protagonista y acciones junto al dato
             └ clic o teclado → modal de una tarea → vuelta al origen
```

El cliente no está eligiendo «poner más iconos»: está eligiendo **menos lectura
previa, reconocimiento visual y edición situada**. La información secundaria se
resuelve cuando hace falta, no con instrucciones permanentes o paneles duplicados.
El resultado no debe generalizarse como «todas las pantallas son tablas de siete
filas» ni como «todo debe abrir un modal».

## 3. Composición y densidad

- Cabecera blanca, logo pequeño, ubicación con separador y cuenta alineada a la
  derecha. Un título de tarea; no hay bienvenida, eslogan ni descripción redundante.
- La barra oscura de laboratorio y el reloj simulado son controles de demostración,
  **no requisitos del producto**.
- Fondo gris frío y una superficie blanca dominante con borde guinda superior de
  3 px, radio de 12 px y sombra suave. Los bordes internos organizan los datos;
  no se dibuja una tarjeta independiente para cada celda.
- El contexto está fuera de la tabla, en chips de 34 px: icono categórico, valor y
  etiqueta únicamente cuando ayuda. No son botones ni filtros.
- El espacio de trabajo usa `minmax(0,1fr)` y `min-height:0`; el scroll queda en
  `.board-scroll`. No hay otro contenedor estrecho dentro del área disponible.
- La cabecera agrupada ocupa 54 px y es sticky en dos niveles. Horario programado
  y real reúnen inicio/fin; capturas conserva subcolumnas Inicio/Fin.
- Anchos relativos: número 4 %, programado 8 %, real 8,5 %, curso 14 %, docente
  16,5 %, estado 15 %, observaciones 20 % y cada captura 7 %.
- Las siete filas reparten el alto restante. Esto funciona por el fixture finito;
  **no justifica estirar filas de catálogos paginados ni fijar siete registros**.
- Predomina alineación izquierda en contenido; cabeceras centradas, horas tabulares,
  separadores tenues y más ancho para notas que para códigos.

## 4. Tipografía y forma

El CSS declara Montserrat para títulos y Open Sans para operación, con Arial como
fallback; el HTML no carga por sí mismo esas fuentes. En el sistema se reutiliza
la carga institucional existente, no se copia una fuente desde la demo.

Título 26 px, reducido a 22 px con poca altura; modal 20 px, 18 px en móvil.
Los datos principales rondan 12–13 px; numerosos secundarios usan 9–11 px. Esa
microtipografía y los controles muy pequeños son **medidas observadas, no mínimos
autorizados para el resto del producto**. La nueva norma conserva la jerarquía con
texto secundario legible, objetivos táctiles suficientes y zoom.

Iniciales de persona y abreviaturas de curso comparten forma rectangular redondeada,
tamaño y peso. Ayudan a escanear, pero no sustituyen el nombre visible. El curso
admite dos líneas; nombre y correo del docente usan elipsis. No hay solución
universal de recuperación del texto truncado: los otros módulos deben garantizar
su acceso por foco/tap/detalle, no solo por hover.

Las mayúsculas se restringen principalmente a cabeceras cortas de tabla. No hay
que convertir títulos, mensajes, formularios y navegación en mayúsculas.

## 5. Gramática del color

| Papel observado | Color / fondo | Qué comunica |
|---|---|---|
| Marca y acción | Guinda `#661124`, hover `#7d1b32` | Borde institucional, acción principal, selección |
| Estructura y lectura | Marino `#1c2140`, tinta `#191b28` | Títulos, texto, tooltip y toast |
| Base | Fondo `#f4f5f7`, blanco, suave `#f8f9fc` | Separar soporte de superficie de trabajo |
| Límites | `#e2e3ea` / `#d2d4df` | Jerarquía de separación y controles |
| Actualidad | Azul `#25608f` / `#eef6fd` | Fila en curso, reloj y punto temporal |
| Estado positivo | Verde `#24614b` / `#eaf5ef` | Normal o captura asociada, según el ámbito |
| Atención | Ámbar `#86570b` / `#fff4dc` | Tardanza, propuesta o archivo pendiente |
| Incidencia | Rojo `#a92b34` / `#fff0f1` | Dato exigible faltante, emergencia o retirada pendiente |
| Sustitución/categoría | Violeta `#5b4389` / `#f1edf9` | Reemplazo normal y ciertas categorías |

El color es pequeño y localizado: iconos, fondos suaves, chips y una fila relevante.
No se colorea toda la pantalla ni se compite con grandes banners. Borde discontinuo
y símbolos refuerzan vacío/pendiente; marca de selección y texto refuerzan elección.

Hay dos usos distintos que deben mantenerse separados al generalizar:
**categoría/identidad** (iniciales, curso, tipo de nota) y **estado operativo**.
Un avatar verde no significa «correcto» y un curso guinda no significa «error».
En particular, «Normal» puede coexistir con fin o captura pendientes: no significa
registro completo, revisión conforme, cobertura autorizada ni pago aprobado.

## 6. Iconografía y descubrimiento de acciones

El sprite SVG es local, de trazo uniforme: `currentColor`, sin relleno, grosor 2,
extremos redondos. La forma se conserva al cambiar el tamaño. Los iconos suelen
medir 11–16 px; el área pulsable es una decisión diferente.

| Símbolo | Decisión de uso en la propuesta |
|---|---|
| Lápiz | Editar el dato situado junto a él; no significa abrir previsualización |
| Papelera | Quitar del borrador; el guardado exterior aplica el cambio local |
| Esquinas de ampliación | Ver imagen íntegra; no editar ni descargar |
| Flecha de subida | Elegir/arrastrar archivo; no equivale a asociarlo |
| Triángulo de alerta | Pendiente exigible o emergencia; contexto y texto precisan cuál |
| Check | Normal, asociado o procedencia del sistema; nunca inferir aprobación global |
| Reloj | Tiempo, tardanza o pendiente, con contexto distinto en cada superficie |
| Calendario / edificio / usuario | Fecha, aula y persona en chips no interactivos |
| Usuarios / usuario / edificio | Alumno, docente y aula en observaciones |
| Usuario con aspa | Sin docente; no la X genérica de cerrar |
| Flechas de intercambio | Reemplazo normal |
| Información | Ayuda secundaria sobre una cabecera |
| Más / X | Añadir o cerrar/descartar dentro del contexto correspondiente |
| Imagen / bocadillo / orden | Captura vacía, observación y orden temporal |

Las acciones de celda son botones reales con nombre accesible y bloque identificado.
El lápiz se revela al hover/foco; en dispositivos sin hover aparece atenuado.
El lápiz de una miniatura es un **botón hermano**, no un botón dentro del botón
de ampliar. El zoom aparece como refuerzo visual sobre la imagen.

La economía de palabras no es absoluta: estados dicen «Normal», «Sin registrar» o
«Emergencia»; el compositor rotula Docente/Alumno/Aula; el pie conserva Guardar y
Descartar. Es una distinción deliberada entre iconos conocidos y decisiones que
necesitan texto. Los otros módulos deben mantener esa distinción.

## 7. Tooltips: mecanismo real y papel en el diseño

- Una única capa fija, fondo marino y texto claro, máximo 250 px; padding 7×9 px,
  radio 6 px, tamaño 10,5 px y transición de opacidad/desplazamiento de 120 ms.
- El contenido procede de `data-tip`; `textContent` evita interpretarlo como HTML.
- Aparece a los 480 ms de hover y 350 ms de foco. Con puntero se sitúa a 13 px de
  este y lo sigue; invierte lado si choca con derecha/inferior y respeta 8 px de borde.
- Delegación global de `pointerover/move/out` y `focusin/out`; ignora hover táctil.
- Se usa para cabeceras, significado de símbolos, pendientes, procedencia del
  reemplazo, acciones y línea temporal. No contiene formularios ni acciones.
- Abrir/cerrar el editor oculta el tooltip. La capa tiene z-index 120, pero un
  z-index del documento **no supera la top layer de un diálogo nativo**.

Límites observados: `aria-hidden="true"` no se actualiza; no hay `aria-describedby`;
las ayudas de cabecera usan spans no enfocables; Escape no oculta la ayuda y
`pointer-events:none` impide mantenerla al pasar el puntero sobre ella. El soporte
de foco delegado no hace que todos los disparadores sean alcanzables por teclado.
El tooltip global puede quedar detrás de un `<dialog>` abierto.

**Decisión para el resto:** conservar el estilo breve y contextual, no replicar
este motor manual ni sus limitaciones. Usar anclaje estable al control, colisiones,
teclado, Escape, permanencia al hover y relación accesible. El seguimiento del
puntero solo cabe en ayudas visuales secundarias de gráficos, sin ocultar datos
esenciales. Ninguna de estas observaciones autoriza editar la propuesta o Partes.

## 8. Modales: cuatro tareas y una vista ampliada

Un `<dialog>` de edición se reutiliza para horas, estado, notas y captura. Ancho
máximo 590 px y alto 90dvh; en móvil ancho del viewport menos 18 px y alto 94dvh.
Cabecera y pie no encogen; solo el cuerpo puede desplazarse. La previsualización
usa otro diálogo de hasta 1120 px, fondo oscuro e imagen con `object-fit:contain`.

La composición es estable: título corto, una línea de contexto, cerrar en la
esquina, contenido de una tarea y pie con secundaria contorneada/principal guinda.
El backdrop atenúa con opacidad .48 y blur 1,5 px: la tabla sigue siendo contexto.
**El código no anima la entrada de los modales**; no debe atribuirse a la propuesta
una coreografía que no tiene.

`showModal()` aporta modalidad nativa. Se conserva el disparador y, tras reconstruir
las filas, se recupera por acción/id/slot antes de devolver foco sin scroll. La
previsualización desde edición deja dos diálogos nativos abiertos y devuelve foco
al control de ampliar cuando cierra. No se debe reemplazar esto por dos gestores
de bloqueo/foco superpuestos.

En la exploración, el foco inicial de horas fue al botón Cerrar, no al primer campo.
Escape y el backdrop cierran sin guardar el trabajo local. Es comportamiento de
maqueta, **no permiso para retirar las protecciones de borrador del sistema**.
Los otros módulos conservarán su política vigente de cierre y escrituras en curso.

## 9. Decisiones dentro de cada editor

### Hora real

Dos campos de hora grandes, Inicio/Fin; debajo, programado con reloj y avisos
localizados únicamente cuando faltan valores exigibles. Guardar se habilita al
cambiar el par y rechaza fin anterior a inicio. No copia el horario programado.

### Estado

Rejilla de seis elecciones visuales: N/T/SD/RN/RE y Sin registrar, cada una con
icono, nombre y código secundario. La selección añade borde guinda doble, fondo
suave y cambia el icono; no depende solo del fondo. Tres columnas en escritorio,
dos en móvil. Solo RN/RE muestran correo y procedencia del reemplazante.

El docente titular sigue visible en la tabla; debajo del estado aparece el correo
del sustituto. Check y reloj distinguen sistema/propuesta. El editor valida correo
y guarda en memoria, no autoriza cobertura real. Usa botones `role=radio` pero no
implementa navegación con flechas ni un único tab stop: ese código no es un patrón
de radiogroup accesible listo para reutilizar.

### Observaciones

La celda muestra como máximo dos notas, icono por tipo, elipsis y contador de resto.
El modal muestra notas recientes primero con hora, identidad del alumno cuando
aplica y acciones discretas. Un compositor aparece dentro del mismo modal; no abre
otro. Docente/Alumno/Aula conservan icono y etiqueta. Solo Alumno revela nombres y
apellidos. Añadir/editar trabaja sobre una copia; confirmar el compositor modifica
el borrador, y Guardar exterior confirma las notas del bloque.

Los mensajes «lista para guardar» y «quitada del borrador» distinguen preparación
de persistencia. El orden usa horas del fixture, no fechas de un historial real.
No se exportan al producto los mínimos, identificadores ni reglas locales.

### Capturas

Miniatura con `object-fit:cover` para reconocimiento; vista amplia íntegra con
`contain`. Clic en imagen amplía; lápiz cambia. El editor muestra estado asociado,
sin asociar, se quitará o vacío con icono y texto corto. Una sola zona permite
arrastre y clic, con realce específico durante dragover. Con imagen, ampliar y
quitar están superpuestos; quitar devuelve la zona vacía para elegir otra.

La selección local verifica extensión/MIME, firma PNG, tamaño 10 MiB, dimensiones
máximas de 4096 px y decodificación; usa FileReader/data URL. Guardar cambia el
array en memoria, **no sube a GCS, no acredita asociación backend y no habilita
borrado remoto**. No trasladar estas operaciones ni precargar imágenes/data URLs
de toda una tabla productiva. Los contratos vigentes de archivos prevalecen.

## 10. Tiempo, pendientes y feedback

La línea temporal ocupa 18 px fuera de la superficie. Segmentos gris oscuro
transcurridos, azul actual y gris claro futuro; recesos con tono tenue y un solo
punto actual. Se alinea a los rectángulos de las filas; los recesos ocupan 6 px,
**no una escala proporcional a todos los minutos del día**. `ResizeObserver`,
scroll y resize programan el reajuste con `requestAnimationFrame`.

La fila actual se distingue por fondo azul, borde lateral y número invertido. El
reloj tiene hora visible, zona Lima y punto; no hay botón «ir a la hora actual».
Los pendientes se calculan con el reloj ficticio y se marcan en celda, fila y total
de filas afectadas. Esta jerarquía permite localizar sin leer un párrafo por bloque.
No es un motor productivo de plazos, faltas, tardanzas o completitud reglamentaria.

El toast es breve, marino, con check, `role=status` y `aria-live=polite`; aparece
desde abajo en 180 ms y se retira a los 2300 ms. Confirma el alcance de la acción
local, no sustituye errores o estados persistentes. En el producto se mantiene el
sistema instalado, sin añadir otro contenedor ni fingir éxito antes del servidor.

## 11. Movimiento real y adaptación

- Hover/foco: lápiz por opacidad 120 ms; zoom 130 ms; botón de editar miniatura
  cambia levemente de escala. No se animan filas ni se reordena la tabla al apuntar.
- Reloj: pulso de sombra de 2,4 s, infinito solo con `prefers-reduced-motion:no-preference`.
  La consulta reduce ese pulso, **no todas las transiciones de la página**.
- Menos altura: reduce cabecera/padding y oculta barra de laboratorio y pie; no
  elimina bloques. Menos ancho: chips envuelven, cuenta textual se recoge y la
  tabla mantiene mínimo de 1240 px con scroll interno.
- A 390/320 px no convierte la tabla en tarjetas; conserva la comparación y obliga
  a desplazarse para alcanzar las columnas. El área de tabla móvil mide 660 px.
- No generalizar `body{overflow:hidden}` ni alturas rígidas a formularios largos,
  teclado virtual o zoom; conservar la intención, no esos atajos de maqueta.

## 12. Arquitectura: reutilizar ideas, no el JavaScript de demostración

Es un HTML autónomo con sprite SVG, datos sintéticos, estado global local, copias
de trabajo y renderizado mediante `innerHTML`. `esc`/`textContent` protegen las
inserciones textuales. La restauración por identificadores compensa la sustitución
del DOM. No hay React, servicios, autorización, persistencia ni concurrencia real.

El sistema ya dispone de React 19, Tailwind 4, React Icons, React Toastify y
primitivos compartidos; `Dialog` ya usa `<dialog>`. `IconButton` aporta nombre y
`title`, pero `title` no sustituye la política de tooltip accesible. `RowActions`
mantiene iconos visibles. Los compartidos también sirven a Partes: **no es seguro
retocarlos globalmente porque una captura ajena al módulo se vea mejor**.

La solución eficiente para otros módulos es composición local sobre esos recursos,
con adopción opt-in y conservación del comportamiento por defecto. Floating UI
resuelve posicionamiento e interacciones flotantes, no reglas de negocio ni una
auditoría completa. No se necesita otra biblioteca de iconos, toasts, tablas o
animación para imitar esta referencia.

## 13. Límites observados que no se convierten en requisitos

| Observación | Límite de la extrapolación |
|---|---|
| Texto de 9–11 px y botón de miniatura de 18–20 px antes de escala | No son mínimos del nuevo sistema; cumplir legibilidad y objetivos accesibles |
| Tooltips con problemas de foco/ARIA/Escape/top layer | Resolver en los otros módulos con primitivas fiables; no editar Partes |
| Radiogroup sin flechas y con seis tab stops | Usar controles nativos/semántica completa en nuevas composiciones |
| Escape descarta trabajo del editor | Conservar las protecciones de cada flujo real, sin nuevos descartes silenciosos |
| Guardar se deshabilita sin cambios en la demo | No cambiar condiciones de habilitación productivas ni suprimir escrituras válidas |
| Datos y reglas temporales locales | No inferir estado/permisos/plazos ni sustituir datos del servidor |
| Quitar imagen en borrador | No habilita eliminar archivos ni cambiar asociación/plazos del producto |
| Pulso infinito y transiciones parcialmente reducidas | Para otros módulos, movimiento funcional acotado y reducción completa |
| Tabla sin error/carga de red ni permisos reales | Esos estados siguen siendo obligatorios aunque no estén dibujados aquí |

Esto no es una lista de cambios de Partes. Su maqueta y su implementación previa al
refactor quedan congeladas por mandato del usuario, también frente a «mejoras».
Un hallazgo allí se informa fuera del lote; no se arregla bajo esta autorización.

## 14. Comprobación exploratoria de esta revisión

| Comprobación realizada | Resultado observado |
|---|---|
| 1920×1080 y 1366×768 | Siete filas, sin overflow horizontal de documento ni tabla |
| 768×1024, 390×844 y 320×740 | Sin overflow horizontal del documento; sí scroll interno de tabla |
| Tooltip de cabecera + Escape | Aparece; conserva `aria-hidden=true`, sin descripción asociada; Escape no lo oculta |
| Modal de horas a 1366×768 | 590 px, sin scroll inicial del cuerpo, modalidad nativa, Guardar inicialmente deshabilitado |
| Editar hora y Escape | Habilita Guardar al editar; no persiste; devuelve foco al disparador |
| Estado RN/RE frente a Normal | Panel de reemplazante condicional; seis opciones; ArrowRight no cambia selección/foco |
| Observaciones | Orden 10:12/10:05; Alumno revela nombres y lleva foco al primer campo |
| Captura asociada y ampliación desde editor | Dos diálogos nativos; `contain`; Escape devuelve foco a ampliar |
| Movimiento reducido | Pulso del reloj desactivado; transición del tooltip permanece en 120 ms |

No se seleccionaron archivos, no se ejecutaron operaciones contra backend ni se
reemplazaron las capturas oficiales. El análisis no acredita todas las rutas,
contraste, zoom 200 %, lector de pantalla o políticas de borradores productivas.

## 15. Decisión contractual resultante

1. Esta es la **única referencia visual oficial y validada**, sin letra alternativa.
2. El resto del sistema adopta su economía de lectura, color semántico localizado,
   iconos consistentes, detalle contextual, superficies compactas y feedback breve.
3. Accesibilidad, datos, permisos, validaciones y efectos no se sacrifican para
   parecer más limpio; la equivalencia se prueba operación por operación.
4. **Partes no es un piloto ni una fase de rediseño**: se recibe ya implementado en
   un encargo anterior y se conserva. H8 pasa a ser un control de no alteración.
5. Los huecos de la maqueta no se copian como infraestructura; se aprovecha lo
   instalado y una dependencia flotante acotada cuando sea necesaria, sin modificar
   manifiestos ni código durante esta revisión documental.

Referencias técnicas consultadas: [Tooltip](https://floating-ui.com/docs/tooltip),
[useHover](https://floating-ui.com/docs/useHover),
[FloatingPortal](https://floating-ui.com/docs/FloatingPortal).
El contrato de adopción y sus pruebas, no el prestigio de una biblioteca, determinan
si la solución es adecuada para el producto.
