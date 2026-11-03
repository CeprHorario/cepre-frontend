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
| H0 | En ejecución | Seis contratos versionados en `e5632ad`; rutas contrastadas; faltan fichas exhaustivas por pantalla |
| H1 | En ejecución | Primer lote funcional en frontend `db16f2e` + backend `f9e4f95`; aceptación integral pendiente |
| H2 | Bloqueado | Depende H1, no hay línea base visual integral vigente |
| H3 | Bloqueado | Depende H2; pilotos no realizados |
| H4–H10 | Bloqueado | Secuencia contractual, no iniciada |

## Trazabilidad funcional

| ID | Origen → requisito / contrato | Implementación | Prueba y evidencia | Estado |
|---|---|---|---|---|
| R-N01 / D-01 | Usuario/auditoría → contexto/avisos / CF-02/03/09 | Contexto directo autorizado, revalidación/cancelación, SSE invalida GET con precondiciones; formularios ligados al scope | Caché fría M/D/S/A, avisos exclusivos, resolución ajena rechazada, resolución propia persistida y cambio de proceso/formulario probados en `evidence/fase1.json`; falta prueba explícita de respaldo sin SSE/cambio de cuenta en la misma vista | Implementado sin verificar |
| R-P02 | Usuario → filtro salón completo / CF-01/07 | Catálogo solo admin, reutiliza filtro de servidor y reinicio de página existentes | Salón sin filas en catálogo, GET con classId, vacío conserva selección y Todos recupera datos; recorrido en `evidence/fase1.json` | Verificado |
| R-P01 | Usuario → jornadas monitor / CF-07/11 | GET journals agrupado antes de paginar; apertura recupera todas las páginas; estado/listado aislados en memoria | PostgreSQL: 105 bloques, total/páginas vacías/alcance/rangos. Navegador: 6 actuales + 105 históricos (2 GET), retorno/rango/borrador y nueve anchos. Falta regresión vigente de conflictos/subidas al volver | Implementado sin verificar |
| R-I01 | Usuario → navegador incidencias / CF-10/11 | Sin reconstruir módulo | Navegador real: docente/alumno/aula, persistencia, solo docente genera antecedente DNI, resolver/reabrir/historial y retirada sin borrar. Falta resto de matriz F1.4 | En ejecución |
| D-02 | Auditoría → contratos/pruebas vigentes | ROLES/OPERACIONES/partes y docs backend reconciliados en los aspectos intervenidos; smoke actualizado | Suite histórica frontend aún falla por entrada antigua y contiene textarea/habilitaciones/permisos obsoletos; no se han eliminado ni maquillado sus recorridos | En ejecución |
| D-03 | Auditoría → error/carga/vacío separados | Alert y Reintentar en Supervisor/Configuración | `evidence/estados.json`: fallo inicial inyectado, error ≠ vacío y recuperación; configuración vuelve a endpoint real | Verificado |
| D-04 | Auditoría → semántica sin destinos perdidos | Enlaces separados en ModuleTile, RoomCard y selector de supervisor | DOM sin interactividad anidada en superficies afectadas, destinos y foco; catálogos UI parcialmente inyectados, límites explícitos en `evidence/estados.json` | Verificado |
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
Conservar fallos reales; nunca convertir salida vacía en éxito. Evidencia histórica
en `docs/partes-evidence/` no prueba esta ejecución; registrar nueva vigencia.

## Verificación del lote `db16f2e` / `f9e4f95`

| Verificación | Resultado |
|---|---|
| Frontend lint / typecheck / build | Pasa; conserva 11 warnings Fast Refresh y aviso de chunk grande |
| Frontend test:availability / test:partes | 4/4 + 9/9 |
| Backend lint / typecheck / build mediante Compose | Pasa |
| Backend test:records:all (base nueva aleatoria) | 6 preparación + 171 regresión pasan; 14 omitidos explícitamente, sin presentarlos como ejecutados |
| Harness smoke separado, opt-in y DB/GCS reales aislados | 3/3; cookie, CSRF/CORS, versiones, cierre, GCS y retención de respuesta |
| test:modernizacion:browser | 6 recorridos; integración real con harness, alcance parcial de Fase 1 |
| test:modernizacion:states | 4 recorridos; fallos/catálogos UI inyectados donde se indica |
| Ambas suites nuevas sobre compilado de producción | Pasan; build con `VITE_API_BACK_URL=http://127.0.0.1:3000`, preview en 5174 |
| test:partes:browser histórico | **Falla** al esperar `[data-record="1"]` directamente en `/monitor/partes`; ahora la entrada es el listado. También requiere reconciliar reglas retiradas antes de considerarlo vigente |

Los diez recorridos nuevos no equivalen a diez pantallas completas ni sustituyen
los 25 recorridos históricos. `evidence/fase1.json` y `evidence/estados.json`
contienen los resultados del compilado, sin errores JavaScript. Captura actual
del listado a 1920×1080 revisada en `evidence/monitor-jornadas-1920.png`; no es H2.
El listado se comprobó sin overflow a 1920/1440/1366/2560/3440/1024/768/390/320.
No se declara todavía zoom, lector de pantalla, Firefox o WebKit verificados.

Build de este lote de prueba: CSS 78.17 kB (gzip 14.94); principal 787.90 kB
(gzip 236.20), Requests 10.69 kB (gzip 3.80). Sin dependencias nuevas. No se ha
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

## Pendientes que mantienen cerrada la puerta H1

1. Reconciliar los cinco scripts históricos de partes y su runner, conservando su
   cobertura válida. No restaurar textarea libre, cambio de efectivos por monitor,
   emergencias directas retiradas ni ampliaciones del plazo.
2. Completar F1.1: SSE/sondeo explícitos, respuestas tardías y cambio de cuenta en
   la misma vista; probar Excel y formulario de incidencia tras cambio de contexto.
3. Completar F1.3 con borradores en conflicto/subida y retorno al listado.
4. Completar navegador R-I01: sin DNI/reemplazante correcto, supervisor/hoy Lima/
   recursos ajenos/propios, DNI entre procesos, conflicto de versión, avisos en
   personal/importación y navegación/logout con borradores.
5. Completar fichas de inventario, discrepancias relevantes y línea base funcional.
   K-01 queda clasificado como riesgo de resultado parcial con recuperación
   explícita; decidir cualquier corrección adicional en lote funcional separado.

**Fase 2 no iniciada.** Continúan pendientes línea base integral, pilotos, todos
los hitos visuales y entrega final. La autorización del usuario sigue vigente;
este checkpoint no es una solicitud de nueva aprobación ni cierre integral.
