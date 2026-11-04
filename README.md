# CEPRUNSA · frontend

Gestión de horarios, personal, salones, procesos, solicitudes, incidencias y
Partes. React19/TypeScript, Vite6, Tailwind4, Router7, TanStack Query5 y Axios.
Backend y frontend son repositorios independientes bajo el mismo workspace.

## Desarrollo local

Usar Node compatible con las dependencias fijadas por `package-lock.json` y npm.
El entorno de backend exige Node24/npm11; preferir la misma versión para ambos.
Instalar solo si faltan dependencias: `npm ci`. No guardar secretos en variables
`VITE_*`: sus valores se incorporan al navegador.

```sh
VITE_API_BACK_URL=http://127.0.0.1:8080 npm run dev -- --host 127.0.0.1
```

`VITE_API_BACK_URL` es el origen del backend **sin `/api`**. El cliente añade ese
prefijo. Configurar en backend `REDIRECT_FRONT` con el origen exacto del frontend.
La sesión usa cookie HttpOnly y credenciales; OAuth real no forma parte del
harness. No introducir tokens en URL, localStorage ni archivos de pruebas.

```sh
npm run typecheck
npm run lint
npm run test:availability
npm run test:partes
VITE_API_BACK_URL=http://127.0.0.1:8080 npm run build
npm run preview -- --host 127.0.0.1 --port 5189 --strictPort
```

En el árbol recibido, lint tiene11 advertencias Fast Refresh y el build avisa por
un chunk grande; no se han suprimido reglas ni elevado umbrales para ocultarlos.
Las pruebas puras no sustituyen las pruebas de navegador/API/DB.

## Verificación integrada exclusivamente sintética

Seguir el [harness local](../backend/test/records-browser.md) en un proyecto
Compose propio, sin bases del usuario. Esta ejecución usa API3109/origen5189;
[procedimiento local](../backend/docs/entrega-local.md). Compilar expresamente
contra3109, no reutilizar valores de un `.env.local` ajeno.

```sh
VITE_API_BACK_URL=http://127.0.0.1:3109 npm run build
npm run preview -- --host 127.0.0.1 --port 5189 --strictPort
node tests/run-finalization.mjs backend
node tests/run-finalization.mjs salones
node tests/run-finalization.mjs salones-estados
node tests/run-finalization.mjs baseline
```

El runner adicional usa `playwright-core` **gestionado por playwright-cli0.1.21**,
no instala ni actualiza paquetes. `PLAYWRIGHT_CORE_PATH` permite indicar su ruta
gestionada; `FINALIZATION_API`, `FINALIZATION_ORIGIN`, `FINALIZATION_COMPOSE` y
`FINALIZATION_OUTPUT` parametrizan la instancia y evidencias. Solo permite HTTP
loopback. `FINALIZATION_ENGINE=firefox|webkit` exige motores ya disponibles; la
ausencia se registra como bloqueo, nunca como pase. Salones prepara y modifica
solo fixtures sintéticos del harness propio; ejecutar suites mutantes en serie.

Los scripts históricos `test:partes:browser` y `test:modernizacion:*` siguen
existiendo; sus evidencias anteriores no prueban esta ejecución. No ejecutar
runners que sobrescriban capturas de referencia ni detener procesos ajenos.

## Contratos y estado

- [Roles y lógica compartida](docs/ROLES.md), [operaciones](docs/OPERACIONES.md).
- [Partes](docs/partes.md): núcleo congelado; única excepción autorizada, cabecera
  global. Referencia y manifiesto original intactos.
- [Enmienda de alcance y verificación](docs/modernizacion/FINALIZACION_20261104.md).
- [Sistema visual](docs/modernizacion/DESIGN_SYSTEM.md).

La modernización integral sigue en curso. No hay despliegue ni certificación
integral de accesibilidad/compatibilidad sin ejecutar sus controles obligatorios.
