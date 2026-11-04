# Modernización integral CEPRUNSA

> Vigencia2026-11-04: [enmienda de ejecución](FINALIZACION_20261104.md). Partes ya
> recibido/congelado; única excepción, cabecera global. K-01 autorizado en lote
> funcional. El resto de este documento conserva decisiones e historia de2026-11-03.

Contrato de ejecución autorizado por el usuario el 2026-11-03. Conservar producto,
arquitectura y capacidades; cerrar primero funcionalidad y después reconstruir la
presentación por módulos. No es autorización para publicar en producción, usar
datos reales ni descartar cambios ajenos.

**Rectificación posterior del mismo día, prioritaria sobre el alcance anterior:**
la [propuesta oficial y validada](propuestas/monitor.html) es el lenguaje visual
elegido por el cliente. Esta tarea es **solo análisis y actualización documental**,
sin cambios de código, tests ejecutables, dependencias o funcionalidad. Partes se
implementará antes mediante un trabajo separado del usuario y **queda excluido
tajantemente de este refactor**, también de cambios indirectos. No continuar la
implementación por leer estos documentos; hacerlo solo ante una orden posterior
de ejecución, bajo el alcance rectificado. La autonomía anterior no anula este límite.

## Fuentes y control

- [Inventario](SYSTEM_INVENTORY.md): rutas, variantes, superficies y estados.
- [Contrato funcional](FUNCTIONAL_CONTRACT.md): invariantes y excepciones de Fase 1.
- [Diseño](DESIGN_SYSTEM.md): dirección y criterios de presentación.
- [Análisis de la referencia oficial](ANALISIS_PROPUESTA_OFICIAL.md): anatomía,
  iconografía, tooltips, modales, movimiento, decisiones y límites observados.
- [Progreso](MIGRATION_PROGRESS.md): requisitos, resultados y evidencias vigentes.
- [Traspaso](AGENT_HANDOFF.md): estado operativo y siguiente acción exacta.
- [Operaciones](../OPERACIONES.md), [roles](../ROLES.md), [partes](../partes.md):
  contratos especializados; reconciliar con fuente/servidor, nunca con las demos.

Cada tarea: **ID → origen → requisito → contrato → implementación → prueba →
evidencia → estado**. Estados: Identificado, Pendiente de confirmar, Preparado,
En ejecución, Implementado sin verificar, Verificado, Bloqueado.
«Implementado» nunca equivale a terminado. En cada checkpoint actualizar progreso,
decisiones, desviaciones y siguiente paso; al interrumpir, actualizar el traspaso.

## Ejecución continua hasta la entrega integral

Instrucción expresa del usuario, 2026-11-03: **terminar todas las fases sin
detenerse en cada entregable**. Esta regla gobierna la ejecución del plan y los
traspasos posteriores; sustituye cualquier interpretación de los checkpoints
como cierres de trabajo o solicitudes de autorización para continuar.

Esta continuidad se aplica a una **ejecución de implementación solicitada**, no
al presente encargo documental. «Todas las fases» significa el alcance vigente:
H8 es un control de no alteración, no autorización para intervenir Partes. Las
excepciones funcionales de H1 ya verificadas no se reabren dentro del refactor visual.

- La unidad de finalización es **H10 y el entregable integral**, no una pantalla,
  lote, commit, suite, piloto o fase. Al verificar un hito, actualizar la evidencia
  y continuar inmediatamente con el siguiente habilitado, dentro del mismo trabajo.
  No terminar la ejecución con «siguiente fase pendiente» si se puede avanzar.
- No pedir «continúa», otra aprobación ni una confirmación entre H0–H10. Los
  checkpoints y commits son controles internos; comunicar avances breves durante
  el trabajo, no convertirlos en entregas finales que exijan otro mensaje del usuario.
- Las puertas de calidad siguen siendo obligatorias: comprobar, corregir y volver
  a verificar antes de avanzar por una dependencia. «Aprobado» o «validado» en
  pilotos/capturas significa aceptación técnica documentada contra los criterios
  del plan; no introduce una espera de aprobación humana por fase.
- Resolver autónomamente los problemas dentro del alcance autorizado. Ante un
  bloqueo, continuar las tareas independientes posibles. Pausar y consultar solo
  cuando falte una decisión o acceso imprescindible del usuario, exista riesgo
  fuera de la autorización, o el usuario ordene detener/cambiar el trabajo. No
  desplegar, usar datos reales ni descartar cambios ajenos por esta continuidad.
- Si un límite técnico de ejecución/contexto impide continuar, dejar estado,
  evidencia, bloqueo y próxima acción exacta en el traspaso. Reanudar desde ahí al
  recuperar la ejecución, sin reautorizar fases ni tratar la interrupción como
  entrega completada. No prometer ejecución en segundo plano que no esté activa.
- La entrega final exige H0–H10 verificados según sus criterios, regresión y
  documentación finales, y límites expresos. Un bloqueo o prueba no ejecutada no
  se convierte en verificación para declarar terminado el plan.

### Ratificación de autonomía y reanudación

El usuario ratifica que el agente debe **implementar, probar, corregir y completar
el plan de forma independiente**, no limitarse a revisarlo o proponer próximos
pasos. Al recibir una instrucción explícita de continuar la implementación en una
ventana nueva, leer este plan, el contrato funcional, el progreso y el traspaso;
contrastarlos con Git y las
evidencias actuales y ejecutar inmediatamente el primer pendiente habilitado.
Si los documentos discrepan, reconciliar el estado con código y pruebas: no usar
la discrepancia como motivo para pedir otra autorización ni saltarse dependencias.
Un piloto con criterios pendientes no está cerrado. Completar las puertas previas
antes de extender estilos, aunque existan cambios posteriores ya iniciados.
No cerrar una respuesta de ejecución con «¿continúo?», «puedo seguir» o una lista
de pendientes ejecutables en lugar de realizarlos. Solo son motivos de pausa los
indicados arriba; documentar el bloqueo concreto y lo intentado, sin declarar
terminada la modernización ni prometer trabajo fuera de una sesión activa.

## Alcance y exclusiones

Conservar React 19, TypeScript, Vite 6, Tailwind 4, React Router 7, TanStack Query 5,
Axios, React Icons, React Toastify y componentes compartidos. Mantener
guinda/marino/dorado, Montserrat y Open Sans. No añadir otra aplicación, navegación
alternativa, infraestructura genérica, motor de formularios/estado ni animación
externa. La única incorporación puntual prevista es `@floating-ui/react` para
tooltips/popovers de módulos no protegidos, bajo las condiciones de DESIGN_SYSTEM;
no está instalada ni se añade en esta revisión. Reutilizar plataforma y recursos
existentes antes de ampliar dependencias, y medir el coste real.

Frontend y backend son repositorios separados. Backend NestJS/PostgreSQL
multiesquema/Prisma queda fuera del rediseño; el soporte funcional mínimo de Fase 1
ya verificado es antecedente, no una autorización renovada para cambiar reglas.
No hay cambios de API, lógica ni migraciones de datos en Fase 2. `front-demo/`
no es fuente de reglas. Se eliminó `partes-preview/` con las alternativas A/B/C;
la única propuesta visual de Partes es la [propuesta oficial y validada](propuestas/README.md).
Capturas antiguas son históricas. La propuesta se conserva en lectura: no retocar
HTML, CSS, JavaScript, recursos ni capturas oficiales para que encajen con el plan.

### Cerrojo de Partes (obligatorio)

**PROHIBIDO MODIFICAR PARTES EN ESTE REFACTOR.** Se aplica a administrador, monitor
y supervisor, no solo a la pantalla que sirve de referencia. Ni rediseño, ni
limpieza, ni extracción de componentes, ni corrección funcional o de accesibilidad,
ni adaptación al nuevo tema dentro de este plan. Un hallazgo se informa aparte;
no se aprovecha el lote para intervenirlo.

Superficies protegidas:

- `/admin/partes`, `/monitor/partes` y `/supervisor/partes` (UI-04/24/27), incluidos
  listado de jornadas, hoja, filtros, reportes internos, selección, observaciones,
  evidencias/visor, revisión, operaciones, historial, avisos y estados especiales.
- `src/features/partes/**`, sus estilos, hooks, tipos, servicios y protecciones de
  sesión/salida; rutas, montaje, proveedores y claves de estado que los gobiernan.
- APIs/DTO/servicios de registros de clase y archivos, contratos especializados y
  suites de Partes. No cambiar expectativas ni fixtures para ocultar una regresión.
- `docs/modernizacion/propuestas/**`, incluida la maqueta y sus 15 capturas:
  referencia inmutable, sin renombrar ni regenerar dentro de este refactor.
- Efectos indirectos de `AppHeader`/layouts, `Button`/`Field`/`Dialog`, estilos y
  tokens globales, fuentes, toasts, portales/top layer, z-index, reset, scroll y foco.
  Que el archivo no se llame «partes» no lo libera de esta protección.

Antes de implementar el refactor, recibir la versión de Partes que el usuario
implemente por separado y registrar su línea base congelada: revisión/árbol real,
hashes de archivos protegidos y dependencias visuales, capturas por rol/estado y
contratos de interacción/red. **No se afirma que esa implementación ya exista o
esté integrada por haber validado la maqueta.** Si difiere de ella, este plan no
autoriza alinearla. Sin esa base no se extienden cambios compartidos/globales.

Adopción del nuevo lenguaje solo fuera del módulo, por composición u opciones
explícitas cuyo default preserve a los consumidores protegidos. No basta excluir
un selector si cambian herencia, fuentes, portales o proveedores. Evitar forks
completos y detección de rutas ad hoc como sustitutos de una frontera de estilos.
Si no se puede demostrar aislamiento, cambiar el lote o bloquear esa parte;
**nunca editar Partes para compensar un cambio compartido**.

Cada lote verifica: diff/hashes sin cambios protegidos, apariencia y DOM relevantes
sin alteración en estados comparables, interacción/foco/borradores conservados y
contratos de red iguales. Las capturas nuevas de control se guardan fuera de
`propuestas/`; no se reescribe su golden para aprobar el lote. Antialiasing o
instantes variables se identifican explícitamente, no se usan para ignorar cambios
de geometría, color, tipografía, acciones o comportamiento.

### Resultado visual exigido

Aplicar [UX-01–UX-20](DESIGN_SYSTEM.md#rectificación-visual-menos-carga-más-interacción-útil):
superficie principal clara, contexto compacto, estados con color/icono/forma,
acciones junto al dato, tooltips secundarios y modales acotados. Movimiento breve
para responder a la acción; no ornamentación. Retirar explicaciones repetidas,
no datos ni restricciones. Iconos no sustituyen nombres de decisión críticos.

El [análisis de la referencia](ANALISIS_PROPUESTA_OFICIAL.md) distingue intención
aprobada de simulaciones y limitaciones técnicas. No se exige copiar textos de
9 px, controles diminutos, código de tooltip manual o descartes silenciosos.
La accesibilidad se resuelve en los otros módulos sin tocar la referencia. Reflow
o recolorear una pantalla todavía saturada no supera la puerta visual. Partes no
recibe vista resumida, nuevo editor ni ninguna adaptación por este resultado.

## Secuencia y puertas de control

| Hito | Entrega | Dependencia |
|---|---|---|
| H0 | Documentación versionada, inventario, caracterización, fixtures | Autorización recibida |
| H1 | Fase 1 funcional verificada | H0 |
| H2 | Línea base de pantallas a migrar y registro de Partes congelado, solo en lectura | H1 + recepción de Partes antes de cambios compartidos |
| H3 | Docentes, horario del Monitor y modal de Cursos; fundamentos visuales | H2 |
| H4 | Layout, navegación, acceso, estados globales | H3 |
| H5 | Catálogos y personal | H4 |
| H6 | Horarios, salones, asignaciones, paneles de rol | H5 |
| H7 | Solicitudes, avisos, incidencias, reportes | H6 |
| H8 | Control de no alteración de Partes y sus evidencias; **cero implementación en el módulo** | H7 + línea base congelada |
| H9 | Importación, generación, configuración | H8 |
| H10 | Regresión integral, documentos y entrega | Todos |

Pilotos H3: tabla de Docentes, horario del Monitor **fuera de Partes** y modal de
Cursos. Este último sustituye el piloto retirado de evidencias; no se traslada el
trabajo de Partes a un piloto con otro nombre. Validar densidad, identidad, ayudas
y overlays en los tres antes de extender. Un lote = familia pequeña o cambio
opt-in compartido, revisando todos sus consumidores. No mezclar estética y lógica.

Por lote de Fase 2: (1) mapa de datos/acciones/estados y consumidores; (2) propuesta
de composición fiel a la referencia; (3) inventario de textos retirados/trasladados
y destino accesible; (4) adaptación visual sin mover estado/efectos; (5) regresión
funcional y accesible; (6) control de Partes; (7) evidencia y avance. Detener el lote
afectado si exige cambiar funcionalidad, no «resolverlo» dentro de presentación.

### Fase 1 (H1)

Antecedente conservado para trazabilidad: H1 consta verificado. Las excepciones
R-P01/R-P02/D-05 no autorizan nuevos cambios en Partes ni reabrir funcionalidad.
Un nuevo defecto requiere encargo funcional separado, fuera del refactor visual.

1. **F1.0:** registrar versiones/cambios previos, caracterizar errores, reconciliar
   pruebas/documentación, preparar fixtures. Verificar el fallo entre desasignar
   y asignar docente en salón; es un riesgo, no reingeniería aprobada.
2. **F1.1 / R-N01 / D-01:** contexto operativo sin depender de consulta admin;
   cuenta/rol/proceso del endpoint autorizado, caché fría por rol, aislamiento
   de destinatarios, cambio de cuenta/proceso, SSE y sondeo. Resolver aviso no
   decide solicitud. Revisar solicitudes, campana, avisos, Excel e incidencias.
3. **F1.2 / R-P02:** filtro administrativo desde catálogo autorizado, filtro de
   servidor, reinicio de página, «Todos», selección estable con resultado vacío;
   no ampliar permisos de monitor/supervisor.
4. **F1.3 / R-P01:** listado fechado del monitor en `/monitor/partes`; agrupar por
   fecha/salón/turno sin inventar ID diario ni agrupar una página incompleta.
   Evaluar lectura existente; solo si hace falta, lectura agrupada paginada.
   Apertura con todos los bloques, retorno con contexto, rango/orden explícitos,
   históricos sin reconstrucción y conservación de borradores/conflictos/subidas.
   No imponer el nuevo recorrido a otros roles.
5. **F1.4 / R-I01:** pruebas reales de incidencias, corregir solo errores
   reproducidos. Monitor: docente/alumno/aula, docente efectivo, sin DNI,
   edición/retirada sin borrar antecedente. Supervisor: sus monitores, hoy Lima,
   recursos ajenos/antecedentes propios rechazados. Admin: DNI entre procesos,
   resolver/reabrir/versiones/historial, avisos en personal/importación.
   Confirmar persistencia y protección de borradores, no solo un toast.
6. **F1.5 / D-03 / D-04:** distinguir carga/error/vacío en Supervisor y
   Configuración; eliminar interactividad anidada sin cambiar destinos/acciones.
   Añadir regresiones sin rediseñar.

**Puerta H1:** R-P01/R-P02/R-N01/R-I01 verificados; defectos confirmados
resueltos; riesgo clasificado; navegador actualizado; contratos reconciliados y
línea base funcional posterior a correcciones. No empezar presentación antes.

## Calidad obligatoria

- Capturar ruta, rol, variante, fixture, campos/acciones/columnas/filtros, HTTP,
  teclado y estados de cada pantalla. No confundir mocks con integración.
- Durante Fase 2 comparar método/endpoint, payload/omisiones, headers, versión,
  persistencia e invalidación; previsualizar/cancelar nunca escribe. Separar las
  diferencias autorizadas de Fase 1.
- Reutilizar CLI Playwright gestionada y harness aislado. No instalar otra copia.
  Reiniciar fixtures mutables; solo identidades/archivos sintéticos.
- Resoluciones: 1920×1080 principal; 1440, 1366, 2560, 3440, 1024, 768, 390,
  320 px; zoom 200 % y reflow cuando corresponda.
- WCAG 2.2 AA aplicable: teclado, foco visible no tapado, aislamiento/retorno en
  overlays, etiquetas/nombres, contraste, estados no solo color, anuncios,
  alternativa al clic de filas, movimiento reducido y lector de pantalla manual.
- Ayudas: hover/foco, Escape, permanencia al pasar el puntero, táctil sin hover,
  colisiones en los bordes, scroll de tabla, zoom y diálogos en top layer. No
  confundir `title` o `aria-label` con una ayuda contextual visible y accesible.
- Estado preparado/guardado/error y reglas de habilitación iguales antes/después;
  sin nuevos pasos, escrituras, cálculos, autoguardado o descartes por cerrar.
- Chromium inicial. No afirmar Firefox/WebKit/lector de pantalla sin ejecutarlos.
- Medir antes/después con mismos datos; vigilar bundle, layout e interacción.
  Sin consultas por fila, carga masiva de evidencias ni virtualización sin medir.
  Presupuestos definitivos después de H2, no inventar métricas. La adopción de
  Floating UI registra versión/licencia, delta de JS/gzip y limpieza de observadores;
  no se declara «eficiente» por una cifra publicitaria o por estar tree-shakeable.
- Frontend: lint, typecheck, build, test:availability, test:partes,
  test:partes:browser y nuevas regresiones del lote.
- Backend: lint/typecheck y suites afectadas; partes, archivos, operaciones,
  disponibilidad, importaciones, autenticación/seguridad; regresión final.
  Si falta herramienta local, usar Docker declarado, no instalaciones globales.

En este encargo documental se validan enlaces, coherencia de alcance y conservación
de archivos protegidos; no se declara lint/build/regresión de producto ejecutados
por haber revisado una maqueta. En implementación futura, las suites se ejecutan
sin modificar Partes, backend o pruebas protegidas para conseguir verde.

## Cierre de pantalla y entrega

Verificada solo si conserva campos/acciones/datos/opciones, rutas/permisos y
contratos; estados aplicables, teclado/responsive y pruebas comprobados; capturas
revisadas/aprobadas, sin errores JS/HTTP inesperados e inventario actualizado.
Una captura bonita no basta. Registrar cualquier defecto funcional nuevo fuera
del lote estético. No eliminar información para simplificar. Añadir evidencia de
fidelidad a la referencia y acta de no alteración de Partes en cada lote. H8 se
cierra solo comprobando su conservación, nunca «modernizando» el módulo. No dar
por implementado el producto por este cambio de planes.

## Riesgos y reversión

Registrar y mitigar: contratos históricos incorrectos; blast radius de compartidos;
pérdida de borradores por remontaje; caché entre procesos; información oculta;
confusión ejecución/revisión/autorización; jornadas truncadas; permisos ampliados;
pruebas históricas verdes; bundle/sobrediseño; trabajo ajeno sobrescrito.

Lotes identificables por repositorio y pareja de versiones validada. Mantener el
artefacto desplegable anterior; retirada solo del lote defectuoso, nunca reset
amplio, descarte de cambios previos ni eliminación de datos.
