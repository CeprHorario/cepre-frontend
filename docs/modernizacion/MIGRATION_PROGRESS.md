# Progreso y evidencias

Actualizado: 2026-11-03. No interpretar autorización total como verificación total.

## Decisión vigente de ejecución

El usuario ha precisado que deben terminarse **todas las fases sin detenerse en
cada entregable**. La [regla contractual de continuidad](MASTER_PLAN.md#ejecución-continua-hasta-la-entrega-integral)
obliga a verificar, documentar y avanzar automáticamente hasta H10. Los hitos y
commits no cierran la tarea ni requieren otro mensaje del usuario. Los checkpoints
anteriores conservan su valor histórico, no justifican nuevas pausas por fase.
Esta modificación no cambia el estado real de los hitos ni elimina verificaciones,
restricciones de seguridad o bloqueos imprescindibles.

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
| H0 | Verificado | Preparación: contratos, mapa de rutas/propietarios, caracterización y fixtures. Fichas exhaustivas/capturas se completan en H2 antes de estética |
| H1 | Verificado | Matriz F1.0–F1.5 cerrada; contratos reconciliados y línea base funcional posterior en FUNCTIONAL_BASELINE.md |
| H2 | Preparado | Inventario detallado y capturas de todas las pantallas pendientes; no hay línea base visual integral vigente |
| H3 | Bloqueado | Depende H2; pilotos no realizados |
| H4–H10 | Bloqueado | Secuencia contractual, no iniciada |

## Trazabilidad funcional

| ID | Origen → requisito / contrato | Implementación | Prueba y evidencia | Estado |
|---|---|---|---|---|
| R-N01 / D-01 | Usuario/auditoría → contexto/avisos / CF-02/03/09 | Contexto directo autorizado; SSE invalida GET con precondiciones; formularios por scope | fase1.json + transportes.json: caché fría M/D/S/A, destinatarios, SSE nativo, caída SSE/sondeo 60s HTTP real, cuenta en misma vista, respuestas/eventos tardíos, Excel/incidencia rápida; sin decidir/reintentar escrituras | Verificado |
| R-P02 | Usuario → filtro salón completo / CF-01/07 | Catálogo solo admin, reutiliza filtro de servidor y reinicio de página existentes | Salón sin filas en catálogo, GET con classId, vacío conserva selección y Todos recupera datos; recorrido en `evidence/fase1.json` | Verificado |
| R-P01 | Usuario → jornadas monitor / CF-07/11 | GET journals agrupado antes de paginar; apertura completa; estado/listado aislados | PostgreSQL: 105 bloques, total/páginas vacías/alcance/rangos. Navegador: 6 actuales + 105 históricos (2 GET), retorno/rango/borrador; volver con conflicto/subida pendiente conserva ambos; teclado/móvil | Verificado |
| R-I01 | Usuario → navegador incidencias / CF-10/11 | Módulo conservado; harness con controladores reales adicionales | fase1.json + incidencias.json: docente/alumno/aula, efectivo/reemplazante/sin DNI, eventos sin borrar original, S/hoy Lima/ajenos/propios, historia A/B, resolver/reabrir/409, avisos personal/importación y protección salida/logout | Verificado |
| D-02 | Auditoría → contratos/pruebas vigentes | Cinco scripts/runner reconciliados y helper compartido; documentación vigente | test:partes:browser completo: 25/25, sin restaurar textarea libre, efectivos editables M, cobertura retirada ni ampliación del cierre | Verificado |
| D-03 | Auditoría → error/carga/vacío separados | Alert y Reintentar en Supervisor/Configuración | `evidence/estados.json`: fallo inicial inyectado, error ≠ vacío y recuperación; configuración vuelve a endpoint real | Verificado |
| D-04 | Auditoría → semántica sin destinos perdidos | Enlaces separados en ModuleTile, RoomCard y selector de supervisor | DOM sin interactividad anidada en superficies afectadas, destinos y foco; catálogos UI parcialmente inyectados, límites explícitos en `evidence/estados.json` | Verificado |
| D-05 | Regresión vigente → conflicto clasificado visible / CF-07/11 | Conflict incluye classState/structuredObservations y etiquetas legibles | 409 real muestra observación y N · Normal; retorno protegido. Antes conservaba datos pero solo mostraba incidents legado; sin cambio API | Verificado |
| K-01 | Riesgo → fallo intermedio de sustitución / CF-05 | CourseRow mantiene dos operaciones independientes; no se ha autorizado convertirlas en una transacción nueva | `test/availability.e2e-spec.ts`: retirar, fallar por disponibilidad, verificar curso sin docente/carga 0 y reasignar explícitamente. Riesgo confirmado de resultado parcial, no atomización silenciosa | Verificado |

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
Conservar fallos reales; nunca convertir salida vacía en éxito. Solo las capturas/
JSON regenerados e indexados acreditan vigencia; los archivos antiguos no usados
siguen siendo históricos.

## Verificación vigente de cierre funcional H1

Base anterior: frontend `db16f2e` + backend `f9e4f95`; continuación añade D-05,
reconciliación de cinco suites, dos suites nuevas y ampliación local del harness.
Los commits de continuación se registran en AGENT_HANDOFF.md.
La verificación backend incluye los tres cambios ajenos iniciales del árbol de
trabajo (65 adiciones/2 eliminaciones), preservados fuera de los commits: no se
afirma que un checkout aislado del hash sea exactamente ese árbol probado.

| Verificación | Resultado |
|---|---|
| Frontend lint / typecheck / build | Pasa; conserva 11 warnings Fast Refresh y aviso de chunk grande |
| Frontend test:availability / test:partes | 4/4 + 9/9 |
| Backend lint / typecheck / build mediante Compose | Pasa |
| Backend test:records:all (base nueva aleatoria) | 6 preparación + 171 regresión pasan; 14 omitidos explícitamente, sin presentarlos como ejecutados |
| Harness smoke separado, opt-in y DB/GCS reales aislados | 3/3; cookie, CSRF/CORS, versiones, cierre, GCS y retención de respuesta |
| test:modernizacion:browser | 6 recorridos; integración real con harness, alcance parcial de Fase 1 |
| test:modernizacion:states | 4 recorridos; fallos/catálogos UI inyectados donde se indica |
| test:modernizacion:incidencias | 6 recorridos, HTTP/PostgreSQL reales; negativos API desde Chromium identificados |
| test:modernizacion:transportes | 5 recorridos, SSE nativo/HTTP/Excel reales; caída de transporte y retención de respuestas inyectadas explícitamente |
| Todas las suites de navegador sobre compilado | Pasan; build con API aislada explícita y preview en 5174 |
| test:partes:browser reconciliado | 25/25: monitor/supervisor 9, administración 8, aislamiento 3, carreras 2, pérdida de acceso 3 |

Los 46 recorridos no equivalen a 46 pantallas completas: 25 de partes y 21 de
modernización. Los cuatro JSON de `evidence/` y los cinco de `../partes-evidence/`
contienen resultados vigentes sin errores JavaScript. Captura actual
del listado a 1920×1080 revisada en `evidence/monitor-jornadas-1920.png`; no es H2.
El listado se comprobó sin overflow a 1920/1440/1366/2560/3440/1024/768/390/320.
No se declara todavía zoom, lector de pantalla, Firefox o WebKit verificados.

Build vigente: CSS 78.17 kB (gzip 14.94); principal 788.09 kB
(gzip 236.24), Requests 10.69 kB (gzip 3.80). Sin dependencias nuevas. No se ha
fijado presupuesto H2 ni realizado migración visual.

## Hallazgos operativos y decisiones

- El harness antiguo no arrancaba: preparaba efectivos mediante una escritura de
  monitor ya prohibida y creaba coberturas desde una ruta retirada. Se corrigieron
  **fixtures**, no permisos: corrección administrativa y antecedente legado PENDING.
- Faltaban pdf-lib/sharp locales: `npm ci --no-audit --no-fund` dentro de Compose,
  con el lock existente, sin cambiar manifiesto/lock ni instalar globalmente.
- Ejecutar suites directas sin catálogo público produjo errores de tablas ausentes.
  La verificación completa usa el runner existente de base nueva; el harness migra
  su catálogo solo después de comprobar destino exacto de pruebas.
- Los antecedentes sintéticos públicos son inmutables y sobreviven reinicios del
  harness: las nuevas pruebas filtran el proceso del manifest, no asumen DNI único
  entre ejecuciones. No borrar historia para hacer pasar una prueba.
- La CLI puede devolver antes de terminar una navegación con beforeunload. El
  runner espera un resultado explícito, sin repetir mutaciones ni aceptar null.
  Solo guarda resultado sintético de prueba en sessionStorage efímero, nunca auth
  ni borradores del producto; cierra la sesión antes de escribir JSON en disco.
- R-P01 conserva filtros de persona/curso/revisión dentro de la hoja; fecha/aula/
  turno se eligen desde el listado. El tamaño 25/50/100 pagina jornadas, no trunca
  bloques. El resto de roles mantiene su hoja y paginación anteriores.

## Cierre de H1 y siguiente puerta

F1.0–F1.5 tienen evidencia vigente y [línea base funcional](FUNCTIONAL_BASELINE.md).
K-01 está caracterizado, no convertido en una transacción nueva. D-05 se descubrió
al restaurar cobertura útil: se corrigió la comparación compartida, no la prueba
para ocultar datos. Backend solo amplía el harness; no cambia APIs productivas en
esta continuación. El control local de DNI acepta solo el reemplazante/procesos
del fixture, con valores fijos y validación smoke.

H2 debe completar las fichas exhaustivas del inventario y capturas funcionales/
visuales por ruta, rol, variante y estado de **todas** las pantallas. La línea base
H1 no lo sustituye. Después, H3 valida los tres pilotos antes de extender estilos.
Faltan accesibilidad integral, zoom/reflow completo, presupuestos medidos y los
hitos visuales H3–H10. No se ha iniciado reconstrucción visual ni desplegado nada.
La autorización integral sigue vigente; este checkpoint no es una solicitud de
nueva aprobación ni la entrega final del plan. La ejecución debe continuar desde
H2 hasta H10 sin detenerse en estos entregables intermedios.
