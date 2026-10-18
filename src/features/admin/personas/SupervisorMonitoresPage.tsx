import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiChevronLeft, FiMinus, FiPlus } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAreas, useMonitorsFiltered, useShifts, useSupervisorMonitors, useSupervisorMutations, useSupervisors } from "@/api/queries";
import type { MonitorAssignment, SupervisorSummary } from "@/api/types";
import { AreaBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, PageHeader } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Spinner";
import { fullName, shortClassName } from "@/lib/format";

export function SupervisorMonitoresPage({ basePath }: { basePath: string }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const fromState = (useLocation().state as { supervisor?: SupervisorSummary } | null)?.supervisor;
  const fallback = useSupervisors({ page: 1, limit: 100 });
  const supervisor = fromState ?? fallback.data?.data.find((s) => s.id === id);
  const shifts = useShifts();
  const areas = useAreas();
  const [areaId, setAreaId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const assigned = useSupervisorMonitors(id);
  const available = useMonitorsFiltered({ shiftId: supervisor?.shiftId, page, limit: 12, areaId });
  const { assign, remove } = useSupervisorMutations();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (monitor: MonitorAssignment, action: "assign" | "remove") => {
    setBusy(monitor.monitorId);
    try {
      if (action === "assign") await assign.mutateAsync({ supervisorId: id, monitorId: monitor.monitorId });
      else await remove.mutateAsync(monitor.monitorId);
      toast.success(action === "assign" ? `${shortClassName(monitor.className)} asignado` : `${shortClassName(monitor.className)} quitado`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo actualizar la asignación"));
    } finally {
      setBusy(null);
    }
  };

  const shiftName = shifts.data?.find((s) => s.id === supervisor?.shiftId)?.name;
  const list = assigned.data?.monitores_asignados ?? [];

  return (
    <>
      <PageHeader
        back={
          <IconButton label="Volver a supervisores" onClick={() => navigate(basePath)}>
            <FiChevronLeft />
          </IconButton>
        }
        title={`Monitores de ${fullName(supervisor) || "supervisor"}`}
        description={shiftName ? `Supervisa el ${shiftName}` : "Sin turno asignado: edita al supervisor para elegir su turno."}
      />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <CardHeader title="Asignados" description={`${list.length} monitores`} />
          {assigned.isLoading ? (
            <Skeleton className="h-40" />
          ) : list.length === 0 ? (
            <EmptyState title="Sin monitores" description="Agrega monitores desde la lista de disponibles." />
          ) : (
            <ul className="flex flex-col gap-2">
              {list.map((m) => (
                <MonitorRow key={m.monitorId} monitor={m} busy={busy === m.monitorId} action={
                  <Button size="sm" variant="secondary" icon={<FiMinus />} loading={busy === m.monitorId} onClick={() => run(m, "remove")}>
                    Quitar
                  </Button>
                } />
              ))}
            </ul>
          )}
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <CardHeader
            title="Disponibles"
            description={shiftName ? `Monitores del ${shiftName} sin supervisor` : undefined}
            actions={
              <Select aria-label="Área" className="w-auto" value={areaId ?? ""} onChange={(e) => { setAreaId(e.target.value ? Number(e.target.value) : null); setPage(1); }}>
                <option value="">Todas las áreas</option>
                {(areas.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            }
          />
          {!supervisor?.shiftId ? (
            <EmptyState title="Elige un turno" description="El supervisor necesita un turno para listar monitores disponibles." />
          ) : available.isLoading ? (
            <Skeleton className="h-40" />
          ) : (available.data?.data.length ?? 0) === 0 ? (
            <EmptyState title="No hay monitores libres" description="Todos los monitores de este turno ya tienen supervisor." />
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {available.data!.data.map((m) => (
                  <MonitorRow key={m.monitorId} monitor={m} busy={busy === m.monitorId} action={
                    <Button size="sm" icon={<FiPlus />} loading={busy === m.monitorId} onClick={() => run(m, "assign")}>
                      Asignar
                    </Button>
                  } />
                ))}
              </ul>
              <Pagination page={page} limit={12} total={available.data!.total} noun="monitores" onPage={setPage} />
            </>
          )}
        </Card>
      </div>
    </>
  );
}

function MonitorRow({ monitor, action }: { monitor: MonitorAssignment; busy: boolean; action: React.ReactNode }) {
  const name = fullName(monitor);
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2">
          <strong className="text-sm">{shortClassName(monitor.className)}</strong>
          <AreaBadge name={monitor.areaName} />
        </span>
        <span className="truncate text-xs text-ink-500">{name || monitor.email}</span>
      </div>
      {action}
    </li>
  );
}
