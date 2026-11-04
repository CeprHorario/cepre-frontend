# H3 — Pilotos visuales

> [Enmienda2026-11-04](FINALIZACION_20261104.md): los tres pilotos permanecen
> vigentes; Partes ya está recibido. Solo su cabecera global puede cambiar enE5.

Contrato revisado: 2026-11-03. Hay un avance técnico previo en Docentes, no cierre
del lenguaje visual nuevo. Esta revisión es solo documental, no aplica pilotos.
La única referencia del cliente es la [propuesta oficial y validada](propuestas/monitor.html),
analizada en [ANALISIS_PROPUESTA_OFICIAL.md](ANALISIS_PROPUESTA_OFICIAL.md).

**Partes está excluido.** Se retira el piloto de evidencias y se sustituye por
modal de Cursos. No modificar la maqueta, UI-04/24/27 ni compartidos que alteren su
implementación previa. Los números siguientes identifican pruebas del lenguaje,
no alternativas de propuesta. La línea base histórica H2 está en
[BASELINE_H2.md](BASELINE_H2.md) y `baseline/`.

## Reglas comunes

- No cambiar rutas, permisos, campos, acciones, payloads, versiones, persistencia
  ni estados ni condiciones de habilitación/cierre. No corregir funcionalidad en
  el lote visual; registrar bloqueos aparte.
- Reutilizar componentes/librerías instaladas; adopción puntual de Floating UI
  solo bajo [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), midiendo compatibilidad/coste,
  sin reemplazar el sistema de modales, iconos o toasts.
- Conservar guinda/marino/dorado, Montserrat/Open Sans y componentes existentes.
- Evitar otro `max-width` estrecho dentro del layout; usar el ancho disponible con
  límites legibles. No ocultar información para simplificar.
- Medir antes/después con los mismos fixtures: captura, densidad (filas visibles),
  overflow horizontal, foco visible y bundle.
- Conservar la línea base de Partes recibida antes de cambiar compartidos; aplicar
  CF-13. Si un piloto cambia Partes por herencia, layout, portales o foco, no pasa.
- Cada piloto: 1920×1080, 1440, 1366×768, 1024, 768, 390 y 320 px; zoom 200 %,
  teclado, táctil sin hover, movimiento reducido, contraste y lector manual
  aplicables. Estado normal más carga, error, vacío y restricciones reales.
- Registrar inventario de datos/acciones y textos redundantes retirados o llevados
  a ayuda/detalle; ningún valor esencial existe solo en tooltip. Comparar tareas,
  no solo capturas. No convertir tres pilotos en tres lenguajes distintos.

## Piloto 1 — tabla de Docentes (`UI-11`)

Estado histórico: **mejoras técnicas aplicadas y verificadas** el 2026-11-03,
con los límites siguientes. Pendiente de aceptación visual contra UX-01–UX-20;
no se pierde la evidencia anterior ni se declara aprobado el nuevo contrato.

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

Aplicación de la referencia: cabecera de tarea compacta y una superficie de tabla;
identidad nombre/correo jerárquica; indicadores de carga/incidencia con dato visible,
icono y color localizado; acciones conocidas junto a la fila con nombres/ayudas.
Sin párrafos repetidos, métricas gigantes ni drawer abierto por defecto. Mantener
el drawer de detalle y acciones existentes: no imponer el modal de Partes a personas.

Ayudas a verificar: iconos repetidos identifican persona/acción en su nombre;
tooltip con foco/Escape, scroll y bordes; elipsis con recuperación accesible.
Coordinación conserva filtros/alcance de solo lectura, sin botones de escritura.

## Piloto 2 — horario del Monitor (`UI-23`, no Partes)

Objetivo: lectura del horario semanal como superficie principal. Cabecera de días
y horas estable, bloques con curso/docente/estado sin truncar información esencial,
leyenda y acciones Meet/Classroom separadas del bloque, vista «Por día» equivalente.

Conservar `ScheduleView` y sus consumidores (supervisor, docente, salones,
coordinación): turnos por ID, intervalos, enlaces, edición particular de la grilla
de asignación y estados vacío/carga/error. No introducir otra implementación.

Criterios: teclado y foco en celdas/acciones, sin desplazamiento horizontal del
documento, contraste de estados no dependiente solo del color.

Aplicación de la referencia: contexto mínimo de salón/turno/persona; horario como
superficie principal, curso/docente legibles y enlaces con iconos coherentes y
nombre de destino. Detalle local al seleccionar, sin banners ni duplicación de
directorio. Semana/Por día conservan acceso, parámetros y equivalencia.

No introducir el reloj ni el cálculo de pendientes de la maqueta, ni nueva línea
temporal o autoavance. Color del curso no significa autorización/disponibilidad.
Abrir Meet/Classroom conserva validación y destino; copiar no abre ni escribe.
Cualquier dependencia de Partes se inspecciona y conserva, no se migra.

## Piloto 3 — modal y acciones de Cursos (`UI-20`)

Sustituye expresamente el piloto retirado de Partes; **no incluye evidencias**.
Usar `CursosPage`/`CourseDialog`/`ConfirmDialog` existentes, no otra maqueta ni CRUD.

Objetivo: edición pequeña y situada con modal compacto, contexto inequívoco, acción
principal guinda, acciones de fila discretas y ayudas fiables. Validar overlays,
tooltips y feedback del lenguaje sin intervenir el módulo protegido.

Conservar: alta/edición de nombre/color, normalización y validación existentes,
previsualización real con `courseTint`, color guardado, eliminación y rechazo por
asociaciones, métodos/payloads, invalidación y feedback actuales. No restringir la
paleta ni añadir dirty guard, autoguardado, confirmación o paso de aprobación.

Interacciones mínimas: abrir desde alta/lápiz, editar, guardar válido/fallo,
Cancelar/X/Escape/backdrop según contrato actual, volver a la fila, tooltip de
editar/eliminar por foco y puntero, confirmación de eliminar y error por asociación.
La advertencia de eliminación permanece visible; no se convierte en tooltip.

Criterios: nombre/etiquetas y campo de color completos; foco inicial útil,
Tab/Shift+Tab contenidos, fondo inerte, retorno estable, controles alcanzables con
teclado virtual/zoom; sin tooltip detrás del diálogo nativo, recorte o doble trap.
Una superficie pequeña no fuerza texto diminuto ni suprime el error persistente.
Guardar conserva su habilitación actual por nombre válido; no copiar de la demo
«solo si cambió». Las operaciones se comprueban contra servidor/harness, no solo toast.

## Evidencias exigidas por piloto

| Puerta | Prueba mínima |
|---|---|
| Fidelidad | Antes/después con mismos datos; jerarquía compacta, señales semánticas, acciones situadas y ausencia de duplicaciones; referencia a UX aplicables |
| Conservación | Matriz de campos/acciones/filtros/roles/estados y comparación de métodos/payloads/efectos/habilitación; cero cambios funcionales |
| Ayudas/iconos | Sin hover, con foco y Escape, táctil, texto largo, bordes, scroll y top layer; significado y nombre sin depender del color |
| Modal | Foco, cierre conforme al flujo, error/ocupado/cancelación, retorno y estado conservados; sin nuevos pasos |
| Movimiento | Reduce activado y respuesta estática equivalente, sin esperar la animación para operar |
| Rendimiento | Bundle/gzip y coste de apertura/desplazamiento comparables; observadores limpiados, sin peticiones por fila |
| Partes intacto | Archivos protegidos sin cambios y comparación visual/interactiva contra su línea base por rol/estado; no actualizar la referencia para pasar |

## Secuencia

1. Recibir y congelar Partes previo; H2 de pantallas elegibles y dependencias.
2. Docentes (tabla + estados vacío/carga/error + móvil).
3. Horario Monitor fuera de Partes (compartido; revisar consumidores).
4. Cursos (modal, acciones, ayudas y confirmación existente).
5. Revisión conjunta de densidad, identidad, texto/ayudas, overlays y coste;
   fijar tokens opt-in sin cambiar Partes.
6. Solo entonces extender H4–H9, con H8 exclusivamente de no alteración. Si un
   piloto falla un criterio, corregir antes de avanzar; no se considera «aprobado»
   por una captura atractiva.
