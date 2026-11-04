import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useMonitorInfo } from "@/api/queries";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { LinkButtons } from "@/components/schedule/LinkButtons";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { TeacherDirectory } from "@/components/schedule/TeacherDirectory";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CopyPhoneIconButton } from "@/components/ui/Contact";
import { Alert } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/Spinner";
import { LinksDialog } from "@/features/admin/salones/SalonDetallePage";
import { useClassroomSchedule } from "@/features/shared/useClassroomSchedule";
import { todayWeekday } from "@/lib/schedule";

export function MonitorPanel() {
  const info = useMonitorInfo();
  const { schedule, teachers, colorByCourse, rows, merged } = useClassroomSchedule();
  const [editLinks, setEditLinks] = useState(false);
  const pendingToday = merged.filter((e) => e.day === todayWeekday() && e.pending);

  if (info.isLoading) return <SimpleLayout greeting subtitle="Monitor"><LoadingScreen /></SimpleLayout>;

  return (
    <SimpleLayout greeting subtitle={info.data ? `Monitor · ${info.data.salon}` : "Monitor"}>
      <section className="border-b border-line bg-white px-4 py-4 text-marino-900 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-bold">{info.data?.salon ?? "Sin salón asignado"}</h1>
            <span className="text-xs text-ink-500">Horario del salón</span>
          </div>
          {info.data && (
            <div className="flex items-center gap-2">
              <LinkButtons meet={info.data.urlMeet} classroom={info.data.urlClassroom} />
              <Button size="md" variant="secondary" icon={<FiEdit2 />} onClick={() => setEditLinks(true)}>
                Enlaces
              </Button>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-8">
        <div className="flex flex-wrap gap-3"><ButtonLink variant="secondary" to="/monitor/solicitudes">Solicitar reemplazo</ButtonLink><ButtonLink to="/monitor/partes">Registrar parte diario</ButtonLink></div>
        {info.data && (!info.data.urlMeet || !info.data.urlClassroom) && (
          <Alert
            tone="warn"
            title="Faltan enlaces del salón"
            action={
              <Button size="sm" onClick={() => setEditLinks(true)}>
                Agregar
              </Button>
            }
          >
            Meet y Classroom aún no están disponibles para el salón.
          </Alert>
        )}
        {pendingToday.length > 0 && (
          <Alert tone="info">
            Hoy hay {pendingToday.length} {pendingToday.length === 1 ? "clase" : "clases"} sin docente asignado. Avisa a coordinación si no se dicta.
          </Alert>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <ScheduleView
              appearance="operational"
              tone="navy"
              entries={merged}
              rows={rows}
              loading={schedule.isLoading}
              error={schedule.isError}
              onRetry={() => schedule.refetch()}
              empty={{ title: "Sin horario", description: "Tu salón todavía no tiene horario cargado." }}
              renderActions={(entry) => (entry.meta?.phone ? <CopyPhoneIconButton phone={entry.meta.phone as string} name={entry.subtitle} /> : null)}
            />
          </div>
          <TeacherDirectory
            teachers={teachers.data ?? []}
            loading={teachers.isLoading}
            colorByCourse={colorByCourse}
            entries={merged}
            classroom={info.data?.salon}
            className="lg:sticky lg:top-20"
          />
        </div>
      </main>

      {editLinks && info.data && (
        <LinksDialog classId={info.data.salon_id} meet={info.data.urlMeet} classroomUrl={info.data.urlClassroom} onClose={() => setEditLinks(false)} />
      )}
    </SimpleLayout>
  );
}
