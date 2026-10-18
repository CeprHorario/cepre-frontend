import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useShifts, useSupervisorMutations, useSupervisors } from "@/api/queries";
import type { SupervisorSummary } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Select } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { SelectionBar, SelectionToggle, useSelectionMode } from "@/components/ui/Selection";
import { formatPhone, fullName } from "@/lib/format";
import { splitPhones } from "@/lib/validators";
import { emptyPerson, PersonForm } from "./PersonForm";
import { useRemoval } from "./useRemoval";

export function SupervisoresPage({ basePath }: { basePath: string }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("pagina") ?? 1);
  const limit = Number(params.get("filas") ?? 20);
  const supervisors = useSupervisors({ page, limit });
  const shifts = useShifts();
  const { create, update, deactivate } = useSupervisorMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupervisorSummary | null>(null);
  const [shiftId, setShiftId] = useState("");
  const rows = supervisors.data?.data ?? [];
  const selection = useSelectionMode(rows, (x) => x.id);
  const removal = useRemoval<SupervisorSummary>({
    singular: "supervisor",
    plural: "supervisores",
    describe: (x) => `a ${x.firstName || x.email}`,
    idOf: (x) => x.id,
    remove: deactivate.mutateAsync,
    pending: deactivate.isPending,
    consequence: (many) => (many ? "Perderán el acceso y sus monitores quedarán sin supervisor." : "Perderá el acceso y sus monitores quedarán sin supervisor."),
    onDone: selection.stop,
  });

  const shiftName = (id: number | null) => shifts.data?.find((s) => s.id === id)?.name ?? "—";

  const openForm = (supervisor: SupervisorSummary | null) => {
    setEditing(supervisor);
    setShiftId(supervisor?.shiftId ? String(supervisor.shiftId) : "");
    setFormOpen(true);
  };

  const columns: Column<SupervisorSummary>[] = [
    {
      key: "name",
      header: "Supervisor",
      cell: (s) => (
        <div className="flex flex-col">
          <strong className="font-semibold">{fullName(s) || "Sin nombre"}</strong>
          <span className="text-xs text-ink-500">{s.email}</span>
        </div>
      ),
    },
    { key: "phone", header: "Celular", cell: (s) => (s.phone ? formatPhone(s.phone) : "—") },
    { key: "shift", header: "Turno", cell: (s) => shiftName(s.shiftId) },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      align: "right",
      cell: (s) => (
        <div className="inline-flex items-center gap-1.5">
          <Button size="sm" variant="navy" icon={<FiUsers />} onClick={() => navigate(`${basePath}/${s.id}/monitores`, { state: { supervisor: s } })}>
            Monitores
          </Button>
          <RowActions
            label={`Acciones para ${fullName(s)}`}
            items={[
              { label: "Editar datos", icon: <FiEdit2 />, onSelect: () => openForm(s) },
              { label: "Eliminar", icon: <FiTrash2 />, tone: "danger", onSelect: () => removal.request([s]) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Supervisores"
        description={supervisors.data ? `${supervisors.data.total} supervisores` : "Cargando…"}
        actions={
          <Button icon={<FiPlus />} onClick={() => openForm(null)}>
            Agregar supervisor
          </Button>
        }
      />
      <Card>
        <div className="flex justify-end p-4">
          <SelectionToggle active={selection.active} onStart={selection.start} onStop={selection.stop} />
        </div>
        {selection.active && (
          <SelectionBar count={selection.selectedRows.length} singular="supervisor" plural="supervisores">
            <Button size="sm" variant="danger" icon={<FiTrash2 />} onClick={() => removal.request(selection.selectedRows)}>
              Eliminar
            </Button>
          </SelectionBar>
        )}
        <DataTable
          columns={columns}
          rows={rows}
          selection={selection.tableSelection}
          rowKey={(s) => s.id}
          loading={supervisors.isLoading}
          minWidth={620}
          empty={
            <EmptyState
              title="Aún no hay supervisores"
              description="Cada supervisor hace seguimiento a los monitores de un turno."
              action={
                <Button icon={<FiPlus />} onClick={() => openForm(null)}>
                  Agregar supervisor
                </Button>
              }
            />
          }
        />
        {supervisors.data && supervisors.data.total > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={supervisors.data.total}
            noun="supervisores"
            onPage={(p) => setParams({ pagina: String(p), filas: String(limit) })}
            onLimit={(l) => setParams({ filas: String(l) })}
          />
        )}
      </Card>

      {formOpen && (
        <PersonForm
          open
          title={editing ? "Editar supervisor" : "Agregar supervisor"}
          initial={
            editing
              ? { ...emptyPerson, email: editing.email ?? "", firstName: editing.firstName, lastName: editing.lastName, phone: editing.phone ?? "", personalEmail: editing.personalEmail ?? "" }
              : emptyPerson
          }
          fields={editing ? ["email", "firstName", "lastName", "personalEmail", "phone"] : ["email", "dni", "firstName", "lastName", "personalEmail", "phone", "phonesAdditional"]}
          required={editing ? ["email", "firstName", "lastName"] : ["email", "dni", "firstName", "lastName"]}
          submitLabel={editing ? "Guardar cambios" : "Crear supervisor"}
          saving={create.isPending || update.isPending}
          extraValid={Boolean(shiftId)}
          extra={() => (
            <Field label="Turno que supervisa" required error={!shiftId ? "Selecciona el turno" : null}>
              {(p) => (
                <Select {...p} value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {(shifts.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              personalEmail: v.personalEmail.trim() || undefined,
              phone: v.phone || undefined,
              shift_id: Number(shiftId),
            };
            try {
              if (editing) await update.mutateAsync({ id: editing.id, ...payload });
              else await create.mutateAsync({ ...payload, dni: v.dni, phonesAdditional: splitPhones(v.phonesAdditional) });
              toast.success(editing ? "Supervisor actualizado" : "Supervisor creado");
              setFormOpen(false);
            } catch (error) {
              toast.error(apiErrorMessage(error, "No se pudo guardar el supervisor"));
            }
          }}
        />
      )}

      {removal.dialog}
    </>
  );
}
