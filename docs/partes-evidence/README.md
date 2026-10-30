# Evidencia de integración de partes

Las imágenes de esta carpeta son capturas reales del frontend productivo ejecutado en Chromium contra el harness local Nest/PostgreSQL/GCS. Los datos y PNG de evidencia académica del harness son sintéticos; no representan clases ni personas reales.

La última regeneración corresponde al compilado de producción servido localmente sin HMR; cinco suites y25 recorridos verificados.

Recorridos reproducibles en `tests/partes-browser.cjs`, mediante la CLI gestionada `playwright-cli` y el harness descrito en `backend/test/records-browser.md`.

## Resultados

| Suite | Recorridos | Resultado |
|---|---:|---|
| Monitor y supervisor | 9 | [JSON](monitor-supervisor.json) |
| Administración completa | 8 | [JSON](administracion.json) |
| Cuenta, proceso y sesión | 3 | [JSON](aislamiento.json) |
| Roles y respuesta tardía durante mantenimiento | 2 | [JSON](carreras.json) |
| Vencimiento, retirada de acceso y fallo de logout | 3 | [JSON](perdida-acceso.json) |

Ejecución conjunta: `npm run test:partes:browser` desde `frontend/`, con fixtures nuevos del harness. Guía completa: [partes](../partes.md). Matriz de1440/1280/768/390/320px en los tres roles, con desplazamiento interno de la tabla en tablet y lectura de filas en móvil.

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
| Habilitación temporal | [Imagen](administracion-habilitacion.png) |
| Lote administrativo con resultado parcial | [Imagen](administracion-lote-parcial.png) |
| Configuración | [Imagen](administracion-configuracion.png) |
| Reportes | [Imagen](administracion-reportes.png) |
| Historial | [Imagen](administracion-historial.png) |
| Administración móvil | [Imagen](administracion-movil.png) |
| Otro proceso con IDs coincidentes | [Imagen](aislamiento-proceso-b.png) |
| Subida recuperada tras mantenimiento | [Imagen](subida-recuperada-mantenimiento.png) |

Sin auditoría con lector de pantalla ni Firefox/WebKit. Los rechazos HTTP esperados (401/403/404/409/503) forman parte de los recorridos negativos; no son errores JavaScript de la aplicación.
