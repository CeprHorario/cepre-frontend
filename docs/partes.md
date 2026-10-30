# Partes operativos

Integración real en `/monitor/partes`, `/supervisor/partes` y `/admin/partes`. Los enlaces están en los paneles existentes. `front-demo/` solo aporta la referencia visual; no se copiaron lógica, fixtures, dependencias ni reglas de esa demo.

## Capas y seguridad

- `src/features/partes/types.ts`: contrato contrastado con controladores, DTO y servicios actuales.
- `service.ts`: cliente Axios existente, cookies, cancelación de lecturas, multipart `file` y descarga privada binaria. Instancia vinculada a cuenta/proceso mediante precondiciones, nunca selector de esquema.
- `model.ts`: fechas académicas, America/Lima, diferencias del borrador, versión original, cierre exclusivo y configuración nullable.
- `useParts.ts`: consultas con claves cuenta/proceso/recurso/filtros, borrador separado del servidor, exclusión de escrituras, conflictos sin retry y resultados parciales explícitos.
- `PartsPage.tsx`: composición/autorización de contexto; `PartsView.tsx` y `partes.css`: presentación por props. Los hooks no importan estilos ni renderizan componentes.
- `usePartsSessionProtection.ts` y `PartsSessionProtection.tsx`: protección de salida fuera de las rutas. Sigue funcionando durante mantenimiento y pérdida de acceso. Logout con pendientes requiere descarte explícito; con operaciones en curso se bloquea.

No se consulta el catálogo general de personas desde monitor/supervisor. `/class-session-records/:id/people` devuelve personas activas autorizadas; su selección no promete disponibilidad ni autoriza cobertura. Los catálogos generales de aulas/bloques se usan exclusivamente en administración para recuperaciones.

El contexto procede de `GET /class-session-records/context`; las precondiciones `X-Class-Session-Context` y `X-Class-Session-Account` solo comprueban que no cambió entre peticiones. Backend sigue escogiendo el proceso y verificando recurso/rol/reloj. No se envía `x-schema`.

Los borradores permanecen en memoria por cuenta/proceso, incluidas revisiones, operaciones y metadata de subidas. Cambiar de proceso los pone en cuarentena, no los traslada. No se guardan datos en Web Storage. Logout confirmado los elimina; una respuesta tardía no puede recrearlos. Una recarga forzada pierde los borradores después del aviso nativo.

## Semántica de operaciones

- Guardar no registra automáticamente horas programadas ni infiere ausencia/tardanza.
- Solicitar/autorizar reemplazo no declara ejecución. Resultado del titular, cobertura y efectivos son hechos separados.
- Subir PNG no registra evidencia: hay que asociarlo con la versión vigente. Cerrar el plazo entre ambos pasos bloquea asociación. Descartar metadata pendiente no borra archivos.
- Cierre original nunca cambia. Revisión, acuse de alerta y resolución administrativa no requieren habilitar la edición ordinaria.
- Revisión explícita corresponde a una versión; una edición posterior la vuelve histórica.
- Anulación/restauración de múltiples partes son operaciones separadas: parada al primer error, progreso confirmado conservado y ningún retry automático. Destinos y versiones quedan congelados en el borrador de operación.
- Reportes y resumen proceden del servidor; no se suman páginas ni se inventan reglas de pagos. Decimales del detalle son strings SQL, no números JSON.

Contrato completo y justificación de las adiciones mínimas: `backend/docs/class-session-records.md`.

## Reproducir la verificación

Desde la raíz `cepr/`, seguir `backend/test/records-browser.md` para iniciar el harness aislado. No utiliza cuentas, schemas ni GCS productivos. Para repetir la suite completa, reiniciar **solo el backend del harness** antes: los recorridos modifican sus fixtures y no son idempotentes.

Frontend, en una terminal separada:

```sh
VITE_API_BACK_URL=http://127.0.0.1:3000 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

La repetición final también pasó sobre el **compilado de producción**, servido sin HMR:

```sh
VITE_API_BACK_URL=http://127.0.0.1:3000 npm --prefix frontend run build
npm --prefix frontend run preview -- --host 127.0.0.1 --port 5174 --strictPort
```

Comprobaciones:

```sh
npm --prefix frontend run lint
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix frontend run test:availability
npm --prefix frontend run test:partes
npm --prefix frontend run test:partes:browser
```

La última usa `playwright-cli` gestionada (sin instalar paquetes), genera un PNG sintético con stdlib Node, abre un perfil Chromium en memoria por suite, valida los resultados y cierra sus sesiones. Conserva solo screenshots y JSON de resultados, nunca estado de autenticación. Comprueba 25 recorridos de monitor/supervisor/admin, aislamiento de cuentas/procesos, sesión, mantenimiento, cierre, GCS, concurrencia y teclado/móvil. La prueba de carrera retiene la **respuesta** de una subida real después de su ejecución, no simula el servidor ni reenvía multipart. También comprueba que un fallo de red al cerrar sesión después del descarte explícito no inutiliza el workspace.

El runner escribe los JSON después de cerrar todos sus navegadores: escribirlos entre suites bajo `vite dev` provoca recargas de archivos vigilados que invalidan los borradores y el resultado del propio recorrido. Una salida vacía de la CLI nunca se considera éxito; solo se acepta el resultado explícito `ok:true`, sin repetir mutaciones.

Evidencia: [índice de capturas y resultados](partes-evidence/README.md).

## Límites verificados

Chromium local; no auditoría de lector de pantalla ni Firefox/WebKit. El harness sustituye runtime/registro y revocación distribuida, no valida OAuth/Firestore/ADC/IAM productivos. La cuenta compartida, la imagen y la confirmación explícita no prueban identidad física ni atención humana. No se modificaron esquemas existentes del usuario ni las demos.
