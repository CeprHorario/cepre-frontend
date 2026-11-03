# Modernización integral CEPRUNSA

Contrato de ejecución autorizado por el usuario el 2026-11-03. Conservar producto,
arquitectura y capacidades; cerrar primero funcionalidad y después reconstruir la
presentación por módulos. No es autorización para publicar en producción, usar
datos reales ni descartar cambios ajenos.

## Fuentes y control

- [Inventario](SYSTEM_INVENTORY.md): rutas, variantes, superficies y estados.
- [Contrato funcional](FUNCTIONAL_CONTRACT.md): invariantes y excepciones de Fase 1.
- [Diseño](DESIGN_SYSTEM.md): dirección y criterios de presentación.
- [Progreso](MIGRATION_PROGRESS.md): requisitos, resultados y evidencias vigentes.
- [Traspaso](AGENT_HANDOFF.md): estado operativo y siguiente acción exacta.
- [Operaciones](../OPERACIONES.md), [roles](../ROLES.md), [partes](../partes.md):
  contratos especializados; reconciliar con fuente/servidor, nunca con las demos.

Cada tarea: **ID → origen → requisito → contrato → implementación → prueba →
evidencia → estado**. Estados: Identificado, Pendiente de confirmar, Preparado,
En ejecución, Implementado sin verificar, Verificado, Bloqueado.
«Implementado» nunca equivale a terminado. En cada checkpoint actualizar progreso,
decisiones, desviaciones y siguiente paso; al interrumpir, actualizar el traspaso.

## Alcance y exclusiones

Conservar React 19, TypeScript, Vite 6, Tailwind 4, React Router 7, TanStack Query 5,
Axios, React Icons y componentes compartidos. No añadir bibliotecas por defecto,
otra aplicación, navegación alternativa, infraestructura genérica ni animación
externa. Mantener guinda/marino/dorado, Montserrat y Open Sans.

Frontend y backend son repositorios separados. Backend NestJS/PostgreSQL
multiesquema/Prisma queda fuera del rediseño; Fase 1 admite únicamente soporte
funcional mínimo demostrado. No hay migraciones de datos en Fase 2. `front-demo/`
y `partes-preview/` no son fuentes de reglas. Capturas antiguas son históricas.

## Secuencia y puertas de control

| Hito | Entrega | Dependencia |
|---|---|---|
| H0 | Documentación versionada, inventario, caracterización, fixtures | Autorización recibida |
| H1 | Fase 1 funcional verificada | H0 |
| H2 | Línea base funcional/visual de todas las pantallas | H1 |
| H3 | Tres pilotos y fundamentos visuales aprobados | H2 |
| H4 | Layout, navegación, acceso, estados globales | H3 |
| H5 | Catálogos y personal | H4 |
| H6 | Horarios, salones, asignaciones, paneles de rol | H5 |
| H7 | Solicitudes, avisos, incidencias, reportes | H6 |
| H8 | Partes y evidencias | H7 |
| H9 | Importación, generación, configuración | H8 |
| H10 | Regresión integral, documentos y entrega | Todos |

Pilotos H3: tabla de Docentes, horario del Monitor y evidencias de Partes. No
extender un lenguaje visual antes de validar densidad, identidad y overlays en
los tres. Un lote = componente compartido o familia pequeña; revisar también
consumidores todavía no migrados. No mezclar estética y correcciones funcionales.

### Fase 1 (H1)

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
- Chromium inicial. No afirmar Firefox/WebKit/lector de pantalla sin ejecutarlos.
- Medir antes/después con mismos datos; vigilar bundle, layout e interacción.
  Sin consultas por fila, carga masiva de evidencias ni virtualización sin medir.
  Presupuestos definitivos después de H2, no inventar métricas.
- Frontend: lint, typecheck, build, test:availability, test:partes,
  test:partes:browser y nuevas regresiones del lote.
- Backend: lint/typecheck y suites afectadas; partes, archivos, operaciones,
  disponibilidad, importaciones, autenticación/seguridad; regresión final.
  Si falta herramienta local, usar Docker declarado, no instalaciones globales.

## Cierre de pantalla y entrega

Verificada solo si conserva campos/acciones/datos/opciones, rutas/permisos y
contratos; estados aplicables, teclado/responsive y pruebas comprobados; capturas
revisadas/aprobadas, sin errores JS/HTTP inesperados e inventario actualizado.
Una captura bonita no basta. Registrar cualquier defecto funcional nuevo fuera
del lote estético. No eliminar información para simplificar.

## Riesgos y reversión

Registrar y mitigar: contratos históricos incorrectos; blast radius de compartidos;
pérdida de borradores por remontaje; caché entre procesos; información oculta;
confusión ejecución/revisión/autorización; jornadas truncadas; permisos ampliados;
pruebas históricas verdes; bundle/sobrediseño; trabajo ajeno sobrescrito.

Lotes identificables por repositorio y pareja de versiones validada. Mantener el
artefacto desplegable anterior; retirada solo del lote defectuoso, nunca reset
amplio, descarte de cambios previos ni eliminación de datos.
