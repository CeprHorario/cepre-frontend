# Contrato funcional de conservación

Versión inicial: 2026-11-03. Prevalece la autorización del plan, contrastada con
código/servidor/pruebas vigentes. Las pruebas históricas no prueban el estado
actual. Este documento enlaza, no sustituye, [operaciones](../OPERACIONES.md),
[partes](../partes.md) y los propietarios compartidos de [roles](../ROLES.md).

| ID | Invariante obligatorio |
|---|---|
| CF-01 | Conservar rutas, redirecciones, enlaces directos/parámetros y cinco ámbitos. `profesor`/`docente` equivalentes; coordinación general/de curso con alcance propio. No añadir gestión de permisos por existir endpoints. |
| CF-02 | OAuth Google, popup/origen/ventana, cookies HttpOnly/credenciales, CSRF, logout/revocación y acceso admin en mantenimiento. Sin tokens en URL/Web Storage ni controles visuales sustituyendo servidor. |
| CF-03 | Servidor selecciona proceso. Headers cuenta/proceso son precondiciones, no selectores. Caché aislada, cancelación y respuestas tardías; no repetir escrituras con nueva identidad. |
| CF-04 | Conservar campos, obligatorios, límites, payloads/omisiones y diferencias alta/edición; DNI/correo no editables donde estén prohibidos. Sin autoguardado ni nuevas confirmaciones estéticas. |
| CF-05 | Personas se eliminan lógicamente con consecuencias por rol; no confundir con cursos/salones. Conservar confirmaciones y resultados parciales; solicitudes independientes no son atómicas. |
| CF-06 | Semana inicial, Por día y vistas existentes; turnos por ID, no por hora. Disponibilidad por intervalos no borra asignaciones; conservar cobertura/cruces/carga y grilla editable particular. |
| CF-07 | Hoja de partes con columnas/agrupaciones actuales; reales vacías, sin inferir ausencia/dictado/sanción/pago. Apertura/cierre del servidor/configuración; no restaurar ampliaciones retiradas. Versiones, revisiones y correcciones admin con motivo. |
| CF-08 | Subida y asociación distintas; PNG/dimensiones/tamaño/recurso/plazo validados. Sin recorte/compresión/borrado/múltiples. Descartar referencia no borra remoto. Imagen íntegra, acceso privado, revocar object URLs. |
| CF-09 | Solicitud/autorización/ejecución separadas; conservar solicitantes/decisores/cancelación, sin autoaprobación. Compatibilidad/reservas/revalidación/idempotencia; aprobar no cambia horario semanal. |
| CF-10 | Incidencias: DNI/alcance/autoría/inmutabilidad/historial/resolución auditada. Sin antecedentes para roles prohibidos; mismos filtros/columnas/exportación, sin nuevos indicadores de sanción/remuneración. |
| CF-11 | Borradores partes solo memoria por cuenta/proceso. Conservar persistencia existente de preferencias del menú y borrador del generador; no prohibir globalmente localStorage. |
| CF-12 | Conservar Meet/Classroom/Gmail/portapapeles/Excel/PDF/GCS/runtime/analítica. Validación de enlaces y descargas privadas; estética no cambia contratos externos. |

## Excepciones autorizadas (exclusivamente Fase 1)

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
