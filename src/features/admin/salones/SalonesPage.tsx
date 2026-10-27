import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronRight, FiGrid, FiList, FiPlus } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAreas, useClasses, useClassMutations, useShifts } from "@/api/queries";
import type { Classroom } from "@/api/types";
import { LinkButtons } from "@/components/schedule/LinkButtons";
import { AreaBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, SearchInput, Select } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Overlay";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Spinner";
import { areaStyle } from "@/lib/areas";
import { shortClassName } from "@/lib/format";
import { toHHMM } from "@/lib/schedule";

type StatusFilter = "todos" | "faltan" | "completos" | "sin-enlaces";

interface Props {
  basePath: string;
  readOnly?: boolean;
  allowDetail?: boolean;
  title?: string;
}

export function SalonesPage({ basePath, readOnly = false, allowDetail = true, title = "Salones" }: Props) {
  const [params, setParams] = useSearchParams();
  const view = (params.get("vista") as "tarjetas" | "tabla") ?? "tarjetas";
  const status = (params.get("estado") as StatusFilter) ?? "todos";
  const areaId = params.get("area") ? Number(params.get("area")) : 0;
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const classes = useClasses();
  const areas = useAreas();
  const shifts = useShifts();

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (classes.data ?? [])
      .filter((c) => !areaId || c.areaId === areaId)
      .filter((c) => {
        if (status === "faltan") return c.status !== "COMPLETO";
        if (status === "completos") return c.status === "COMPLETO";
        if (status === "sin-enlaces") return !c.urlMeet || !c.urlClassroom;
        return true;
      })
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [classes.data, areaId, status, query]);

  const all = classes.data ?? [];
  const counts = {
    faltan: all.filter((c) => c.status !== "COMPLETO").length,
    completos: all.filter((c) => c.status === "COMPLETO").length,
    sinEnlaces: all.filter((c) => !c.urlMeet || !c.urlClassroom).length,
  };

  const byShift = (shifts.data ?? [])
    .map((shift) => ({ shift, items: filtered.filter((c) => c.shiftId === shift.id) }))
    .filter((group) => group.items.length);

  const detailLink = (c: Classroom) => (allowDetail ? `${basePath}/${c.id}` : undefined);

  const columns: Column<Classroom>[] = [
    {
      key: "name",
      header: "Salón",
      cell: (c) =>
        allowDetail ? (
          <Link to={detailLink(c)!} className="font-semibold">
            {shortClassName(c.name)}
          </Link>
        ) : (
          <strong>{shortClassName(c.name)}</strong>
        ),
    },
    { key: "area", header: "Área", cell: (c) => <AreaBadge name={c.area?.name} /> },
    { key: "shift", header: "Turno", cell: (c) => c.shift?.name },
    { key: "status", header: "Estado", cell: (c) => <StatusBadge classroom={c} /> },
    { key: "links", header: "Enlaces", cell: (c) => <LinkButtons meet={c.urlMeet} classroom={c.urlClassroom} size="sm" /> },
  ];

  return (
    <>
      <PageHeader
        title={title}
        description={classes.data ? `${all.length} salones en ${shifts.data?.length ?? 0} turnos` : "Cargando…"}
        actions={
          <>
            <Segmented
              label="Vista"
              value={view}
              onChange={(v) => set("vista", v === "tarjetas" ? null : v)}
              options={[
                { value: "tarjetas", label: <><FiGrid aria-hidden="true" /> Tarjetas</> },
                { value: "tabla", label: <><FiList aria-hidden="true" /> Tabla</> },
              ]}
            />
            {!readOnly && (
              <Button icon={<FiPlus />} onClick={() => setCreateOpen(true)}>
                Agregar salones
              </Button>
            )}
          </>
        }
      />

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <SearchInput className="min-w-[200px] flex-1" placeholder="Buscar salón" aria-label="Buscar salón" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Segmented
          label="Área"
          value={areaId}
          onChange={(v) => set("area", v ? String(v) : null)}
          options={[
            { value: 0, label: "Todas" },
            ...(areas.data ?? []).map((a) => ({
              value: a.id,
              label: (
                <>
                  <span className="size-2 rounded-full" style={{ background: areaStyle(a.name).dot }} aria-hidden="true" />
                  {a.name}
                </>
              ),
            })),
          ]}
        />
        <Select aria-label="Estado" className="w-auto" value={status} onChange={(e) => set("estado", e.target.value === "todos" ? null : e.target.value)}>
          <option value="todos">Estado: todos</option>
          <option value="faltan">Faltan docentes ({counts.faltan})</option>
          <option value="completos">Completos ({counts.completos})</option>
          <option value="sin-enlaces">Sin enlaces ({counts.sinEnlaces})</option>
        </Select>
      </Card>

      {classes.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState title="No hay salones con estos filtros" description="Cambia el área o el estado para ver más salones." />
        </Card>
      ) : view === "tabla" ? (
        <Card>
          <DataTable columns={columns} rows={filtered} rowKey={(c) => c.id} />
        </Card>
      ) : (
        byShift.map(({ shift, items }) => {
          const isCollapsed = collapsed.has(shift.id);
          const showAll = expanded.has(shift.id);
          const visible = showAll ? items : items.slice(0, 12);
          const pending = items.filter((c) => c.status !== "COMPLETO").length;
          return (
            <section key={shift.id} className="flex flex-col gap-3">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() => {
                  const next = new Set(collapsed);
                  if (isCollapsed) next.delete(shift.id);
                  else next.add(shift.id);
                  setCollapsed(next);
                }}
                className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 border-b border-line py-3 text-left"
              >
                <span className="flex items-center gap-3">
                  {isCollapsed ? <FiChevronRight className="text-marino-900" /> : <FiChevronDown className="text-marino-900" />}
                  <strong className="font-display text-base text-marino-900">{shift.name}</strong>
                  <span className="text-[13px] text-ink-500">
                    {toHHMM(shift.startTime)} – {toHHMM(shift.endTime)} · {items.length} salones
                  </span>
                </span>
                {pending > 0 && <Badge tone="warn">{pending} con docentes faltantes</Badge>}
              </button>
              {!isCollapsed && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {visible.map((c) => (
                      <RoomCard key={c.id} classroom={c} to={detailLink(c)} />
                    ))}
                  </div>
                  {items.length > visible.length && (
                    <button
                      type="button"
                      onClick={() => setExpanded(new Set(expanded).add(shift.id))}
                      className="h-9 cursor-pointer self-center rounded-[10px] border border-dashed border-[#B9BCCB] bg-white px-4 text-[13px] font-semibold text-marino-900"
                    >
                      Mostrar los {items.length - visible.length} salones restantes del {shift.name}
                    </button>
                  )}
                </>
              )}
            </section>
          );
        })
      )}

      {createOpen && !readOnly && <CreateClassDialog onClose={() => setCreateOpen(false)} />}
    </>
  );
}

function StatusBadge({ classroom }: { classroom: Classroom }) {
  if (classroom.status === "COMPLETO") return <Badge tone="ok">Completo</Badge>;
  return <Badge tone="warn">Faltan docentes</Badge>;
}

function RoomCard({ classroom, to }: { classroom: Classroom; to?: string }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <strong className="font-display text-[17px] text-marino-900">{shortClassName(classroom.name)}</strong>
        <AreaBadge name={classroom.area?.name} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge classroom={classroom} />
        <span className="tabular text-xs text-ink-500">Cap. {classroom.capacity}</span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line-soft pt-2.5">
        <LinkButtons meet={classroom.urlMeet} classroom={classroom.urlClassroom} size="sm" />
        {(!classroom.urlMeet || !classroom.urlClassroom) && <span className="text-xs font-semibold text-warn-700">Faltan enlaces</span>}
      </div>
    </>
  );
  const className = "flex flex-col gap-2.5 rounded-[14px] border border-line bg-white p-3.5 text-ink-900";
  return to ? (
    <Link to={to} className={`${className} transition hover:border-marino-900 hover:shadow-[0_8px_24px_rgba(28,33,64,0.08)]`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function CreateClassDialog({ onClose }: { onClose: () => void }) {
  const areas = useAreas();
  const shifts = useShifts();
  const { createMany } = useClassMutations();
  const [areaId, setAreaId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const count = Number(quantity);
  const valid = Number.isInteger(count) && count >= 1 && count <= 500;

  const submit = async () => {
    if (!areaId || !shiftId || !valid || createMany.isPending) return;
    try {
      const result = await createMany.mutateAsync({ area_id: Number(areaId), shift_id: Number(shiftId), quantity: count });
      toast.success(`${result.created} ${result.created === 1 ? "salón creado" : "salones creados"}, con sus monitores y horarios base`);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se creó ningún salón"));
    }
  };

  return (
    <Dialog
      open
      onClose={createMany.isPending ? () => {} : onClose}
      title="Agregar salones"
      description="Elige el área, el turno y cuántos salones quieres agregar. Cada uno tendrá su cuenta de monitor y su horario base."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createMany.isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={createMany.isPending} disabled={!areaId || !shiftId || !valid}>
            {valid ? `Crear ${count} ${count === 1 ? "salón" : "salones"}` : "Crear salones"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Área" required>
          {(p) => (
            <Select {...p} value={areaId} disabled={createMany.isPending} onChange={(e) => setAreaId(e.target.value)}>
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
            <Select {...p} value={shiftId} disabled={createMany.isPending} onChange={(e) => setShiftId(e.target.value)}>
              <option value="">Selecciona…</option>
              {(shifts.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {toHHMM(s.startTime)}–{toHHMM(s.endTime)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Cantidad de salones a agregar" required hint="Entre 1 y 500 para el área y turno seleccionados." error={!valid ? "Escribe un entero entre 1 y 500." : null}>
          {(p) => <Input {...p} type="number" min={1} max={500} step={1} value={quantity} disabled={createMany.isPending} onChange={(e) => setQuantity(e.target.value)} />}
        </Field>
        {valid && <p className="text-sm text-ink-500">Se agregarán {count} salones y {count} cuentas de monitor. Los nombres se numeran automáticamente; después puedes completar los datos de los monitores desde Importar archivos.</p>}
      </div>
    </Dialog>
  );
}
