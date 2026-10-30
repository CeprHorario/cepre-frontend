import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BEFORE_LOGOUT_EVENT } from "@/api/client";
import { useAuth } from "@/auth/AuthProvider";
import { toDraft } from "./model";
import type { Workspace } from "./useParts";

/** Vive fuera de las rutas: mantenimiento o pérdida de acceso no desprotegen los borradores. */
export function usePartsSessionProtection() {
  const client = useQueryClient();
  const { logout } = useAuth();
  const [confirmExit, setConfirmExit] = useState(false);
  useEffect(() => {
    const pending = () => client.getQueriesData<Workspace>({ queryKey: ["parts"], predicate: query => query.queryKey[3] === "workspace" })
      .map(([, data]) => data).filter((data): data is Workspace => Boolean(data))
      .filter(s => s.inFlight || s.reviewDirty || s.operation || Object.keys(s.pendingFiles).length || (s.base && s.draft && JSON.stringify(toDraft(s.base)) !== JSON.stringify(s.draft)));
    const beforeUnload = (event: BeforeUnloadEvent) => { if (pending().length) { event.preventDefault(); event.returnValue = ""; } };
    const beforeLogout = (event: Event) => {
      const workspaces = pending();
      if (!workspaces.length) return;
      event.preventDefault();
      if (workspaces.some(s => s.inFlight)) toast.warn("Hay una operación de partes en curso. Espera su resultado antes de cerrar sesión.");
      else setConfirmExit(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener(BEFORE_LOGOUT_EVENT, beforeLogout);
    return () => { window.removeEventListener("beforeunload", beforeUnload); window.removeEventListener(BEFORE_LOGOUT_EVENT, beforeLogout); };
  }, [client]);
  return {
    confirmExit,
    keepDrafts: () => setConfirmExit(false),
    discardAndLogout: () => {
      const running = client.getQueriesData<Workspace>({ queryKey: ["parts"], predicate: query => query.queryKey[3] === "workspace" }).some(([, s]) => s?.inFlight);
      if (running) { toast.warn("Espera a que termine la operación de partes antes de cerrar sesión."); return; }
      // Conservar entradas válidas hasta confirmar logout: si la red falla, la vista sigue operable.
      for (const [key, workspace] of client.getQueriesData<Workspace>({ queryKey: ["parts"], predicate: query => query.queryKey[3] === "workspace" })) {
        if (!workspace) continue;
        client.setQueryData<Workspace>(key, { ...workspace, draft: workspace.base ? toDraft(workspace.base) : null,
          review: { result: "CONFORMING", comments: "", confirmed: false }, reviewDirty: false, pendingFiles: {},
          operation: null, operationBase: null, operationTargets: [], targets: [], conflict: false });
      }
      setConfirmExit(false); logout();
    },
  };
}
