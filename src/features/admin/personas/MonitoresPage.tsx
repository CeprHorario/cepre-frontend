import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAreas, useClasses, useClassMutations, useMonitorMutations, useMonitors, useShifts } from "@/api/queries";
import type { MonitorSummary } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Alert } from "@/components/ui/EmptyState";
import { Field, SearchInput, Select } from "@/components/ui/Field";
import { RowActions } from "@/components/ui/Menu";
import { SelectionBar, SelectionToggle, useSelectionMode } from "@/components/ui/Selection";
import { formatPhone, fullName, shortClassName } from "@/lib/format";
import { toHHMM } from "@/lib/schedule";
import { splitPhones } from "@/lib/validators";
import { emptyPerson, PersonForm } from "./PersonForm";
import { useRemoval } from "./useRemoval";

export function MonitoresPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("pagina") ?? 1);
  const limit = Number(params.get("filas") ?? 20);
  const shiftId = params.get("turno") ? Number(params.get("turno")) : null;
  const filterAreaId = params.get("area") ? Number(params.get("area")) : null;
  const [query, setQuery] = useState("");
  const monitors = useMonitors({ page, limit, shift_id: shiftId, area_id: filterAreaId });
  const shifts = useShifts();
  const classes = useClasses();
  const areas = useAreas();
  const { update, deactivate } = useMonitorMutations();
  const { create } = useClassMutations();
  const [editing, setEditing] = useState<MonitorSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [areaId, setAreaId] = useState("");
  const [newShiftId, setNewShiftId] = useState("");

  // Misma numeración que el backend: 100 × turno + salones existentes del área y turno + 1
  const nextClass = useMemo(() => {
    const area = areas.data?.find((a) => a.id === Number(areaId));
    if (!area || !newShiftId || !classes.data) return null;
    const count = classes.data.filter((c) => c.areaId === area.id && c.shiftId === Number(newShiftId)).length;
    const number = 100 * Number(newShiftId) + count + 1;
    return { name: `${area.name[0]}-${number}`, email: `${number}${area.name[0].toLowerCase()}@cepr.unsa.pe` };
  }, [areas.data, areaId, newShiftId, classes.data]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "pagina") next.delete("pagina");
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = monitors.data?.data ?? [];
    if (!q) return data;
    return data.filter((m) => [m.firstName, m.lastName, m.email, m.className].some((v) => v?.toLowerCase().includes(q)));
  }, [monitors.data, query]);

  const selection = useSelectionMode(rows, (m) => m.id);
  const removal = useRemoval<MonitorSummary>({
    singular: "monitor",
    plural: "monitores",
    describe: (m) => `al monitor de ${shortClassName(m.className)}`,
    idOf: (m) => m.id,
    remove: deactivate.mutateAsync,
    pending: deactivate.isPending,
    consequence: (many) => (many ? "Perderán el acceso y sus salones quedarán sin monitor activo." : "Perderá el acceso y el salón quedará sin monitor activo."),
    onDone: selection.stop,
  });

  const columns: Column<MonitorSummary>[] = [
    { key: "class", header: "Salón", cell: (m) => <strong>{shortClassName(m.className)}</strong> },
    {
      key: "name",
      header: "Monitor",
      cell: (m) =>
        fullName(m) ? (
          <div className="flex flex-col">
            <span className="font-semibold">{fullName(m)}</span>
            {m.personalEmail && <span className="text-xs text-ink-500">{m.personalEmail}</span>}
          </div>
        ) : (
          <span className="text-ink-500">Sin datos registrados</span>
        ),
    },
    { key: "email", header: "Correo de acceso", hideOnMobile: true, cell: (m) => <span className="text-ink-700">{m.email}</span> },
    { key: "phone", header: "Celular", hideOnMobile: true, cell: (m) => (m.phone ? formatPhone(m.phone) : "—") },
    { key: "shift", header: "Turno", cell: (m) => m.shift },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      align: "right",
      cell: (m) => (
        <RowActions
          label={`Acciones para ${m.className}`}
          items={[
            { label: "Editar datos", icon: <FiEdit2 />, onSelect: () => setEditing(m) },
            { label: "Eliminar", icon: <FiTrash2 />, tone: "danger", onSelect: () => removal.request([m]) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Monitores"
        description={monitors.data ? `${monitors.data.total} monitores, uno por salón` : "Cargando…"}
        actions={
          <Button
            icon={<FiPlus />}
            onClick={() => {
              setAreaId("");
              setNewShiftId("");
              setCreating(true);
            }}
          >
            Agregar monitor
          </Button>
        }
      />
      <Alert tone="info">
        Cada monitor pertenece a un salón. Al agregar uno se crea el siguiente salón del área y turno elegidos, con su horario base. Si no indicas
        un correo se usa el automático (por ejemplo <strong>101b@cepr.unsa.pe</strong>).
      </Alert>
      <Card>
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <SearchInput className="min-w-[220px] flex-1" placeholder="Buscar en esta página" aria-label="Buscar monitor" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select aria-label="Área" className="w-auto" value={filterAreaId ?? ""} onChange={(e) => setParam("area", e.target.value || null)}>
            <option value="">Todas las áreas</option>
            {(areas.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select aria-label="Turno" className="w-auto" value={shiftId ?? ""} onChange={(e) => setParam("turno", e.target.value || null)}>
            <option value="">Todos los turnos</option>
            {(shifts.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <SelectionToggle active={selection.active} onStart={selection.start} onStop={selection.stop} />
        </div>
        {selection.active && (
          <SelectionBar count={selection.selectedRows.length} singular="monitor" plural="monitores">
            <Button size="sm" variant="danger" icon={<FiTrash2 />} onClick={() => removal.request(selection.selectedRows)}>
              Eliminar
            </Button>
          </SelectionBar>
        )}
        <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} loading={monitors.isLoading} selection={selection.tableSelection} />
        {monitors.data && (
          <Pagination
            page={page}
            limit={limit}
            total={monitors.data.total}
            noun="monitores"
            onPage={(p) => setParam("pagina", String(p))}
            onLimit={(l) => setParam("filas", String(l))}
          />
        )}
      </Card>

      {editing && (
        <PersonForm
          open
          title={`Monitor de ${shortClassName(editing.className)}`}
          initial={{ ...emptyPerson, firstName: editing.firstName, lastName: editing.lastName, phone: editing.phone, personalEmail: editing.personalEmail }}
          fields={["firstName", "lastName", "personalEmail", "phone"]}
          required={["firstName", "lastName"]}
          submitLabel="Guardar cambios"
          saving={update.isPending}
          onClose={() => setEditing(null)}
          onSubmit={async (v) => {
            try {
              await update.mutateAsync({ id: editing.id, firstName: v.firstName.trim(), lastName: v.lastName.trim(), personalEmail: v.personalEmail.trim(), phone: v.phone });
              toast.success("Monitor actualizado");
              setEditing(null);
            } catch (error) {
              toast.error(apiErrorMessage(error, "No se pudo actualizar el monitor"));
            }
          }}
        />
      )}

      {creating && (
        <PersonForm
          open
          title="Agregar monitor"
          initial={emptyPerson}
          fields={["email", "dni", "firstName", "lastName", "personalEmail", "phone", "phonesAdditional"]}
          required={["firstName", "lastName"]}
          submitLabel="Crear monitor y salón"
          saving={create.isPending}
          extraValid={Boolean(areaId && newShiftId)}
          extra={() => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Área" required>
                  {(p) => (
                    <Select {...p} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                      <option value="">Selecciona…</option>
                      {(areas.data ?? []).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Turno" required>
                  {(p) => (
                    <Select {...p} value={newShiftId} onChange={(e) => setNewShiftId(e.target.value)}>
                      <option value="">Selecciona…</option>
                      {(shifts.data ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {toHHMM(s.startTime)}–{toHHMM(s.endTime)}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
              {nextClass && (
                <Alert tone="info">
                  Se creará el salón <strong>{nextClass.name}</strong>. Si dejas el correo vacío, el monitor entrará con <strong>{nextClass.email}</strong>.
                </Alert>
              )}
            </>
          )}
          onClose={() => setCreating(false)}
          onSubmit={async (v) => {
            try {
              const created = await create.mutateAsync({
                area_id: Number(areaId),
                shift_id: Number(newShiftId),
                monitor: {
                  email: v.email.trim() || undefined,
                  dni: v.dni || undefined,
                  firstName: v.firstName.trim(),
                  lastName: v.lastName.trim(),
                  phone: v.phone || undefined,
                  phonesAdditional: splitPhones(v.phonesAdditional),
                  personalEmail: v.personalEmail.trim() || undefined,
                },
              });
              toast.success(`Monitor y salón ${created?.name ? shortClassName(created.name) : ""} creados`);
              setCreating(false);
            } catch (error) {
              const message = apiErrorMessage(error, "No se pudo crear el monitor");
              toast.error(/already exists/i.test(message) ? "Ese correo (o DNI) ya está registrado en el sistema" : message);
            }
          }}
        />
      )}

      {removal.dialog}
    </>
  );
}
