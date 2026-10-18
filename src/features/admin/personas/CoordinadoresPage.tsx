import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useCoordinatorMutations, useCoordinators, useCourses } from "@/api/queries";
import type { Coordinator } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Alert, EmptyState } from "@/components/ui/EmptyState";
import { Field, Select } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { SelectionBar, SelectionToggle, useSelectionMode } from "@/components/ui/Selection";
import { formatPhone, fullName } from "@/lib/format";
import { splitPhones } from "@/lib/validators";
import { emptyPerson, PersonForm } from "./PersonForm";
import { useRemoval } from "./useRemoval";

export function CoordinadoresPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("pagina") ?? 1);
  const limit = Number(params.get("filas") ?? 20);
  const coordinators = useCoordinators({ page, limit });
  const courses = useCourses();
  const { create, update, deactivate } = useCoordinatorMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coordinator | null>(null);
  const [courseId, setCourseId] = useState("");
  const rows = coordinators.data?.data ?? [];
  const selection = useSelectionMode(rows, (x) => x.id);
  const removal = useRemoval<Coordinator>({
    singular: "coordinador",
    plural: "coordinadores",
    describe: (x) => `a ${x.firstName || x.email}`,
    idOf: (x) => x.id,
    remove: deactivate.mutateAsync,
    pending: deactivate.isPending,
    consequence: (many) => (many ? "Perderán el acceso de coordinador." : "Perderá el acceso de coordinador."),
    onDone: selection.stop,
  });

  const courseName = (c: Coordinator) => c.courseName ?? c.course?.name ?? courses.data?.find((x) => x.id === c.courseId)?.name;

  const openForm = (coordinator: Coordinator | null) => {
    setEditing(coordinator);
    setCourseId(coordinator?.courseId ? String(coordinator.courseId) : "");
    setFormOpen(true);
  };

  const columns: Column<Coordinator>[] = [
    {
      key: "name",
      header: "Coordinador",
      cell: (c) => (
        <div className="flex flex-col">
          <strong className="font-semibold">{fullName(c)}</strong>
          <span className="text-xs text-ink-500">{c.email}</span>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Alcance",
      cell: (c) => (c.courseId ? <Badge tone="info">{courseName(c) ?? `Curso ${c.courseId}`}</Badge> : <Badge tone="guinda">General</Badge>),
    },
    { key: "dni", header: "DNI", hideOnMobile: true, cell: (c) => c.dni ?? "—" },
    { key: "phone", header: "Celular", hideOnMobile: true, cell: (c) => (c.phone ? formatPhone(c.phone) : "—") },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      align: "right",
      cell: (c) => (
        <RowActions
          label={`Acciones para ${fullName(c)}`}
          items={[
            { label: "Editar datos", icon: <FiEdit2 />, onSelect: () => openForm(c) },
            { label: "Eliminar", icon: <FiTrash2 />, tone: "danger", onSelect: () => removal.request([c]) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Coordinadores"
        description={coordinators.data ? `${coordinators.data.total} coordinadores` : "Cargando…"}
        actions={
          <Button icon={<FiPlus />} onClick={() => openForm(null)}>
            Agregar coordinador
          </Button>
        }
      />
      <Alert tone="info">
        Un coordinador <strong>general</strong> consulta todos los docentes y salones. Uno <strong>de curso</strong> solo ve los docentes de ese curso. Ambos acceden en modo lectura.
      </Alert>
      <Card>
        <div className="flex justify-end p-4">
          <SelectionToggle active={selection.active} onStart={selection.start} onStop={selection.stop} />
        </div>
        {selection.active && (
          <SelectionBar count={selection.selectedRows.length} singular="coordinador" plural="coordinadores">
            <Button size="sm" variant="danger" icon={<FiTrash2 />} onClick={() => removal.request(selection.selectedRows)}>
              Eliminar
            </Button>
          </SelectionBar>
        )}
        <DataTable
          columns={columns}
          rows={rows}
          selection={selection.tableSelection}
          rowKey={(c) => c.id}
          loading={coordinators.isLoading}
          minWidth={620}
          empty={
            <EmptyState
              title="Aún no hay coordinadores"
              action={
                <Button icon={<FiPlus />} onClick={() => openForm(null)}>
                  Agregar coordinador
                </Button>
              }
            />
          }
        />
        {coordinators.data && coordinators.data.total > 0 && (
          <Pagination page={page} limit={limit} total={coordinators.data.total} noun="coordinadores" onPage={(p) => setParams({ pagina: String(p) })} />
        )}
      </Card>

      {formOpen && (
        <PersonForm
          open
          title={editing ? "Editar coordinador" : "Agregar coordinador"}
          initial={
            editing
              ? {
                  ...emptyPerson,
                  email: editing.email,
                  dni: editing.dni ?? "",
                  firstName: editing.firstName,
                  lastName: editing.lastName,
                  phone: editing.phone ?? "",
                  phonesAdditional: (editing.phonesAdditional ?? []).join(", "),
                  personalEmail: editing.personalEmail ?? "",
                }
              : emptyPerson
          }
          fields={["email", "dni", "firstName", "lastName", "personalEmail", "phone", "phonesAdditional"]}
          required={["email", "dni", "firstName", "lastName"]}
          submitLabel={editing ? "Guardar cambios" : "Crear coordinador"}
          saving={create.isPending || update.isPending}
          extra={() => (
            <Field label="Alcance" hint="Deja «Coordinador general» para que vea todos los cursos.">
              {(p) => (
                <Select {...p} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  <option value="">Coordinador general</option>
                  {(courses.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
          onClose={() => setFormOpen(false)}
          onSubmit={async (v) => {
            const payload = {
              email: v.email.trim(),
              dni: v.dni,
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              phone: v.phone || undefined,
              phonesAdditional: splitPhones(v.phonesAdditional),
              personalEmail: v.personalEmail.trim() || undefined,
              courseId: courseId ? Number(courseId) : editing ? null : undefined,
            };
            try {
              if (editing) await update.mutateAsync({ id: editing.id, ...payload });
              else await create.mutateAsync(payload);
              toast.success(editing ? "Coordinador actualizado" : "Coordinador creado");
              setFormOpen(false);
            } catch (error) {
              toast.error(apiErrorMessage(error, "No se pudo guardar el coordinador"));
            }
          }}
        />
      )}

      {removal.dialog}
    </>
  );
}
