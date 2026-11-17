import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, ROLE_HOME } from "@/auth/AuthProvider";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/api/client";
import { readPartWorkspace } from "./service";
import { useParts } from "./useParts";
import { PartsView } from "./PartsView";
import { MonitorJournals } from './MonitorJournals';
import { PartsClassrooms } from './PartsClassrooms';
import type { PartWorkspace, PartRole } from "./types";

function Workspace({ bootstrap, role, onContextChanged }: { bootstrap: PartWorkspace; role: PartRole; onContextChanged: () => void }) {
  const props = useParts(bootstrap.context, role, onContextChanged, bootstrap);
  const [area, setArea] = useState('');
  if (props.showJournals && role === 'administrador' && !props.journalFilters.classId) return <PartsClassrooms classes={props.classrooms} loading={props.classroomsLoading} error={props.error} area={area} onArea={setArea} onSelect={id => props.onJournalFilters({...props.journalFilters,classId:id,page:1})} onRefresh={props.onRefreshClassrooms} />;
  if (props.showJournals) return <>{role === 'administrador' && <div className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-6"><Button variant="secondary" onClick={() => props.onJournalFilters({...props.journalFilters,classId:undefined,page:1})}>Volver a salones</Button></div>}<MonitorJournals {...props} fixedClass={role === 'administrador'} /></>;
  return <><div className="px-4 pt-3"><Button variant="secondary" disabled={props.busy} onClick={() => props.onShowJournals(true)}>Volver a la lista</Button></div><PartsView {...props} /></>;
}

export function PartsPage() {
  const { user, status } = useAuth();
  const client = useQueryClient();
  const previousScope = useRef<readonly unknown[] | null>(null);
  const [contextNotice, setContextNotice] = useState("");
  const role = user?.role;
  const allowed = role === "monitor" || role === "supervisor" || role === "administrador";
  const context = useQuery({ queryKey: ["parts-context", user?.id, role], queryFn: ({ signal }) => readPartWorkspace(signal), enabled: allowed && (!status?.maintenance || role === "administrador"), retry: false, staleTime: Infinity, refetchOnWindowFocus: false });
  const refreshContext = useCallback(() => { void client.invalidateQueries({ queryKey: ["parts-context"] }); }, [client]);
  useEffect(() => {
    if (context.data && context.data.context.accountId !== user?.id) void client.invalidateQueries({ queryKey: ["me"] });
  }, [client, context.data, user?.id]);
  useEffect(() => {
    if (!context.data || context.data.context.accountId !== user?.id) return;
    const scope = ["parts", context.data.context.accountId, context.data.context.process] as const;
    if (previousScope.current && JSON.stringify(previousScope.current) !== JSON.stringify(scope)) {
      void client.cancelQueries({ queryKey: previousScope.current });
      client.removeQueries({ queryKey: previousScope.current, predicate: q => q.queryKey[3] !== "workspace" });
      setContextNotice("Cambió la cuenta o el proceso autorizado. Los borradores anteriores quedan aislados en memoria y solo se recuperan al volver a su cuenta y proceso; no se trasladan ni se envían automáticamente. Cerrar sesión los elimina.");
    }
    previousScope.current = scope;
  }, [client, context.data, user?.id]);
  if (!user || !allowed) return null;
  return <SimpleLayout appearance="parts" crumbs={[{ label: `Panel ${role === 'monitor' ? 'del monitor' : role === 'supervisor' ? 'del supervisor' : 'de administración'}`, to: ROLE_HOME[user.role] }, { label: "Partes" }]}>
    <div className="parts-page">
      {contextNotice && <p role="status">{contextNotice}</p>}
      {context.isError ? <section role="alert"><p>{apiErrorMessage(context.error)}</p><p>Los datos y borradores del contexto anterior no se usarán para escribir en otro proceso.</p><Button onClick={refreshContext}>Verificar acceso</Button></section> : context.data && context.data.context.accountId === user.id ? <Workspace key={`${context.data.context.accountId}:${context.data.context.process}`} bootstrap={context.data} role={role} onContextChanged={refreshContext} /> : <p role="status">Verificando cuenta y proceso autorizado…</p>}
    </div>
  </SimpleLayout>;
}
