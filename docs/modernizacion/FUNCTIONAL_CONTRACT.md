# Contrato funcional de conservación

> Enmienda2026-11-04: [alcance vigente](FINALIZACION_20261104.md). K-01 corregido
> mediante lote BE-01/FE-01; cabecera global única excepción aCF-13. Las demás
> invariantes y el núcleo de Partes siguen protegidos. Lo siguiente incluye historia.

Versión inicial: 2026-11-03. Prevalece la autorización del plan, contrastada con
código/servidor/pruebas vigentes. Las pruebas históricas no prueban el estado
actual. Este documento enlaza, no sustituye, [operaciones](../OPERACIONES.md),
[partes](../partes.md) y los propietarios compartidos de [roles](../ROLES.md).

**Rectificación de alcance de 2026-11-03:** el encargo actual modifica únicamente
contratos y planes. La futura refactorización es de presentación, sin cambios de
funcionalidad. **Partes queda fuera, sin excepciones visuales, funcionales ni
«mejoras» indirectas**; el usuario lo implementará antes en otro trabajo. La
[propuesta oficial y validada](propuestas/monitor.html) se analiza en lectura como
referencia del resto. Prevalecen CF-13/14 y el [cerrojo](MASTER_PLAN.md#cerrojo-de-partes-obligatorio)
sobre cualquier autorización anterior de pilotos o fases que afecte al módulo.

## Continuidad contractual

Por instrucción expresa del usuario, la ejecución abarca **todas las fases hasta
H10**, sin detenerse ni pedir confirmación por entregable parcial. Se aplica la
regla de [ejecución continua del plan maestro](MASTER_PLAN.md#ejecución-continua-hasta-la-entrega-integral):
verificar el hito, registrar evidencia y continuar con el siguiente habilitado.
Se conservan todas las invariantes y puertas de calidad siguientes; los checkpoints
no son finales de tarea ni autorizan omitir pruebas, ampliar alcance o desplegar.
La autonomía incluye implementar, verificar, corregir y reanudar en otra ventana
desde el primer pendiente habilitado, sin nueva aprobación. Aplicar la
[ratificación de autonomía](MASTER_PLAN.md#ratificación-de-autonomía-y-reanudación);
no sustituir la ejecución por una propuesta o una pregunta de continuidad.

Esta regla se activa ante un pedido de **implementar/continuar la implementación**,
no por este pedido de análisis documental. No ordena escribir código ahora, no
reabre H1 y no recupera el antiguo piloto/H8 de rediseño de Partes.

## Invariantes de conservación

| ID | Invariante obligatorio |
|---|---|
| CF-01 | Conservar rutas, redirecciones, enlaces directos/parámetros y cinco ámbitos. `profesor`/`docente` equivalentes; coordinación general/de curso con alcance propio. No añadir gestión de permisos por existir endpoints. |
| CF-02 | OAuth Google, popup/origen/ventana, cookies HttpOnly/credenciales, CSRF, logout/revocación y acceso admin en mantenimiento. Sin tokens en URL/Web Storage ni controles visuales sustituyendo servidor. |
| CF-03 | Servidor selecciona proceso. Headers cuenta/proceso son precondiciones, no selectores. Caché aislada, cancelación y respuestas tardías; no repetir escrituras con nueva identidad. |
| CF-04 | Conservar campos, obligatorios, límites, payloads/omisiones y diferencias alta/edición; DNI/correo no editables donde estén prohibidos. Sin autoguardado ni nuevas confirmaciones estéticas. |
| CF-05 | Personas se eliminan lógicamente con consecuencias por rol; no confundir con cursos/salones. Conservar confirmaciones y resultados parciales; solicitudes independientes no son atómicas. |
| CF-06 | Semana inicial, Por día y vistas existentes; turnos por ID, no por hora. Disponibilidad por intervalos no borra asignaciones; conservar cobertura/cruces/carga y grilla editable particular. |
| CF-07 | Partes se conserva completo según su línea base congelada recibida, incluidas columnas/agrupaciones y flujos por rol. Sin inferir ausencia/dictado/sanción/pago; apertura/cierre del servidor/configuración, versiones/revisiones/motivos y restricciones existentes. No restaurar ampliaciones retiradas ni intervenir la hoja dentro del refactor (CF-13). |
| CF-08 | Subida y asociación distintas; PNG/dimensiones/tamaño/recurso/plazo validados. Sin recorte/compresión/borrado/múltiples. Descartar referencia no borra remoto. Imagen íntegra, acceso privado, revocar object URLs. |
| CF-09 | Solicitud/autorización/ejecución separadas; conservar solicitantes/decisores/cancelación, sin autoaprobación. Compatibilidad/reservas/revalidación/idempotencia; aprobar no cambia horario semanal. |
| CF-10 | Incidencias: DNI/alcance/autoría/inmutabilidad/historial/resolución auditada. Sin antecedentes para roles prohibidos; mismos filtros/columnas/exportación, sin nuevos indicadores de sanción/remuneración. |
| CF-11 | Borradores partes solo memoria por cuenta/proceso. Conservar persistencia existente de preferencias del menú y borrador del generador; no prohibir globalmente localStorage. |
| CF-12 | Conservar Meet/Classroom/Gmail/portapapeles/Excel/PDF/GCS/runtime/analítica. Validación de enlaces y descargas privadas; estética no cambia contratos externos. |
| CF-13 | **Inmutabilidad de Partes:** UI-04/24/27, todos sus estados/componentes/estilos/servicios/protecciones y efectos de compartidos quedan tal cual tras su implementación previa separada. No modificar `src/features/partes/**`, contratos especializados, APIs/archivos ni tests del módulo, ni la referencia `propuestas/**`. No aceptar diferencias causadas por globals, fuentes, layout, overlays, toasts o portales; aislar el cambio fuera de Partes o bloquear el lote. |
| CF-14 | **Solo presentación:** conservar métodos/endpoints, orden y número de escrituras, payload/omisiones, filtros/paginación/orden, condiciones de habilitación, validaciones, cálculos, errores, permisos, efectos, caché, persistencia y propietarios de estado. No añadir autoguardado, pasos/confirmaciones de negocio, descarte silencioso ni nueva lógica cliente para imitar una maqueta. |

## Excepciones autorizadas (exclusivamente Fase 1)

Registro histórico de H1 ya verificado. **No son excepciones vigentes al cerrojo
de Partes ni autorización de nuevos cambios funcionales en este refactor**. Si se
descubre un problema nuevo, se registra fuera del lote y se necesita alcance
funcional independiente antes de corregirlo; no se modifica para «acabar el diseño».

| ID/origen | Cambio permitido | Prueba de aceptación |
|---|---|---|
| R-N01 usuario; D-01 auditoría | Contexto operativo no depende de admisión administrativa; lecturas autorizadas por rol | Caché vacía admin/docente/monitor/supervisor, A no ve/resuelve B; SSE/sondeo, cambio cuenta/proceso, aviso no decide solicitud |
| R-P02 usuario | Catálogo completo autorizado para filtro admin de salón | Salón fuera de página, filtrado servidor/página 1/Todos/vacío conserva selección; roles restringidos sin catálogo general |
| R-P01 usuario | Lista jornadas monitor, rango/orden estable por fecha/salón/turno; lectura agrupada solo si necesaria | Jornada completa con más de una página de bloques, apertura/retorno, histórico/reemplazos, protección borradores/conflictos/subidas |
| R-I01 usuario | Completar navegador de incidencias y corregir fallos reproducidos, sin reconstruir módulo | Matriz F1.4 de MASTER_PLAN; comprobar backend persistido y pruebas negativas |
| D-02 auditoría | Actualizar pruebas/documentos desfasados sin restaurar reglas retiradas | Expectativas de cierre/controles y contratos especializados reconciliados |
| D-03 auditoría | Error distinto de vacío/carga indefinida | SupervisorPanel y ConfiguracionPage con fallo inicial y reintento |
| D-04 auditoría | Semántica interactiva válida preservando destinos | Sin enlaces anidados ni enlaces en botones; teclado y destinos conservados |
| D-05 regresión actual | Mostrar classState y structuredObservations conservados en conflicto de partes | 409 real muestra estado legible y observación del borrador; volver al listado no descarta pendientes; sin cambio de payload/política de resolución |

## Riesgo caracterizado, no cambio aprobado

**K-01:** sustitución docente en salón ejecuta desasignación/asignación separadas.
Fallo intermedio reproducido en PostgreSQL por `test/availability.e2e-spec.ts`:
la retirada queda persistida, el nuevo docente incompatible se rechaza, la carga
del anterior queda en cero y la recuperación exige reasignación explícita. Se
clasifica como riesgo de resultado parcial existente (CF-05). No convertirlo
silenciosamente en una operación atómica ni rediseñar backend; cualquier corrección
adicional debe registrarse en lote funcional separado, no dentro de estética.

## Simplificación visual sin pérdida funcional

La [rectificación visual](DESIGN_SYSTEM.md#rectificación-visual-menos-carga-más-interacción-útil)
permite agrupar y mostrar progresivamente información secundaria, sin eliminarla
ni cambiar reglas, **solo en los módulos incluidos**. CF-07/13 impiden resumir,
reorganizar o adaptar Partes en este encargo. Conflictos, borradores, errores y
restricciones relevantes no se ocultan para limpiar ninguna vista.

Para cada dato o acción del resto del sistema, registrar antes/después:

| Elemento | Conservación exigida |
|---|---|
| Texto retirado | Solo redundancia; datos largos trasladados tienen acceso explícito con teclado/táctil y contenido íntegro |
| Icono/color/animación | Representa un dato/estado existente; no determina autorización, aprobación, completitud o resultado nuevo |
| Botón convertido a icono | Mismo callback/destino, nombre accesible específico, foco/área táctil y tooltip secundario; etiqueta visible si la decisión es crítica |
| Formulario en modal | Mismos campos/valores/reglas, guardado en el mismo instante, misma política de cierre/pérdida de cambios; sin remontar su estado al cambiar presentación |
| Tarjetas de elección | Mismas opciones y permisos; elegir no añade petición ni confirma la operación; no limpiar campos ocultos salvo regla preexistente |
| Guardar/Cancelar | Mismas precondiciones y efectos. No copiar de la demo un bloqueo nuevo «sin cambios» ni la pérdida de borrador por Escape/backdrop |
| Feedback | Preparación, envío, éxito y fallo diferenciados; no éxito optimista nuevo ni error reemplazado por un toast efímero |
| Ayuda contextual | No contiene la única copia de un error, plazo, consecuencia o valor necesario para decidir |

Cambiar presentación no escribe, autoriza ni descarta estado. Las maquetas no
acreditan conservación ni integración. El modelo local de RN/RE, notas y capturas
de la referencia no es un contrato de backend ni permiso para ampliar funcionalidad.

## Prueba de inmutabilidad de Partes

1. Recibir su implementación previa del usuario; registrar revisión/árbol y línea
   base congelada. No asumir que la maqueta validada equivale a producto integrado.
2. Inventariar sus dependencias directas e indirectas. Un cambio en `Dialog`,
   `Button`, cabecera, reset o fuente también queda bajo CF-13 si lo afecta.
3. Antes/después del lote: diff/hashes protegidos sin cambios y capturas/DOM/estados
   comparables por rol, además de regresión existente de interacción y red.
4. Verificar foco/scroll, ayudas, modales, montaje, borradores/conflictos/subidas,
   versiones, plazos, sesión y respuestas tardías sin diferencias nuevas.
5. Si falla: aislar/reducir el cambio externo. No retocar Partes, su suite, sus
   expectativas ni las capturas oficiales para darlo por conservado. Un test verde
   sin comprobación visual no prueba el aislamiento de un cambio de CSS.

## Control de contratos de red

Registrar por operación método/ruta, payload/omisiones, headers cuenta/proceso,
expectedVersion, resultado persistido, cachés invalidadas y ausencia de escritura
en cancelar/previsualizar. Cambios Fase 1 se registran aparte. En Fase 2 un defecto
funcional nuevo abre requisito separado, nunca una corrección estética oculta.

## Reconciliación documental inicial

Se corrigieron las descripciones antiguas de `ROLES.md` sobre importación general
de disponibilidad y registro directo de incidencias; no se recuperó un cuarto
tipo general. OPERACIONES.md explica observaciones y contexto operativo; partes.md
describe el listado nuevo y separa evidencia histórica de verificación actual.
La documentación backend corrige la materialización de todos los bloques de hoy
(no únicamente futuros) y documenta journals. Los cinco scripts históricos están
reconciliados y sus 25 recorridos completos pasan sin restaurar reglas retiradas.
[FUNCTIONAL_BASELINE.md](FUNCTIONAL_BASELINE.md) fija métodos/payloads/omisiones,
estados, evidencias y límites posteriores a Fase 1; no equivale a H2.
