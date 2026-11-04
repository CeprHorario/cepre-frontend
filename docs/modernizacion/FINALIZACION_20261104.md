# Enmienda de ejecución ·2026-11-04

Esta enmienda aplica al plan externo `cepr-finalizacion-autonoma/00-LEER-PRIMERO.md`.
El estado único es `/home/joel/.opencode/plan/cepr-finalizacion-autonoma/08-PROGRESO.md`.
No sustituye ni regenera evidencia histórica ni manifiestos protegidos.

## Precedencia y alcance vigente

D-01: entrega local sintética, sin despliegue. D-02: retirar el stub sin
consumidores funcionales conocidos. D-03/04: conservar Partes salvo logo,
navegación, notificaciones y usuario de la cabecera global. D-05: continuar sin
aprobaciones intermedias. La autorización nueva sustituye solo las prohibiciones
históricas incompatibles: K-01 se corrige en lote funcional independiente; no se
reabren reglas RN/RE ni el resto del módulo congelado.

Partes **ya está implementado y recibido**:56/56 huellas coincidentes al iniciar;
16/16 huellas de referencia intactas. Los textos históricos «se recibirá después»
y «solo análisis» son antecedentes superados, no el estado actual. Antes de tocar
header se exige la enmienda separada antes/después; todavía no se ha aplicado.

## Resultado funcional comprobado

- Sustitución semanal única con precondición, transacción serializable, cargas
  exactas y rollback/carreras: [contrato backend](../../../backend/docs/schedule-replacement.md).
- Candidatos por páginas20 sin total inventado; acceso posterior a8/50, error y
  reintento, respuesta tardía aislada. Error de salón y dependencias distinto de
  inexistencia/vacío; datos previos conservados y asignación bloqueada si obsoletos.
- Evidencias nuevas en [finalizacion-20261104](evidence/finalizacion-20261104/):
  `backend-chromium.json`11 controles; `salones-chromium.json`45;
  `salones-estados-chromium.json`8. Persistencia real, fallos UI declarados inyectados.
- Pruebas de calidad, PostgreSQL y volumen detalladas en la
  [guía local](../../../backend/docs/entrega-local.md); no son regresión final del
  rediseño aún no completado.

## Estado visual y límites

E0–E2 cerrados; E3 en ejecución. E4–E11 todavía abiertos. H2/H3/H4 históricos
siguen parciales; no se cierran por esta nota ni por reutilizar capturas viejas.
No hay cambios de estilo en Partes/header durante el lote funcional.

Se comprobó que Firefox/WebKit gestionados no están instalados y faltan Orca y
la pila local de lectura de pantalla. Sus errores reales se conservan en evidencia;
no instalar herramientas globales ni afirmar compatibilidad/accesibilidad integral.
Continuar todo lo independiente y mantener V-08 abierto mientras un control
obligatorio o una fase ejecutable permanezcan pendientes.
