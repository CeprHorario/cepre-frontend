# cepre-frontend

- React 19 + TypeScript estricto + Vite + Tailwind v4 + React Query. Verificar con `npm run typecheck` y `npx eslint src`.
- Varios roles (admin, coordinador, docente, monitor, supervisor) comparten lógica. Antes de cambiar una pantalla de rol, lee `docs/ROLES.md`: si la lógica tiene un componente o hook dueño, cambia ese dueño y no la pantalla, y prueba con cada rol que lo usa.
