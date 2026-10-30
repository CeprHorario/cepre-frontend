import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, ROLE_HOME } from "@/auth/AuthProvider";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Button, ButtonLink } from "@/components/ui/Button";
import { apiErrorMessage } from "@/api/client";
import { readPartContext } from "./service";
import { useParts } from "./useParts";
import { PartsView } from "./PartsView";
import type { PartContext, PartRole } from "./types";

function Workspace({ context, role, onContextChanged }: { context: PartContext; role: PartRole; onContextChanged: () => void }) {
  return <PartsView {...useParts(context, role, onContextChanged)} />;
}

export function PartsPage() {
  const { user, status } = useAuth();
  const client = useQueryClient();
  const previousScope = useRef<readonly unknown[] | null>(null);
  const [contextNotice, setContextNotice] = useState("");
  const role = user?.role;
  const allowed = role === "monitor" || role === "supervisor" || role === "administrador";
  const context = useQuery({ queryKey: ["parts-context", user?.id, role], queryFn: ({ signal }) => readPartContext(signal), enabled: allowed && (!status?.maintenance || role === "administrador"), retry: false, staleTime: 0, refetchInterval: 15_000, refetchOnWindowFocus: true });
  const refreshContext = useCallback(() => { void client.invalidateQueries({ queryKey: ["parts-context"] }); }, [client]);
  useEffect(() => {
    if (context.data && context.data.accountId !== user?.id) void client.invalidateQueries({ queryKey: ["me"] });
  }, [client, context.data, user?.id]);
  useEffect(() => {
    if (!context.data || context.data.accountId !== user?.id) return;
    const scope = ["parts", context.data.accountId, context.data.process] as const;
    if (previousScope.current && JSON.stringify(previousScope.current) !== JSON.stringify(scope)) {
      void client.cancelQueries({ queryKey: previousScope.current });
      client.removeQueries({ queryKey: previousScope.current, predicate: q => q.queryKey[3] !== "workspace" });
      setContextNotice("Cambió la cuenta o el proceso autorizado. Los borradores anteriores quedan aislados en memoria y solo se recuperan al volver a su cuenta y proceso; no se trasladan ni se envían automáticamente. Cerrar sesión los elimina.");
    }
    previousScope.current = scope;
  }, [client, context.data, user?.id]);
  if (!user || !allowed) return null;
  return <SimpleLayout crumbs={[{ label: "Inicio", to: ROLE_HOME[user.role] }, { label: "Partes" }]}>
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-5 sm:px-8">
      <div><ButtonLink size="sm" variant="ghost" to={ROLE_HOME[user.role]}>Volver al panel</ButtonLink></div>
      {contextNotice && <p role="status">{contextNotice}</p>}
      {context.isError ? <section role="alert"><p>{apiErrorMessage(context.error)}</p><p>Los datos y borradores del contexto anterior no se usarán para escribir en otro proceso.</p><Button onClick={refreshContext}>Verificar acceso</Button></section> : context.data && context.data.accountId === user.id ? <Workspace key={`${context.data.accountId}:${context.data.process}`} context={context.data} role={role} onContextChanged={refreshContext} /> : <p role="status">Verificando cuenta y proceso autorizado…</p>}
    </div>
  </SimpleLayout>;
}
