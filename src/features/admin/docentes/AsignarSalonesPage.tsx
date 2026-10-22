import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCheck, FiChevronLeft, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAreas, useAssignmentMutations, useAvailableClasses, useCourses, usePeriods, useTeacher, useTeachers, useTeacherSchedule, useTeacherAvailability, useSaveTeacherAvailability } from "@/api/queries";
import type { AvailabilityInterval, Slot, TeacherSummary } from "@/api/types";
import { cellKey, WeekGrid, type CellKey } from "@/components/schedule/WeekGrid";
import { AreaBadge, Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Avatar, Card, CardHeader, ProgressBar } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/EmptyState";
import { Checkbox, Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { LoadingScreen, Skeleton } from "@/components/ui/Spinner";
import { formatPhone, fullName, initials, JOB_STATUS_LABEL, shortClassName } from "@/lib/format";
import { layoutEntries, toHHMM, WEEKDAY_SHORT, WEEKDAYS, type ScheduleEntry } from "@/lib/schedule";
import { toggleAvailability, isCovered, overlaps } from "./availability";

export function AsignarSalonesPage({ basePath }: { basePath: string }) {
  const { id = "" } = useParams();
  return <AsignarSalones key={id} id={id} basePath={basePath} />;
}

function AsignarSalones({ id, basePath }: { id: string; basePath: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromList = (location.state as { teacher?: TeacherSummary } | null)?.teacher;
  const detail = useTeacher(fromList ? undefined : id);
  const schedule = useTeacherSchedule(id);
  const { periods, isLoading: loadingPeriods } = usePeriods();
  const courses = useCourses();
  const areas = useAreas();
  const { assign, unassign } = useAssignmentMutations();

  // Sin estado de navegación (enlace directo) se busca el resumen con horas en la lista de su curso
  const sameCourse = useTeachers({ page: 1, limit: 500, courseId: detail.data?.courseId }, !fromList && Boolean(detail.data));
  const fromCourse = fromList ? undefined : sameCourse.data?.data.find((t) => t.id === id);

  const teacher = useMemo(() => {
    if (fromList) return fromList;
    if (fromCourse) return fromCourse;
    if (!detail.data) return null;
    return {
      id,
      firstName: detail.data.firstName,
      lastName: detail.data.lastName,
      email: detail.data.email,
      phone: detail.data.phone,
      courseId: detail.data.courseId,
      courseName: detail.data.courseName,
      maxHours: null,
      scheduledHours: null,
      jobStatus: undefined,
    } as unknown as TeacherSummary;
  }, [fromList, fromCourse, detail.data, id]);

  const shifts = useMemo(() => [...new Map(periods.map((p) => [p.shiftId, p.shiftName])).entries()], [periods]);
  const [shiftId, setShiftId] = useState<number | null>(null);
  useEffect(() => {
    if (shiftId === null && shifts.length) setShiftId(shifts[0][0]);
  }, [shifts, shiftId]);

  const rows = useMemo(() => periods.filter((p) => p.shiftId === shiftId).map((p) => ({ start: p.start, end: p.end })), [periods, shiftId]);

  const availability = useTeacherAvailability(id);
  const saveAvailability = useSaveTeacherAvailability(id);
  const [draft, setDraft] = useState<AvailabilityInterval[] | null>(null);
  const intervals = useMemo(() => draft ?? availability.data ?? [], [draft, availability.data]);
  const marked = new Set<CellKey>(WEEKDAYS.flatMap((day) => rows.filter((row) => isCovered(intervals, { weekday: day, ...row })).map((row) => cellKey(day, row.start))));
  const [editing, setEditing] = useState(false);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toRemove, setToRemove] = useState<string | null>(null);

  const updateIntervals = (next: AvailabilityInterval[]) => {
    setDraft(next);
    setSelected(new Set());
  };

  const finishEditing = async () => {
    try {
      await saveAvailability.mutateAsync(intervals);
      setDraft(null);
      setEditing(false);
      toast.success("Disponibilidad guardada");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo guardar la disponibilidad"));
    }
  };

  const startEditing = () => {
    setDraft(availability.data ?? []);
    setEditing(true);
    setSelected(new Set());
  };

  // Bloques que el docente ya dicta (todos los turnos)
  const assignedEntries: ScheduleEntry[] = useMemo(
    () =>
      (schedule.data ?? []).flatMap((cls) =>
        cls.schedules.map((s) => ({
          day: s.weekday,
          start: toHHMM(s.hourSession.startTime),
          end: toHHMM(s.hourSession.endTime),
          title: shortClassName(cls.className),
          subtitle: "Asignado",
          groupKey: cls.classId,
        })),
      ),
    [schedule.data],
  );
  const assignedCells = useMemo(() => new Set(assignedEntries.map((e) => cellKey(e.day, e.start))), [assignedEntries]);
  const assignedHours = assignedEntries.length;
  const assignedNotes = new Map<CellKey, string>();
  for (const day of WEEKDAYS) for (const row of rows) {
    const occupied = assignedEntries.filter((entry) => overlaps(
      { weekday: day, ...row }, { weekday: entry.day, start: entry.start, end: entry.end },
    ));
    if (occupied.length) assignedNotes.set(cellKey(day, row.start), occupied.map((entry) => `${entry.title} · ${entry.start}–${entry.end}`).join("\n"));
  }

  // Un bloque requiere cobertura completa y no debe solaparse con clases de ningún turno.
  const slots: Slot[] = useMemo(() => {
    const result: Slot[] = [];
    if (editing) return result;
    for (const day of WEEKDAYS) for (const period of periods) {
      const target = { weekday: day, start: period.start, end: period.end };
      if (isCovered(intervals, target) && !assignedEntries.some((entry) => overlaps(target, { weekday: entry.day, start: entry.start, end: entry.end }))) {
        result.push({ hourSessionId: period.id, weekday: day });
      }
    }
    return result;
  }, [intervals, assignedEntries, periods, editing]);

  const available = useAvailableClasses({ teacherId: id, courseId: teacher?.courseId, slots, areaId });
  const candidates = available.data ?? [];

  const selectedClasses = candidates.filter((c) => selected.has(c.id));
  const previewEntries: ScheduleEntry[] = selectedClasses.flatMap((cls) =>
    cls.schedules.map((s) => ({
      day: s.weekday,
      start: toHHMM(s.hourSession.startTime),
      end: toHHMM(s.hourSession.endTime),
      title: shortClassName(cls.name),
      subtitle: "Vista previa",
      groupKey: `preview-${cls.id}`,
      meta: { preview: true },
    })),
  );

  // Cruces entre salones seleccionados
  const conflicts = new Set<string>();
  const classConflicts = (a: typeof candidates[number], b: typeof candidates[number]) => a.schedules.some((s) => b.schedules.some((t) => overlaps(
    { weekday: s.weekday, start: toHHMM(s.hourSession.startTime), end: toHHMM(s.hourSession.endTime) },
    { weekday: t.weekday, start: toHHMM(t.hourSession.startTime), end: toHHMM(t.hourSession.endTime) },
  )));
  selectedClasses.forEach((cls, index) => selectedClasses.slice(0, index).forEach((other) => {
    if (classConflicts(cls, other)) conflicts.add(cls.id).add(other.id);
  }));
  const conflictsWith = (clsId: string) =>
    candidates
      .filter((c) => c.id !== clsId && selected.has(c.id))
      .find((c) => { const target = candidates.find((x) => x.id === clsId); return target ? classConflicts(c, target) : false; });

  const projected = previewEntries.length;
  const maxHours = teacher?.maxHours ?? null;
  const exceeds = maxHours !== null && assignedHours + projected > maxHours;

  const gridEntries = layoutEntries(
    [
      ...assignedEntries.flatMap((e) => rows.filter((row) => row.start < e.end && e.start < row.end).map((row) => ({ ...e, start: row.start, end: row.end, meta: { variant: "assigned" } }))),
      ...previewEntries.filter((e) => !assignedCells.has(cellKey(e.day, e.start))),
    ],
    rows,
  ).map((e) => ({ ...e, variant: (e.meta?.preview ? "preview" : "assigned") as "preview" | "assigned" }));

  const toggle = (cells: CellKey[]) => {
    const targets = cells.flatMap((key) => {
      const row = rows.find((r) => key.endsWith(`|${r.start}`));
      const day = WEEKDAYS.find((d) => key.startsWith(`${d}|`));
      return row && day ? [{ weekday: day, ...row }] : [];
    });
    updateIntervals(toggleAvailability(intervals, targets));
  };

  const confirmAssign = async () => {
    let ok = 0;
    for (const cls of selectedClasses) {
      try {
        await assign.mutateAsync({ teacherId: id, classId: cls.id });
        ok += 1;
      } catch (error) {
        toast.error(`${shortClassName(cls.name)}: ${apiErrorMessage(error, "no se pudo asignar")}`);
      }
    }
    if (ok) toast.success(ok === 1 ? "Salón asignado" : `${ok} salones asignados`);
    setSelected(new Set());
  };

  const removeClass = async (classId: string) => {
    try {
      await unassign.mutateAsync({ teacherId: id, classId });
      toast.success("Salón quitado del horario del docente");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo quitar el salón"));
    } finally {
      setToRemove(null);
    }
  };

  if (!teacher || loadingPeriods || availability.isPending) return <LoadingScreen />;
  if (availability.isError) return <Alert tone="danger">No se pudo cargar la disponibilidad. <Button onClick={() => availability.refetch()}>Reintentar</Button></Alert>;

  const courseColor = courses.data?.find((c) => c.id === teacher.courseId)?.color;
  const markedCount = marked.size;

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-5 px-5 py-4">
        <div className="flex items-center gap-3.5">
          <IconButton label="Volver a docentes" onClick={() => navigate(basePath)}>
            <FiChevronLeft />
          </IconButton>
          <Avatar text={initials(teacher)} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-display text-xl font-extrabold text-marino-900">{fullName(teacher)}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
              <Badge className="bg-white ring-1 ring-line">
                <span className="size-2 rounded-full" style={{ background: courseColor }} />
                {teacher.courseName}
              </Badge>
              {teacher.jobStatus && <span>{JOB_STATUS_LABEL[teacher.jobStatus]}</span>}
              {teacher.phone && <span>· {formatPhone(teacher.phone)}</span>}
            </div>
          </div>
        </div>
        <div className="flex min-w-[280px] flex-col gap-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-500">
              {assignedHours} asignadas{projected ? ` + ${projected} por confirmar` : ""}
            </span>
            <strong className="tabular">
              {assignedHours + projected} de {maxHours ?? "—"} h
            </strong>
          </div>
          <ProgressBar value={assignedHours} max={maxHours ?? Math.max(assignedHours + projected, 1)} projected={projected} label="Horas del docente" />
          {maxHours !== null && (
            <span className={`text-xs ${exceeds ? "font-semibold text-danger-700" : "text-ink-500"}`}>
              {exceeds ? `Supera el máximo por ${assignedHours + projected - maxHours} h` : `Quedarían ${maxHours - assignedHours - projected} h libres`}
            </span>
          )}
        </div>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="flex flex-col gap-4 p-5">
          <CardHeader
            title="Disponibilidad"
            description={
              editing
                ? "Pulsa un día para marcarlo en todos los turnos. Las horas ocupadas se indican en verde. Guarda al terminar."
                : `${markedCount} bloques disponibles en este turno. Los bloques verdes ya están asignados.`
            }
            actions={
              <>
                {editing && intervals.length > 0 && (
                  <Button size="sm" variant="ghost" disabled={saveAvailability.isPending} onClick={() => updateIntervals([])}>
                    Limpiar
                  </Button>
                )}
                {editing && <Button size="sm" variant="ghost" disabled={saveAvailability.isPending} onClick={() => { setDraft(null); setEditing(false); }}>Cancelar</Button>}
                <Button size="sm" loading={saveAvailability.isPending} variant={editing ? "primary" : "secondary"} icon={editing ? <FiCheck /> : undefined} onClick={() => editing ? void finishEditing() : startEditing()}>
                  {editing ? "Guardar disponibilidad" : "Editar disponibilidad"}
                </Button>
              </>
            }
          />
          {shiftId !== null && (
            <Segmented
              label="Turno"
              tone="navy"
              value={shiftId}
              onChange={setShiftId}
              options={shifts.map(([sid, name]) => {
                const shiftRows = periods.filter((p) => p.shiftId === sid);
                return { value: sid, label: `${name} · ${shiftRows[0]?.start}–${shiftRows[shiftRows.length - 1]?.end}` };
              })}
            />
          )}
          <WeekGrid
            rows={rows}
            entries={editing ? [] : gridEntries}
            marked={marked}
            cellNotes={editing ? assignedNotes : undefined}
            onToggleCell={editing && !saveAvailability.isPending ? (day, start) => toggle([cellKey(day, start)]) : undefined}
            onToggleDay={editing && !saveAvailability.isPending ? (day) => updateIntervals(toggleAvailability(intervals, periods.map((period) => ({ weekday: day, start: period.start, end: period.end })))) : undefined}
            onToggleRow={editing && !saveAvailability.isPending ? (start) => toggle(WEEKDAYS.map((d) => cellKey(d, start))) : undefined}
          />
          <div className="flex flex-wrap gap-4 text-xs text-ink-500">
            <Legend className="border-2 border-guinda-700 bg-guinda-50" label="Disponible" />
            <Legend className="border border-[#9CCFB1] bg-[#E2F2E8]" label="Ya asignado" />
            <Legend className="border-2 border-dashed border-[#B58B3E] bg-oro-100" label="Salón seleccionado" />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <CardHeader title="Salones compatibles" description={`${teacher.courseName} dentro de la disponibilidad marcada.`} />
            <Select aria-label="Área" value={areaId ?? ""} onChange={(e) => setAreaId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Todas las áreas</option>
              {(areas.data ?? []).map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
            {editing ? <EmptyState title="Guarda la disponibilidad" description="Los salones compatibles se mostrarán con la disponibilidad guardada." /> : slots.length === 0 ? (
              <EmptyState title="Marca la disponibilidad" description="Edita la disponibilidad para ver los salones donde el docente puede dictar." />
            ) : available.isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : candidates.length === 0 ? (
              <EmptyState title="Sin salones compatibles" description="Ningún salón tiene este curso libre en esos bloques. Prueba marcando más horas." />
            ) : (
              <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto">
                {candidates.map((cls) => {
                  const isSelected = selected.has(cls.id);
                  const clash = !isSelected ? conflictsWith(cls.id) : undefined;
                  const days = [...new Set(cls.schedules.map((s) => WEEKDAY_SHORT[s.weekday]))].join(", ");
                  const areaName = areas.data?.find((a) => a.id === cls.areaId)?.name;
                  return (
                    <li key={cls.id}>
                      <label
                        className={`grid cursor-pointer grid-cols-[22px_minmax(0,1fr)] gap-3 rounded-xl border p-3 ${
                          isSelected ? "border-guinda-700 bg-[#FCF7F8] shadow-[0_0_0_1px_#661124]" : clash ? "border-[#F1C2BD] bg-[#FFF8F7]" : "border-line hover:border-marino-300"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={Boolean(clash)}
                          onChange={() => {
                            const next = new Set(selected);
                            if (isSelected) next.delete(cls.id);
                            else next.add(cls.id);
                            setSelected(next);
                          }}
                          aria-label={`Seleccionar ${cls.name}`}
                          className="mt-0.5"
                        />
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="flex items-center justify-between gap-2">
                            <strong className="text-[15px]">{shortClassName(cls.name)}</strong>
                            <span className="tabular text-[13px] font-bold">{cls.schedules.length} h</span>
                          </span>
                          <span className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                            <AreaBadge name={areaName} />
                            {cls.shift?.name} · {days}
                          </span>
                          {clash && <span className="text-xs font-semibold text-danger-700">Se cruza con {shortClassName(clash.name)}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            {selectedClasses.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-line-soft pt-3">
                {exceeds && <Alert tone="warn">Con esta selección el docente supera sus horas máximas.</Alert>}
                {conflicts.size > 0 && <Alert tone="danger">Hay salones seleccionados que se cruzan entre sí.</Alert>}
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-500">{selectedClasses.length} salones seleccionados</span>
                  <strong className="tabular">+{projected} h</strong>
                </div>
                <Button onClick={confirmAssign} loading={assign.isPending} disabled={conflicts.size > 0}>
                  Asignar {selectedClasses.length} {selectedClasses.length === 1 ? "salón" : "salones"}
                </Button>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-2.5 p-5">
            <CardHeader title="Salones asignados" description={`${schedule.data?.length ?? 0} salones · ${assignedHours} horas`} />
            {(schedule.data ?? []).map((cls) => (
              <div key={cls.classId} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <strong className="text-sm">{shortClassName(cls.className)}</strong>
                  <span className="truncate text-xs text-ink-500">
                    {cls.shiftName} · {[...new Set(cls.schedules.map((s) => WEEKDAY_SHORT[s.weekday]))].join(", ")} · {cls.schedules.length} h
                  </span>
                </div>
                {toRemove === cls.classId ? (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setToRemove(null)}>
                      No
                    </Button>
                    <Button size="sm" variant="danger-solid" loading={unassign.isPending} onClick={() => removeClass(cls.classId)}>
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <IconButton label={`Quitar ${cls.className}`} size="sm" onClick={() => setToRemove(cls.classId)}>
                    <FiTrash2 />
                  </IconButton>
                )}
              </div>
            ))}
            {schedule.data?.length === 0 && <p className="text-sm text-ink-500">Aún no tiene salones.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-4 rounded ${className}`} aria-hidden="true" />
      {label}
    </span>
  );
}
