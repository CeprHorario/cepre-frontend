# Sistema de diseño — dirección contractual

Estado: **Preparado; todavía no implementado ni validado visualmente**. Aplicación
solo después de H1/H2. Herramienta académica institucional precisa y operativa;
misma CEPRUNSA reconocible, sin ornamentación ni contenido nuevo para llenar.

## Tokens iniciales (sujetos a contraste real)

| Uso | Base |
|---|---|
| Acción principal | Guinda `#661124` |
| Estructura | Marino `#1C2140` |
| Fondo | `#F4F4F6` |
| Superficie | `#FFFFFF` |
| Texto principal | `#1A1C2B` |
| Texto secundario | `#5B5F73` |
| Éxito/advertencia/destrucción | Verde/ámbar/rojo existentes, validar contraste |
| Dorado | Acento institucional excepcional |

Borde decorativo distinto de borde identificador del control; este último debe
cumplir contraste. Estados no dependen solo del color. Foco claramente visible.
Radios/elevación/espaciado coherentes desde tokens actuales, sin un sistema paralelo.

Open Sans operativa; Montserrat títulos. Cuerpo 14–16 px, datos 13–14 px,
metadatos secundarios 12 px, títulos 24–28 px. Cifras tabulares en horas/números.
Evitar mayúsculas sistemáticas y negrita extrema.

## Layout y densidad

- Desktop-first: 1920×1080. Operación fluida hasta aproximadamente 1840 px útiles.
- Con sidebar: ocupar espacio restante sin otro max-width estrecho anidado.
- Formularios con grupos legibles; explicación con longitud de lectura propia,
  no estirar texto al ancho de la tabla. Panel auxiliar 300–380 px según contenido.
- Horarios/tablas protagonistas; menos cabeceras/banners sobredimensionados.
- Conservar tarjetas y ambas vistas donde existen; no envolver cada sección.
- Ultrapanorámicos con límites razonables. En tamaños menores reordenar sin
  quitar capacidades, usar scroll interno necesario, no encoger tipografía para
  forzar tabla. Recuperar acceso a información oculta actualmente en móvil.

## Componentes e interacción

Evolucionar tokens → primitivos existentes → composiciones existentes. Sin
biblioteca nueva por defecto: Tailwind/React Icons/CSS/plataforma primero.
Priorizar `<dialog>` ya utilizado. Externo solo ante necesidad accesible demostrada.

| Contexto | Patrón conservado/mejorado |
|---|---|
| Persona | Drawer con aislamiento y retorno de foco |
| Detalle desde listado | Panel contextual y acceso explícito por teclado |
| Destrucción | Confirmación breve |
| Asignación/disponibilidad | Página y grilla editable |
| Notificaciones | Campana/popover, resolver distinto de decidir |
| Filtros secundarios | Desplegable/sección existente |
| Historial | Detalle/diálogo amplio según flujo existente |
| Observaciones | Editor contextual del bloque |
| Generación | Asistente de cuatro pasos |

### Evidencias de partes (piloto)

Diálogo amplio: dos zonas Inicio/Fin en paralelo; apiladas en móvil. Cada una
mantiene imagen completa, estado, selección/subida y asociación independientes.
Sin «guardar ambas», cambio del momento de subida, recorte ni compresión nueva.
Archivo pendiente distinto de asociado; zoom íntegro. Preservar versión, plazo,
motivo administrativo, borrador y protección de cierre. No mover propietarios
de estado de forma que remonte o pierda operaciones pendientes.

## Movimiento y accesibilidad

Hover/foco 120–160 ms; apertura/cierre 160–220 ms; solo opacidad/transformaciones
breves orientativas. Sin entradas decorativas por fila ni desplazamientos de
tablas. `prefers-reduced-motion` reduce/elimina; no retrasar acciones ni errores.

WCAG 2.2 AA aplicable: teclado completo, nombre accesible, relaciones campo/error,
foco visible/no oculto sticky, aislamiento/restauración de overlays, mensajes
anunciados, alternativa al clic de filas, contraste de texto/controles y reflow.
Lector de pantalla manual, Firefox y WebKit se declaran pendientes sin ejecución.

## Validación visual

Pilotos: Docentes, horario Monitor, evidencias. Validar tres antes de extender.
Capturas con datos sintéticos en resoluciones del MASTER_PLAN y estados del
inventario. Cambios compartidos revisan todos sus consumidores. Capturas antiguas
son historia; la línea base actual se captura después de Fase 1.

Rendimiento: mismos datos antes/después, sin consultas por fila ni precargar
evidencias de toda la tabla; liberar recursos. Presupuestos después de H2.
