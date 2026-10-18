import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiChevronLeft } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAssignmentMutations, useCourses, usePeriods, useTeacher, useTeacherSchedule } from "@/api/queries";
import type { TeacherClassSchedule, TeacherSummary } from "@/api/types";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { LinkButtons } from "@/components/schedule/LinkButtons";
import { AreaBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { LoadingScreen } from "@/components/ui/Spinner";
import { fullName, shortClassName } from "@/lib/format";
import { layoutEntries, toHHMM, trimRows, uniqueRows, type ScheduleEntry } from "@/lib/schedule";

export function HorarioDocentePage({ basePath, readOnly = false }: { basePath: string; readOnly?: boolean }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const fromList = (useLocation().state as { teacher?: TeacherSummary } | null)?.teacher;
  const detail = useTeacher(id);
  const schedule = useTeacherSchedule(id);
  const { periods } = usePeriods();
  const courses = useCourses();
  const { unassign } = useAssignmentMutations();
  const [toRemove, setToRemove] = useState<TeacherClassSchedule | null>(null);

  const name = fullName(fromList ?? detail.data);
  const color = courses.data?.find((c) => c.id === (fromList?.courseId ?? detail.data?.courseId))?.color;

  const entries: ScheduleEntry[] = useMemo(
    () =>
      (schedule.data ?? []).flatMap((cls) =>
        cls.schedules.map((s) => ({
          day: s.weekday,
          start: toHHMM(s.hourSession.startTime),
          end: toHHMM(s.hourSession.endTime),
          title: shortClassName(cls.className),
          subtitle: cls.areaName,
          color,
          groupKey: cls.classId,
          meta: { classId: cls.classId },
        })),
      ),
    [schedule.data, color],
  );

  // Solo las filas de los turnos donde dicta, para no mostrar una grilla de 14 horas vacía
  const rows = useMemo(() => {
    const shiftIds = new Set((schedule.data ?? []).map((c) => c.shiftId));
    return trimRows(uniqueRows(periods.filter((p) => shiftIds.has(p.shiftId))), entries);
  }, [periods, schedule.data, entries]);

  if (schedule.isLoading) return <LoadingScreen />;

  const confirmRemove = async () => {
    if (!toRemove) return;
    try {
      await unassign.mutateAsync({ teacherId: id, classId: toRemove.classId });
      toast.success(`${shortClassName(toRemove.className)} quitado del horario`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo quitar el salón"));
    } finally {
      setToRemove(null);
    }
  };

  return (
    <>
      <PageHeader
        back={
          <IconButton label="Volver" onClick={() => navigate(basePath)}>
            <FiChevronLeft />
          </IconButton>
        }
        title={`Horario de ${name || "docente"}`}
        description={`${schedule.data?.length ?? 0} salones · ${entries.length} horas pedagógicas`}
        actions={
          !readOnly && (
            <Button variant="navy" onClick={() => navigate(`${basePath}/${id}/asignar`, { state: { teacher: fromList } })}>
              Asignar salones
            </Button>
          )
        }
      />
      <ScheduleView
        title="Horario semanal"
        entries={layoutEntries(entries, rows)}
        rows={rows}
        error={schedule.isError}
        onRetry={() => schedule.refetch()}
        empty={{ title: "Sin horario asignado", description: "Este docente todavía no tiene salones asignados." }}
      />
      {(schedule.data?.length ?? 0) > 0 && (
        <Card className="flex flex-col gap-3 p-5">
          <CardHeader title="Salones y enlaces" />
          <ul className="grid gap-2.5 md:grid-cols-2">
            {schedule.data!.map((cls) => (
              <li key={cls.classId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <strong className="text-[15px]">{shortClassName(cls.className)}</strong>
                  <span className="flex items-center gap-2 text-xs text-ink-500">
                    <AreaBadge name={cls.areaName} /> {cls.shiftName} · {cls.schedules.length} h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButtons meet={cls.urlMeet} classroom={cls.urlClassroom} size="sm" />
                  {!readOnly && (
                    <Button size="sm" variant="danger" onClick={() => setToRemove(cls)}>
                      Quitar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <ConfirmDialog
        open={Boolean(toRemove)}
        title={`¿Quitar ${toRemove ? shortClassName(toRemove.className) : ""}?`}
        message={`Se liberarán ${toRemove?.schedules.length ?? 0} horas de ${name}. El salón quedará con el curso por asignar.`}
        confirmText="Quitar salón"
        loading={unassign.isPending}
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
}
