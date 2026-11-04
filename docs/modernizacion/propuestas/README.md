# Propuesta oficial y validada — Partes del monitor

## Contexto rápido

**Propuesta oficial y validada de la vista de Partes del monitor.** Es una maqueta
interactiva con datos ficticios; no modifica la aplicación, el backend ni permisos.

- **Abrir:** [monitor.html](monitor.html).
- **Incluye:** tabla de siete bloques, contexto de jornada, hora real,
  estados/reemplazos, observaciones, capturas y tooltips.
- **Probar:** cambia la hora simulada, recorre las celdas editables y abre cada modal.
  Los tooltips aparecen al pasar el mouse.
- **Evidencia:** 15 capturas indexadas y 66 comprobaciones de maqueta.
- **Alcance:** se eliminaron las exploraciones anteriores; esta es la única
  propuesta visual conservada. No se identifica mediante letras. La validación
  corresponde a la maqueta interactiva, no a la aplicación ni al backend.

## Decisiones finales

- Tabla de siete bloques, sin panel lateral. **Programado** y **Hora real** agrupan
  inicio/fin; las cabeceras están en mayúscula, centradas y explicadas con tooltips
  secundarios junto al puntero.
- Cabecera con chips de contexto para fecha, aula/salón, turno y monitor. El correo
  del docente aparece bajo su nombre; el del reemplazante, bajo el estado.
- Línea de tiempo vertical mínima en el margen izquierdo, fuera de la tarjeta de la
  tabla. Es continua, sin números de hora ni nodos; los recesos usan un tono más
  claro y solo un círculo marca la hora actual. El detalle aparece en tooltips.
- Docente y Curso comparten el mismo formato de abreviatura, tamaño y radio. Curso
  admite dos líneas y Observaciones tiene mayor ancho.
- Estado en modal con tarjetas N/T/SD/RN/RE. Solo RN/RE revelan el correo del
  reemplazante. Un reemplazo programado por el sistema se distingue de una propuesta
  pendiente de autorización; el docente titular no se sustituye en la tabla.
- Observaciones en modal, las más recientes primero y con hora. El listado usa iconos
  por tipo; el compositor rotula Docente/Alumno/Aula. El alumno se identifica con
  nombres y apellidos libres.
- Miniaturas Inicio/Fin: ocupan el ancho de la celda; clic en la imagen abre la vista
  íntegra y el lápiz superior derecho edita. La zona de subida permite arrastrar o
  elegir un PNG, borrar y después añadir otra captura. Guardar asocia; Descartar no.
- Modales compactos, sin scroll inicial en escritorio. Guardar se habilita solo con
  cambios y el foco vuelve al control de origen.

## Prácticas aplicadas

- [NN/g — Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/):
  ayuda breve y secundaria, activable por teclado, sin instrucciones esenciales.
- [NN/g — Icon Usability](https://www.nngroup.com/articles/icon-usability/):
  iconos ambiguos necesitan nombre accesible y tooltip; se mantienen etiquetas
  visibles en acciones principales.
- [IBM Carbon — File uploader](https://carbondesignsystem.com/components/file-uploader/usage/):
  alternativa de clic, zona de arrastre resaltada, un archivo y borrado explícito.
- [NN/g — Drag-and-drop](https://www.nngroup.com/articles/drag-drop/):
  señalización y feedback claros, con alternativa accesible sin depender del puntero.

## Índice de capturas

| Vista / estado | Captura |
|---|---|
| Tabla 1920×1080 | [final-monitor-1920.png](final-monitor-1920.png) |
| Tabla 1366×768 | [final-monitor-1366.png](final-monitor-1366.png) |
| Tabla móvil 390 px | [final-monitor-390.png](final-monitor-390.png) |
| Modal Hora real | [final-hora-real.png](final-hora-real.png) |
| Estado RN editable | [final-estado-reemplazo.png](final-estado-reemplazo.png) |
| Reemplazo programado por el sistema | [final-estado-programado.png](final-estado-programado.png) |
| RE propuesto pendiente de autorización | [final-estado-propuesta.png](final-estado-propuesta.png) |
| Observaciones, recientes primero | [final-observaciones.png](final-observaciones.png) |
| Nueva observación con tipos rotulados | [final-observaciones-nueva.png](final-observaciones-nueva.png) |
| Tooltip de cabecera | [final-tooltip.png](final-tooltip.png) |
| Tooltip de la hora actual | [final-tooltip-hora.png](final-tooltip-hora.png) |
| Captura asociada / editar | [final-captura-editar.png](final-captura-editar.png) |
| Zona de subida vacía | [final-captura-subir.png](final-captura-subir.png) |
| Captura preparada sin asociar | [final-captura-pendiente.png](final-captura-pendiente.png) |
| Vista previa íntegra | [final-captura-preview.png](final-captura-preview.png) |

## Validación

| Ámbito | Resultado |
|---|---|
| Maqueta interactiva | **66 comprobaciones correctas**; sin errores JS/HTTP |
| Escritorio | Siete filas sin scroll de página/tabla a 1920, 1440 y 1366 |
| Otros anchos | 1024/768/390/320 con scroll interno de tabla; sin overflow del documento |
| Estados y modales | Hora real, RN/RE, observaciones, tooltips, capturas e imágenes previas |
| Aplicación/backend | **No ejecutado**; `src/` y APIs permanecen intactos |

**Límites:** la selección local de PNG comprueba extensión, firma, tamaño, dimensiones
y decodificación; no sube archivos ni sustituye la validación del backend. RN/RE son
una simulación de interfaz: el monitor no recibe permiso para asignar efectivos ni
activar emergencias por esta maqueta. La persistencia de borradores del producto y
las pruebas de accesibilidad integral, zoom 200 %, Firefox/WebKit y lector de
pantalla quedan fuera de esta validación.
