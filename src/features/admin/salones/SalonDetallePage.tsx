import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiChevronLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import {
  useAssignmentMutations,
  useAvailableTeachers,
  useClasses,
  useClassMutations,
  useClassSchedules,
  useClassTeachers,
  useCourses,
  usePeriods,
} from "@/api/queries";
import type { ClassTeacher, Course, Slot } from "@/api/types";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { AreaBadge, Badge, Dot } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { ConfirmDialog, Dialog } from "@/components/ui/Overlay";
import { LoadingScreen, Skeleton } from "@/components/ui/Spinner";
import { fullName, shortClassName } from "@/lib/format";
import { layoutEntries, toHHMM, type ScheduleEntry } from "@/lib/schedule";
import { linkState } from "@/lib/validators";

export function SalonDetallePage({ basePath, readOnly = false }: { basePath: string; readOnly?: boolean }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const classes = useClasses();
  const schedules = useClassSchedules(id);
  const teachers = useClassTeachers(id);
  const courses = useCourses();
  const { periods } = usePeriods();
  const { remove } = useClassMutations();
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [linksOpen, setLinksOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const classroom = classes.data?.find((c) => c.id === id);
  const rows = useMemo(
    () => periods.filter((p) => p.shiftId === classroom?.shiftId).map((p) => ({ start: p.start, end: p.end })),
    [periods, classroom?.shiftId],
  );

  const teacherByCourse = useMemo(() => {
    const map = new Map<string, ClassTeacher>();
    (teachers.data ?? []).forEach((t) => {
      if (t.teacherId !== "no asignado" && t.firstName !== "no asignado") map.set(t.courseName, t);
    });
    return map;
  }, [teachers.data]);

  const courseByName = useMemo(() => new Map((courses.data ?? []).map((c) => [c.name, c])), [courses.data]);

  const entries: ScheduleEntry[] = (schedules.data ?? []).map((s) => {
    const teacher = teacherByCourse.get(s.courseName);
    return {
      day: s.weekDay,
      start: toHHMM(s.startTime),
      end: toHHMM(s.endTime),
      title: s.courseName,
      subtitle: teacher ? `${teacher.firstName.split(" ")[0]} ${teacher.lastName.split(" ")[0]}` : "Por asignar",
      color: courseByName.get(s.courseName)?.color,
      pending: !teacher,
      groupKey: s.courseName,
    };
  });
  const merged = layoutEntries(entries, rows);

  // Cursos del salón con sus bloques (para buscar docentes disponibles)
  const courseRows = useMemo(() => {
    const map = new Map<string, { course?: Course; name: string; slots: Slot[] }>();
    (schedules.data ?? []).forEach((s) => {
      const entry = map.get(s.courseName) ?? { course: courseByName.get(s.courseName), name: s.courseName, slots: [] };
      const start = toHHMM(s.startTime);
      const period = periods.find((p) => p.shiftId === classroom?.shiftId && p.start === start);
      if (period) entry.slots.push({ hourSessionId: period.id, weekday: s.weekDay });
      map.set(s.courseName, entry);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [schedules.data, courseByName, periods, classroom?.shiftId]);

  if (classes.isLoading) return <LoadingScreen />;
  if (!classroom) {
    return (
      <Card>
        <EmptyState title="Salón no encontrado" description="Puede que haya sido eliminado." action={<Button onClick={() => navigate(basePath)}>Volver a salones</Button>} />
      </Card>
    );
  }

  const assignedCount = courseRows.filter((c) => teacherByCourse.has(c.name)).length;
  const missing = courseRows.length - assignedCount;

  const deleteClass = async () => {
    try {
      await remove.mutateAsync(classroom.id);
      toast.success("Salón eliminado");
      navigate(basePath);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo eliminar el salón"));
    }
  };

  return (
    <>
      <PageHeader
        back={
          <IconButton label="Volver a salones" onClick={() => navigate(basePath)}>
            <FiChevronLeft />
          </IconButton>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {shortClassName(classroom.name)}
            <AreaBadge name={classroom.area?.name} />
            {courseRows.length > 0 && (missing ? <Badge tone="warn">Faltan {missing} docentes</Badge> : <Badge tone="ok">Completo</Badge>)}
          </span>
        }
        description={`${classroom.shift?.name} · ${toHHMM(classroom.shift?.startTime)} – ${toHHMM(classroom.shift?.endTime)} · ${classroom.sede?.name ?? "Sede"} · Capacidad ${classroom.capacity}`}
        actions={
          !readOnly && (
            <Button variant="danger" icon={<FiTrash2 />} onClick={() => setConfirmDelete(true)}>
              Eliminar
            </Button>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <LinkCard label="Google Meet" url={classroom.urlMeet} host="meet.google.com" onEdit={readOnly ? undefined : () => setLinksOpen(true)} />
        <LinkCard label="Google Classroom" url={classroom.urlClassroom} host="classroom.google.com" onEdit={readOnly ? undefined : () => setLinksOpen(true)} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ScheduleView
          title="Horario semanal"
          entries={merged}
          rows={rows}
          loading={schedules.isLoading}
          error={schedules.isError}
          onRetry={() => schedules.refetch()}
          empty={{ title: "Sin horario", description: "Este salón todavía no tiene horario cargado." }}
          footer={<span className="text-xs text-ink-500">Borde punteado: curso sin docente asignado.</span>}
        />

        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-display text-lg font-bold text-marino-900">Docentes por curso</h2>
            <span className="tabular text-[13px] font-semibold text-ink-500">
              {assignedCount} / {courseRows.length}
            </span>
          </div>
          {teachers.isLoading && <Skeleton className="h-40" />}
          <ul className="flex flex-col">
            {courseRows.map((row) => (
              <CourseRow
                key={row.name}
                row={row}
                classId={classroom.id}
                teacher={teacherByCourse.get(row.name)}
                open={openCourse === row.name}
                onToggle={() => setOpenCourse((v) => (v === row.name ? null : row.name))}
                readOnly={readOnly}
              />
            ))}
          </ul>
        </Card>
      </div>

      {linksOpen && <LinksDialog classId={classroom.id} meet={classroom.urlMeet} classroomUrl={classroom.urlClassroom} onClose={() => setLinksOpen(false)} />}
      <ConfirmDialog
        open={confirmDelete}
        title={`¿Eliminar ${shortClassName(classroom.name)}?`}
        message="Se eliminará el salón con su horario. Esta acción no se puede deshacer."
        confirmText="Eliminar salón"
        loading={remove.isPending}
        onConfirm={deleteClass}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function CourseRow({ row, classId, teacher, open, onToggle, readOnly }: {
  row: { course?: Course; name: string; slots: Slot[] };
  classId: string;
  teacher?: ClassTeacher;
  open: boolean;
  onToggle: () => void;
  readOnly: boolean;
}) {
  const candidates = useAvailableTeachers(open ? row.course?.id : undefined, row.slots);
  const { assign, unassign } = useAssignmentMutations();
  const [busy, setBusy] = useState<string | null>(null);

  const choose = async (teacherId: string) => {
    setBusy(teacherId);
    try {
      if (teacher) await unassign.mutateAsync({ teacherId: teacher.teacherId, classId });
      await assign.mutateAsync({ teacherId, classId });
      toast.success(`Docente asignado a ${row.name}`);
      onToggle();
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo asignar el docente"));
    } finally {
      setBusy(null);
    }
  };

  const removeTeacher = async () => {
    if (!teacher) return;
    setBusy("remove");
    try {
      await unassign.mutateAsync({ teacherId: teacher.teacherId, classId });
      toast.success(`${row.name} quedó sin docente`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo quitar el docente"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className={`flex flex-col border-b border-line-soft last:border-b-0 ${!teacher ? "-mx-5 bg-[#FCF7F8] px-5" : ""}`}>
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Dot color={row.course?.color ?? "#8C91B5"} className="size-2.5" />
          <div className="flex min-w-0 flex-col">
            <strong className="text-sm">{row.name}</strong>
            {teacher ? (
              <span className="truncate text-xs text-ink-500">{fullName(teacher)}</span>
            ) : (
              <span className="text-xs font-semibold text-danger-700">Sin docente · {row.slots.length} h</span>
            )}
          </div>
        </div>
        {!readOnly && (
          <Button size="sm" variant={teacher ? "secondary" : "primary"} aria-expanded={open} onClick={onToggle}>
            {open ? "Cerrar" : teacher ? "Cambiar" : "Asignar"}
          </Button>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-2 pb-3">
          <span className="text-xs text-ink-500">Docentes de {row.name} libres en esos {row.slots.length} bloques</span>
          {candidates.isLoading && <Skeleton className="h-12" />}
          {candidates.data?.data.length === 0 && <Alert tone="warn">No hay docentes disponibles para todos esos bloques.</Alert>}
          {candidates.data?.data.slice(0, 8).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-[10px] border border-line bg-white px-3 py-2">
              <div className="flex min-w-0 flex-col">
                <strong className="truncate text-[13px]">{fullName(c)}</strong>
                <span className="truncate text-xs text-ink-500">{c.email}</span>
              </div>
              <Button size="sm" loading={busy === c.id} disabled={Boolean(busy)} onClick={() => choose(c.id)}>
                Asignar
              </Button>
            </div>
          ))}
          {teacher && (
            <Button size="sm" variant="danger" loading={busy === "remove"} onClick={removeTeacher}>
              Quitar a {teacher.firstName.split(" ")[0]} de este curso
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function LinkCard({ label, url, host, onEdit }: {
  label: string;
  url: string | null;
  host: "meet.google.com" | "classroom.google.com";
  onEdit?: () => void;
}) {
  const state = linkState(url, host);
  return (
    <Card className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-ink-500">{label}</span>
        {state === "ok" ? (
          <a href={url!} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold">
            {url!.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-sm text-ink-500">{state === "missing" ? "Sin enlace registrado" : "Enlace inválido"}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={state === "ok" ? "ok" : state === "missing" ? "neutral" : "danger"}>
          {state === "ok" ? "Válido" : state === "missing" ? "Faltante" : "Inválido"}
        </Badge>
        {onEdit && (
          <IconButton label={`Editar ${label}`} size="sm" onClick={onEdit}>
            <FiEdit2 />
          </IconButton>
        )}
      </div>
    </Card>
  );
}

/** Edición de enlaces de Meet y Classroom (lo usan admin y monitor) */
export function LinksDialog({ classId, meet, classroomUrl, onClose }: { classId: string; meet: string | null; classroomUrl: string | null; onClose: () => void }) {
  const { setMeet, setClassroom } = useClassMutations();
  const [meetValue, setMeetValue] = useState(meet ?? "");
  const [classroomValue, setClassroomValue] = useState(classroomUrl ?? "");
  const meetError = meetValue && linkState(meetValue, "meet.google.com") !== "ok" ? "Debe ser un enlace de meet.google.com" : null;
  const classroomError =
    classroomValue && linkState(classroomValue, "classroom.google.com") !== "ok" ? "Debe ser un enlace de classroom.google.com" : null;

  const save = async () => {
    try {
      if (meetValue && meetValue !== meet) await setMeet.mutateAsync({ id: classId, url: meetValue.trim() });
      if (classroomValue && classroomValue !== classroomUrl) await setClassroom.mutateAsync({ id: classId, url: classroomValue.trim() });
      toast.success("Enlaces actualizados");
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudieron guardar los enlaces"));
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Enlaces del salón"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={setMeet.isPending || setClassroom.isPending} disabled={Boolean(meetError || classroomError)}>
            Guardar enlaces
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Google Meet" error={meetError} hint="Ej.: https://meet.google.com/abc-defg-hij">
          {(p) => <Input {...p} invalid={p.invalid} type="url" value={meetValue} onChange={(e) => setMeetValue(e.target.value)} />}
        </Field>
        <Field label="Google Classroom" error={classroomError} hint="Ej.: https://classroom.google.com/c/…">
          {(p) => <Input {...p} invalid={p.invalid} type="url" value={classroomValue} onChange={(e) => setClassroomValue(e.target.value)} />}
        </Field>
      </div>
    </Dialog>
  );
}
