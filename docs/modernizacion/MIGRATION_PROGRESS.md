# Progreso y evidencias

Actualizado: 2026-11-03. No interpretar autorización total como verificación total.

## Versiones iniciales y trabajo protegido

- Frontend: `4ee6350` — `fix(ui): integrar tarjetas administrativas y fechas del calendario`.
  Árbol limpio antes de esta ejecución.
- Backend: `2427812` — `feat(operaciones): integrar incidencias, reemplazos y reportes por rol`.
- Cambios ajenos protegidos: `backend/.env.example`,
  `backend/src/modules/runtime-config/runtime-config.service.ts`,
  `backend/src/modules/runtime-config/runtime-config.service.spec.ts`.
  Estado inicial: 65 adiciones/2 eliminaciones entre los tres; no incorporarlos a commits.

## Hitos

| Hito | Estado | Evidencia / límite |
|---|---|---|
| H0 | En ejecución | Seis documentos creados; inventario de rutas contrastado; falta caracterización completa |
| H1 | Preparado | Todavía no hay aceptación integral de Fase 1 |
| H2 | Bloqueado | Depende H1, no hay línea base visual integral vigente |
| H3 | Bloqueado | Depende H2; pilotos no realizados |
| H4–H10 | Bloqueado | Secuencia contractual, no iniciada |

## Trazabilidad funcional

| ID | Origen → requisito / contrato | Implementación | Prueba y evidencia | Estado |
|---|---|---|---|---|
| R-N01 / D-01 | Usuario/auditoría → contexto/avisos / CF-02/03/09 | useOperations depende de useCurrentAdmission admin | Confirmado leyendo hook y AuthProvider; falta integración por rol | Preparado |
| R-P02 | Usuario → filtro salón completo / CF-01/07 | useParts/PartsView por revisar | Debe probar salón fuera de página y vacío | Preparado |
| R-P01 | Usuario → jornadas monitor / CF-07/11 | PartsPage/useParts/lecturas backend por revisar | Agrupación completa, apertura/retorno/histórico pendientes | Preparado |
| R-I01 | Usuario → navegador incidencias / CF-10/11 | Reutilizar módulo vigente | Matriz F1.4 y persistencia pendientes | Preparado |
| D-02 | Auditoría → contratos/pruebas vigentes | ROLES contradice tipos generales e incidencias | Docs fuente consultados; navegador histórico no ejecutado aún | En ejecución |
| D-03 | Auditoría → error/carga/vacío separados | SupervisorPanel/ConfiguracionPage | Reproducción/regresión pendientes | Preparado |
| D-04 | Auditoría → semántica sin destinos perdidos | Enlaces/botones por inventariar | Teclado/DOM pendientes | Identificado |
| K-01 | Riesgo → fallo intermedio de sustitución | No autorizado rediseñar | Reproducción y clasificación pendientes | Pendiente de confirmar |

## Caracterización ejecutada antes de cambios funcionales

| Comando (frontend) | Resultado actual |
|---|---|
| `npm run lint` | Pasa, 11 advertencias Fast Refresh preexistentes |
| `npm run typecheck` | Pasa |
| `npm run test:availability` | 4/4 |
| `npm run test:partes` | 9/9 |
| `npm run build` | Pasa; advertencia chunk principal >500 kB |

Medición inicial del build local: CSS 77.95 kB (gzip 14.93), JS principal 780.89 kB
(gzip 234.24); Requests 10.30 kB, Reports 4.54 kB. No es presupuesto aceptado H2.
CLI gestionada: `playwright-cli 0.1.21`. Docker records inicialmente sin servicios.
Resultados históricos de la propuesta (38 backend/6 preparación/9 frontend) no se
reutilizan como evidencia actual. No se ha ejecutado auditoría integral, Firefox,
WebKit ni lector de pantalla.

## Protocolo de evidencias

Capturas/resultados solo sintéticos, sin cookies/tokens/credenciales/PII.
Por recorrido: ID/ruta/rol/estado/resolución/versión/comando/resultado persistido.
Conservar fallos reales; nunca convertir salida vacía en éxito. Evidencia histórica
en `docs/partes-evidence/` no prueba esta ejecución; registrar nueva vigencia.

## Siguiente checkpoint

Versionar contratos antes de código; iniciar DB/GCS y harness aislados, registrar
fallos de navegador actuales y corregir F1.1 en el camino compartido. No tocar
presentación mientras la puerta H1 siga abierta.
