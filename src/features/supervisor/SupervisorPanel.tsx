import { useEffect, useMemo, useState } from "react";
import { FiMail, FiPhone } from "react-icons/fi";
import { useOwnMonitors } from "@/api/queries";
import type { SupervisorOwnMonitor } from "@/api/types";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { LinkButtons } from "@/components/schedule/LinkButtons";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { TeacherDirectory } from "@/components/schedule/TeacherDirectory";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmailLink, PhoneCopy } from "@/components/ui/Contact";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Spinner";
import { useClassroomSchedule } from "@/features/shared/useClassroomSchedule";
import { cn } from "@/lib/cn";
import { fullName, shortClassName } from "@/lib/format";

export function SupervisorPanel() {
  const monitors = useOwnMonitors();
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (monitors.data ?? [])
      .filter((m) => !onlyMissing || !m.classes?.urlMeet || !m.classes?.urlClassroom)
      .filter((m) => !q || [m.classes?.name, m.profile?.firstName, m.profile?.lastName].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => (a.classes?.name ?? "").localeCompare(b.classes?.name ?? "", undefined, { numeric: true }));
  }, [monitors.data, query, onlyMissing]);

  useEffect(() => {
    if (!selectedId && list[0]) setSelectedId(list[0].user_id);
  }, [list, selectedId]);

  const selected = monitors.data?.find((m) => m.user_id === selectedId) ?? null;
  const missingCount = (monitors.data ?? []).filter((m) => !m.classes?.urlMeet || !m.classes?.urlClassroom).length;

  if (!monitors.isLoading && (monitors.isError || !monitors.data?.length)) {
    return (
      <SimpleLayout greeting subtitle="Supervisor">
        <main className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-8">
          <ButtonLink to="/supervisor/partes">Revisar partes</ButtonLink>
          <Card>
            <EmptyState
              title="Aún no tienes salones a cargo"
              description="Tus salones aparecen cuando la administración te asigna monitores (Gestionar datos → Supervisores → Asignar monitores). Si ya te los asignaron, recarga la página."
            />
          </Card>
        </main>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout greeting subtitle="Supervisor">
      <main className="mx-auto flex w-full max-w-[1400px] flex-wrap items-start gap-5 px-4 py-6 sm:px-8">
        <div className="w-full"><ButtonLink to="/supervisor/partes">Revisar partes</ButtonLink></div>
        <Card className="flex w-full flex-col gap-3 p-4 lg:w-[340px] lg:shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-extrabold text-marino-900">Mis salones</h1>
            <span className="text-[13px] text-ink-500">{monitors.data?.length ?? 0} monitores</span>
          </div>
          <SearchInput placeholder="Buscar salón o monitor" aria-label="Buscar salón" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Segmented
            label="Filtro"
            value={onlyMissing ? "sin" : "todos"}
            onChange={(v) => setOnlyMissing(v === "sin")}
            options={[
              { value: "todos", label: "Todos" },
              { value: "sin", label: `Sin enlaces · ${missingCount}` },
            ]}
          />
          {monitors.isLoading ? (
            <Skeleton className="h-64" />
          ) : !list.length ? (
            <EmptyState title="Sin resultados" description="Ningún salón coincide con la búsqueda o el filtro." />
          ) : (
            <ul className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
              {list.map((m) => (
                <li key={m.user_id}>
                  <button
                    type="button"
                    aria-pressed={m.user_id === selectedId}
                    onClick={() => setSelectedId(m.user_id)}
                    className={cn(
                      "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-1 rounded-xl border px-3.5 py-3 text-left",
                      m.user_id === selectedId ? "border-guinda-700 bg-[#FCF7F8]" : "border-transparent hover:bg-surface-2",
                    )}
                  >
                    <strong className="text-[15px]">{shortClassName(m.classes?.name ?? "Sin salón")}</strong>
                    <LinkButtons meet={m.classes?.urlMeet} classroom={m.classes?.urlClassroom} size="sm" />
                    <span className="col-span-2 truncate text-xs text-ink-500">{fullName(m.profile) || "Monitor sin datos"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="min-w-0 flex-1">{selected ? <SalonDetail monitor={selected} /> : !monitors.isLoading && null}</div>
      </main>
    </SimpleLayout>
  );
}

function SalonDetail({ monitor }: { monitor: SupervisorOwnMonitor }) {
  const { schedule, teachers, colorByCourse, rows, merged } = useClassroomSchedule(monitor.user_id);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="font-display text-xl font-extrabold text-marino-900">{monitor.classes?.name ?? "Salón"}</h2>
          <span className="text-[13px] text-ink-700">
            Monitor: <strong>{fullName(monitor.profile) || "sin datos registrados"}</strong>
          </span>
          <ContactLinks email={monitor.email} personalEmail={monitor.personalEmail} phone={monitor.phone} />
        </div>
        <LinkButtons meet={monitor.classes?.urlMeet} classroom={monitor.classes?.urlClassroom} />
      </Card>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ScheduleView
          title="Horario"
          compact
          entries={merged}
          rows={rows}
          loading={schedule.isLoading}
          error={schedule.isError}
          onRetry={() => schedule.refetch()}
          empty={{ title: "Sin horario", description: "Este salón todavía no tiene horario cargado." }}
        />
        <TeacherDirectory
          teachers={teachers.data ?? []}
          loading={teachers.isLoading}
          colorByCourse={colorByCourse}
          entries={merged}
          classroom={monitor.classes?.name}
        />
      </div>
    </div>
  );
}

function ContactLinks({ email, personalEmail, phone }: { email?: string; personalEmail?: string | null; phone?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
      {email && (
        <EmailLink email={email} className="inline-flex items-center gap-1.5">
          <FiMail aria-hidden="true" className="shrink-0" /> <span className="truncate">{email}</span>
        </EmailLink>
      )}
      {personalEmail && (
        <EmailLink email={personalEmail} className="inline-flex items-center gap-1.5 font-normal text-ink-700">
          <FiMail aria-hidden="true" className="shrink-0" /> <span className="truncate">{personalEmail}</span>
        </EmailLink>
      )}
      {phone ? (
        <PhoneCopy phone={phone} icon={<FiPhone aria-hidden="true" />} />
      ) : (
        <span className="inline-flex items-center gap-1.5 text-ink-500">
          <FiPhone aria-hidden="true" /> Sin celular
        </span>
      )}
    </div>
  );
}
