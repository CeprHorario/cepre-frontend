import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCalendar, FiDownload, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { TeachersApi } from "@/api/services";
import { useClearTeacherAvailability, useCourses, useTeacherMutations, useTeachers, useTeacherSearch } from "@/api/queries";
import { ConfirmDialog } from "@/components/ui/Overlay";
import type { TeacherSummary } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Badge, CourseBadge } from "@/components/ui/Badge";
import { Card, PageHeader, ProgressBar } from "@/components/ui/Card";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { SearchInput, Select } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { SelectionBar, SelectionToggle, useSelectionMode } from "@/components/ui/Selection";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadBlob, fullName, JOB_STATUS_LABEL } from "@/lib/format";
import { useDebounced } from "@/lib/useDebounced";
import { useRemoval } from "@/features/admin/personas/useRemoval";
import { TeacherForm } from "./TeacherForm";
import { TeacherDetailDrawer } from "./TeacherDetailDrawer";

interface Props {
  basePath: string;
  readOnly?: boolean;
  showCourseFilter?: boolean;
  title?: string;
  description?: string;
}

export function DocentesPage({ basePath, readOnly = false, showCourseFilter = true, title = "Docentes", description }: Props) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("pagina") ?? 1);
  const limit = Number(params.get("filas") ?? 10);
  const courseId = params.get("curso") ? Number(params.get("curso")) : null;
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debounced = useDebounced(query.trim());
  const searching = debounced.length >= 2;

  const list = useTeachers({ page, limit, courseId: showCourseFilter ? courseId : null });
  const search = useTeacherSearch(debounced, page, limit);
  const courses = useCourses();
  const { deactivate } = useTeacherMutations();
  const clearAvailability = useClearTeacherAvailability();
  const [availabilityTargets, setAvailabilityTargets] = useState<TeacherSummary[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherSummary | null>(null);
  const [detail, setDetail] = useState<TeacherSummary | null>(null);
  const [exporting, setExporting] = useState(false);

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const courseColor = useMemo(() => new Map((courses.data ?? []).map((c) => [c.name, c.color])), [courses.data]);
  const data = searching ? search.data : list.data;
  const rows = (data?.data ?? []) as TeacherSummary[];
  const loading = searching ? search.isLoading : list.isLoading;
  const selection = useSelectionMode(rows, (t) => t.id);
  const removal = useRemoval<TeacherSummary>({
    singular: "docente",
    plural: "docentes",
    describe: (t) => `a ${t.firstName}`,
    idOf: (t) => t.id,
    remove: deactivate.mutateAsync,
    pending: deactivate.isPending,
    consequence: (many) => (many ? "Perderán el acceso y dejarán de aparecer en las listas; sus horarios asignados no se borran." : "Perderá el acceso y dejará de aparecer en las listas; sus horarios asignados no se borran."),
    onDone: () => {
      selection.stop();
      setDetail(null);
    },
  });

  const assign = (teacher: TeacherSummary) => navigate(`${basePath}/${teacher.id}/asignar`, { state: { teacher } });
  const schedule = (teacher: TeacherSummary) => navigate(`${basePath}/${teacher.id}/horario`, { state: { teacher } });

  const columns: Column<TeacherSummary>[] = [
    {
      key: "name",
      header: "Docente",
      cell: (t) => (
        <div className="flex min-w-0 flex-col">
          <strong className="font-semibold">{fullName(t)}</strong>
          <span className="truncate text-xs text-ink-500">{t.email}</span>
        </div>
      ),
    },
    {
      key: "course",
      header: "Curso",
      cell: (t) => (t.courseName ? <CourseBadge name={t.courseName} color={courseColor.get(t.courseName)} /> : <span className="text-ink-500">—</span>),
    },
    {
      key: "job",
      header: "Dedicación",
      hideOnMobile: true,
      cell: (t) => (t.jobStatus ? <Badge>{JOB_STATUS_LABEL[t.jobStatus] ?? t.jobStatus}</Badge> : "—"),
    },
    {
      key: "hours",
      header: "Horas",
      cell: (t) => {
        if (t.maxHours === undefined) return <span className="text-ink-500">—</span>;
        const done = t.scheduledHours ?? 0;
        const max = t.maxHours ?? 0;
        return (
          <div className="flex items-center gap-2.5">
            <ProgressBar value={done} max={max} className="w-20" label={`${done} de ${max} horas`} />
            <span className={`tabular text-[13px] ${done === 0 ? "font-bold text-danger-700" : ""}`}>
              {done}/{max || "—"}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      align: "right",
      cell: (t) => (
        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {readOnly ? (
            <Button size="sm" variant="secondary" icon={<FiCalendar />} onClick={() => schedule(t)}>
              Horario
            </Button>
          ) : (
            <>
              <Button size="sm" variant="navy" onClick={() => assign(t)}>
                Asignar salones
              </Button>
              <RowActions
                label={`Acciones para ${fullName(t)}`}
                items={[
                  { label: "Ver horario", icon: <FiCalendar />, onSelect: () => schedule(t) },
                  { label: "Editar datos", icon: <FiEdit2 />, onSelect: () => setEditing(t), hidden: searching },
                  { label: "Eliminar", icon: <FiTrash2 />, tone: "danger", onSelect: () => removal.request([t]) },
                ]}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await TeachersApi.exportExcel();
      downloadBlob(blob, `docentes_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Docentes exportados");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo exportar"));
    } finally {
      setExporting(false);
    }
  };


  return (
    <>
      <PageHeader
        title={title}
        description={description ?? (list.data ? `${list.data.total} docentes activos` : "Cargando…")}
        actions={
          !readOnly && (
            <>
              <Button variant="secondary" icon={<FiDownload />} onClick={handleExport} loading={exporting}>
                Exportar Excel
              </Button>
              <Button icon={<FiPlus />} onClick={() => setFormOpen(true)}>
                Agregar docente
              </Button>
            </>
          )
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <SearchInput
            className="min-w-[220px] flex-1"
            placeholder="Buscar por nombre, DNI o correo"
            aria-label="Buscar docente"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateParams({ q: e.target.value || null, pagina: null });
            }}
          />
          {showCourseFilter && (
            <Select
              aria-label="Curso"
              className="w-auto min-w-48"
              value={courseId ?? ""}
              disabled={searching}
              onChange={(e) => updateParams({ curso: e.target.value || null, pagina: null })}
            >
              <option value="">Todos los cursos</option>
              {(courses.data ?? []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          )}
          {!readOnly && <SelectionToggle active={selection.active} onStart={selection.start} onStop={selection.stop} />}
        </div>

        {!readOnly && selection.active && (
          <SelectionBar count={selection.selectedRows.length} singular="docente" plural="docentes">
            <Button size="sm" variant="secondary" disabled={clearAvailability.isPending} onClick={() => setAvailabilityTargets([...selection.selectedRows])}>Quitar disponibilidad</Button>
            <Button size="sm" variant="danger" icon={<FiTrash2 />} onClick={() => removal.request(selection.selectedRows)}>
              Eliminar
            </Button>
          </SelectionBar>
        )}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(t) => t.id}
          loading={loading}
          onRowClick={(t) => setDetail(t)}
          selectedKey={detail?.id}
          selection={readOnly ? undefined : selection.tableSelection}
          empty={
            <EmptyState
              title={searching ? "Sin coincidencias" : "No hay docentes"}
              description={searching ? `No encontramos docentes para «${debounced}».` : "Agrega docentes o impórtalos desde un archivo."}
            />
          }
        />
        {data && (
          <Pagination
            page={page}
            limit={limit}
            total={data.total}
            noun="docentes"
            onPage={(p) => updateParams({ pagina: String(p) })}
            onLimit={(l) => updateParams({ filas: String(l), pagina: null })}
          />
        )}
      </Card>

      {(formOpen || editing) && (
        <TeacherForm
          open
          teacher={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      <TeacherDetailDrawer
        teacher={detail}
        onClose={() => setDetail(null)}
        readOnly={readOnly}
        onAssign={assign}
        onSchedule={schedule}
        onEdit={(t) => {
          setDetail(null);
          setEditing(t);
        }}
      />

      {removal.dialog}
      {!readOnly && <ConfirmDialog
        open={availabilityTargets.length > 0}
        title="Quitar disponibilidad"
        message={`Se borrará toda la disponibilidad de ${availabilityTargets.length} docente(s) en este proceso. Los salones asignados y sus horas se conservan. Tendrás que registrar disponibilidad nuevamente para futuras asignaciones.`}
        confirmText="Quitar disponibilidad"
        loading={clearAvailability.isPending}
        onCancel={() => { if (!clearAvailability.isPending) setAvailabilityTargets([]); }}
        onConfirm={async () => {
          try {
            const result = await clearAvailability.mutateAsync(availabilityTargets.map(teacher => teacher.id));
            toast.success(`Disponibilidad retirada de ${result.teachers} docentes`);
            setAvailabilityTargets([]); selection.stop();
          } catch (error) { toast.error(apiErrorMessage(error, "No se quitó la disponibilidad")); }
        }}
      />}
    </>
  );
}
