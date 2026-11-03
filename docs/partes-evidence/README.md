# Evidencia de integración de partes

Las imágenes de esta carpeta son capturas reales del frontend productivo ejecutado en Chromium contra el harness local Nest/PostgreSQL/GCS. Los datos y PNG de evidencia académica del harness son sintéticos; no representan clases ni personas reales.

Regeneración vigente: 2026-11-03, compilado de producción local sin HMR; cinco suites y 25 recorridos correctos. Reconciliadas jornadas, observaciones clasificadas y permisos vigentes. Pareja exacta del checkpoint en [traspaso](../modernizacion/AGENT_HANDOFF.md).

Recorridos reproducibles en `tests/partes-browser.cjs`, mediante la CLI gestionada `playwright-cli` y el harness descrito en `backend/test/records-browser.md`.

## Resultados

| Suite | Recorridos | Resultado |
|---|---:|---|
| Monitor y supervisor | 9 | [JSON](monitor-supervisor.json) |
| Administración completa | 8 | [JSON](administracion.json) |
| Cuenta, proceso y sesión | 3 | [JSON](aislamiento.json) |
| Roles y respuesta tardía durante mantenimiento | 2 | [JSON](carreras.json) |
| Vencimiento, retirada de acceso y fallo de logout | 3 | [JSON](perdida-acceso.json) |

Ejecución conjunta: `npm run test:partes:browser` desde `frontend/`, con fixtures nuevos del harness. Se puede filtrar por `monitor-supervisor`, `administracion`, `aislamiento`, `carreras` o `perdida-acceso`. Guía: [partes](../partes.md). Matriz 1440/1280/768/390/320 px en los tres roles, con desplazamiento interno en tablet y lectura de filas en móvil. Conflicto/subida pendiente también protegen el retorno al listado.

## Capturas reales de Chromium

| Vista | Captura |
|---|---|
| Monitor escritorio | [Imagen](monitor-escritorio.png) |
| Monitor móvil | [Imagen](monitor-movil.png) |
| Editor móvil | [Imagen](monitor-editor-movil.png) |
| Subida aún sin asociar | [Imagen](subida-sin-asociar.png) |
| Imagen íntegra al100% | [Imagen](imagen-completa.png) |
| Conflicto409 real | [Imagen](conflicto-real.png) |
| Cierre entre subida y asociación | [Imagen](cierre-durante-asociacion.png) |
| Mantenimiento | [Imagen](mantenimiento.png) |
| Supervisor sobre parte cerrado | [Imagen](supervisor-revision-cerrado.png) |
| Alertas del supervisor | [Imagen](supervisor-alertas.png) |
| Supervisor móvil | [Imagen](supervisor-movil.png) |
| Corrección y captura extraordinaria | [Imagen](administracion-correccion-captura.png) |
| Lote administrativo con resultado parcial | [Imagen](administracion-lote-parcial.png) |
| Configuración | [Imagen](administracion-configuracion.png) |
| Reportes | [Imagen](administracion-reportes.png) |
| Historial | [Imagen](administracion-historial.png) |
| Administración móvil | [Imagen](administracion-movil.png) |
| Otro proceso con IDs coincidentes | [Imagen](aislamiento-proceso-b.png) |
| Subida recuperada tras mantenimiento | [Imagen](subida-recuperada-mantenimiento.png) |

Sin auditoría con lector de pantalla ni Firefox/WebKit. Los rechazos HTTP esperados (401/403/404/409/503) forman parte de los recorridos negativos; no son errores JavaScript de la aplicación.

`administracion-habilitacion.png` se conserva solo como artefacto histórico, fuera
de la evidencia vigente: el recorrido actual verifica el rechazo de ampliaciones
del cierre original, no restaura esa capacidad. La cobertura nueva de transportes
e incidencias se indexa en [modernización](../modernizacion/evidence/README.md).
