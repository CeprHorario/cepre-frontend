# H3 — Pilotos visuales

Estado: preparado, sin cambios visuales aplicados todavía. La línea base H2 está
en [BASELINE_H2.md](BASELINE_H2.md) y `baseline/`. Cada piloto se valida en
Chromium a 1920, 1440, 1024, 768 y 390 px, teclado y 200 % de zoom cuando aplique,
antes de extender el lenguaje al resto.

## Reglas comunes

- No cambiar rutas, permisos, campos, acciones, payloads, versiones, persistencia
  ni estados. No añadir dependencias.
- Conservar guinda/marino/dorado, Montserrat/Open Sans y componentes existentes.
- Evitar otro `max-width` estrecho dentro del layout; usar el ancho disponible con
  límites legibles. No ocultar información para simplificar.
- Medir antes/después con los mismos fixtures: captura, densidad (filas visibles),
  overflow horizontal, foco visible y bundle.
- Cualquier defecto funcional descubierto se registra aparte; no se corrige dentro
  del lote estético salvo que bloquee la pantalla.

## Piloto A — tabla de Docentes (`UI-11`)

Estado: **aplicado y verificado** el 2026-11-03.

Cambios: avatar de iniciales junto a nombre/correo; curso, dedicación y horas
repetidos bajo la identidad solo en móvil para no perder información al ocultar
esas columnas; horas con límite explícito y cifras tabulares; acción «Ver detalle»
accesible por teclado además del clic de fila; contenedor de tabla posicionado
para que el texto `sr-only` no ensanche el documento.

Resultado medido: `UI-11` deja de desbordar a 390 px. El reflow se extendió a los
contenedores compartidos (`SimpleLayout`, `ModuleLayout`, `Card` y `DataTable`):
**0 de 32 rutas desbordan** a 390 px en la nueva línea base. Queda validar foco,
zoom y lector manual, y decidir si las acciones de fila deben quedar visibles sin
desplazamiento horizontal en móvil (H4).

Objetivo: identidad y densidad operativa. Jerarquía nombre/correo, curso y
dedicación legibles; barra de horas con valor y límite explícitos; cabecera de
tabla estable al desplazar; acciones agrupadas y accesibles por teclado.

Conservar: búsqueda, filtro de curso, exportación, alta, selección múltiple,
asignar salones, horario, editar, eliminar, drawer de detalle, rol de coordinación
de solo lectura y filtro por curso. No alterar el formulario ni sus reglas.

Criterios: sin overflow del documento a 390 px (la tabla puede desplazarse dentro),
foco visible en fila y acciones, objetivos táctiles ≥ 44 px en móvil, cifras
tabulares, contraste AA.

## Piloto B — horario del Monitor (`UI-23`)

Objetivo: lectura del horario semanal como superficie principal. Cabecera de días
y horas estable, bloques con curso/docente/estado sin truncar información esencial,
leyenda y acciones Meet/Classroom separadas del bloque, vista «Por día» equivalente.

Conservar `ScheduleView` y sus consumidores (supervisor, docente, salones,
coordinación): turnos por ID, intervalos, enlaces, edición particular de la grilla
de asignación y estados vacío/carga/error. No introducir otra implementación.

Criterios: teclado y foco en celdas/acciones, sin desplazamiento horizontal del
documento, contraste de estados no dependiente solo del color.

## Piloto C — evidencias de Partes (`UI-04`/`UI-24`)

Objetivo: diálogo amplio con dos zonas Inicio/Fin en paralelo (apiladas en móvil),
cada una con imagen íntegra, estado, selección/subida y asociación independientes.
Distinguir con claridad «subida sin asociar» de «asociada»; conservar zoom, versión,
plazo, motivo administrativo, borrador y protección de cierre.

Conservar: una subida por zona, sin recorte/compresión/borrado, object URLs
revocadas, foco aislado/restaurado, acciones deshabilitadas cuando corresponda.

Criterios: sin romper los 25 recorridos de partes; teclado y lector de pantalla
manual en el diálogo; sin consultas por fila ni carga masiva de imágenes.

## Secuencia

1. Docentes (tabla + estados vacío/carga/error + móvil).
2. Horario Monitor (compartido; revisar consumidores).
3. Evidencias (diálogo y protecciones).
4. Revisión conjunta de densidad, identidad y overlays; fijar tokens finales.
5. Solo entonces extender H4–H9. Si un piloto falla un criterio, corregir antes
   de avanzar; no se considera «aprobado» por una captura atractiva.
