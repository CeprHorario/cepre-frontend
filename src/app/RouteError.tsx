import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** Pantalla de error inesperado con el detalle técnico plegado */
export function RouteError() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : String(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-white">
        <EmptyState
          icon={<FiAlertTriangle />}
          title="Algo salió mal"
          description="Recarga la página. Si el problema continúa, envía una captura de esta pantalla a soporte."
          action={<Button onClick={() => window.location.reload()}>Recargar</Button>}
        />
        <details className="border-t border-line-soft px-6 py-4 text-xs text-ink-500">
          <summary className="cursor-pointer font-semibold">Detalle técnico</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3">{detail}</pre>
        </details>
      </div>
    </div>
  );
}
