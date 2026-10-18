import { useTeacher, useTeacherSchedule } from "@/api/queries";
import type { TeacherSummary } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Avatar, ProgressBar, SectionLabel } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Overlay";
import { EmailLink, PhoneCopy } from "@/components/ui/Contact";
import { Skeleton } from "@/components/ui/Spinner";
import { fullName, initials, JOB_STATUS_LABEL, shortClassName } from "@/lib/format";
import { toHHMM, WEEKDAY_SHORT } from "@/lib/schedule";

interface Props {
  teacher: TeacherSummary | null;
  onClose: () => void;
  readOnly?: boolean;
  onAssign: (t: TeacherSummary) => void;
  onSchedule: (t: TeacherSummary) => void;
  onEdit: (t: TeacherSummary) => void;
}

/** Vista rápida del docente sin salir de la lista */
export function TeacherDetailDrawer({ teacher, onClose, readOnly, onAssign, onSchedule, onEdit }: Props) {
  const detail = useTeacher(teacher?.id);
  const schedule = useTeacherSchedule(teacher?.id);
  if (!teacher) return null;

  const done = teacher.scheduledHours ?? 0;
  const max = teacher.maxHours ?? 0;

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <Avatar text={initials(teacher)} size="lg" />
          <span className="flex flex-col">
            {fullName(teacher)}
            <span className="font-sans text-[13px] font-normal text-ink-500">
              {teacher.courseName}
              {teacher.jobStatus ? ` · ${JOB_STATUS_LABEL[teacher.jobStatus]}` : ""}
            </span>
          </span>
        </span>
      }
      footer={
        readOnly ? (
          <Button variant="navy" onClick={() => onSchedule(teacher)}>
            Ver horario completo
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onEdit(teacher)}>
              Editar
            </Button>
            <Button variant="secondary" onClick={() => onSchedule(teacher)}>
              Ver horario
            </Button>
            <Button onClick={() => onAssign(teacher)}>Asignar salones</Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-6">
        {teacher.maxHours !== undefined && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-500">Horas asignadas</span>
              <strong className="tabular">
                {done} de {max || "—"}
              </strong>
            </div>
            <ProgressBar value={done} max={max} label="Horas asignadas" />
          </div>
        )}

        <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[13px]">
          <dt className="text-ink-500">Correo</dt>
          <dd className="truncate">
            <EmailLink email={teacher.email} />
          </dd>
          <dt className="text-ink-500">Correo personal</dt>
          <dd className="truncate">{detail.isLoading ? <Skeleton className="h-3 w-40" /> : detail.data?.personalEmail || "—"}</dd>
          <dt className="text-ink-500">Celular</dt>
          <dd>
            {teacher.phone ? (
              <PhoneCopy phone={teacher.phone} />
            ) : (
              "—"
            )}
          </dd>
        </dl>

        <div className="flex flex-col gap-2.5">
          <SectionLabel>Salones asignados</SectionLabel>
          {schedule.isLoading && <Skeleton className="h-14" />}
          {schedule.data?.length === 0 && <p className="rounded-xl bg-surface-2 p-4 text-sm text-ink-500">Aún no tiene salones asignados.</p>}
          {schedule.data?.map((item) => {
            const days = [...new Set(item.schedules.map((s) => WEEKDAY_SHORT[s.weekday]))].join(", ");
            const starts = item.schedules.map((s) => toHHMM(s.hourSession.startTime)).sort();
            const ends = item.schedules.map((s) => toHHMM(s.hourSession.endTime)).sort();
            return (
              <div key={item.classId} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
                <div className="flex min-w-0 flex-col">
                  <strong className="text-sm">{shortClassName(item.className)}</strong>
                  <span className="truncate text-xs text-ink-500">
                    {days} · {starts[0]}–{ends[ends.length - 1]}
                  </span>
                </div>
                <span className="tabular text-xs font-bold">{item.schedules.length} h</span>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}
