import { Button } from '@/components/ui/Button';
import { Field, Select } from '@/components/ui/Field';
import type { Classroom } from '@/api/types';

export function PartsClassrooms({ classes, loading, error, area, onArea, shiftId, onShift, onSelect, onRefresh }: {
  classes: Classroom[]; loading: boolean; error: string; area: string;
  onArea: (value: string) => void; onSelect: (id: string) => void; onRefresh: () => void;
  shiftId?: number; onShift: (value: number | undefined) => void;
}) {
  const areas = [...new Map(classes.map(c => [c.area.id, c.area])).values()].sort((a,b) => a.name.localeCompare(b.name));
  const shifts = [...new Map(classes.map(c => [c.shift.id, c.shift])).values()].sort((a,b) => a.id-b.id);
  const rows = classes.filter(c => (!area || String(c.area.id) === area) && (!shiftId || c.shiftId === shiftId)).sort((a,b) => a.name.localeCompare(b.name, 'es', {numeric:true}));
  return <main className="mx-auto w-full max-w-[1280px] space-y-5 p-4 sm:p-6" aria-busy={loading}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-2xl font-bold text-marino-900">Partes por salón</h1><p className="mt-1 text-sm text-ink-500">Selecciona un salón para consultar sus partes por fecha.</p></div><Button variant="secondary" disabled={loading} onClick={onRefresh}>Actualizar salones</Button></div>
    <div className="grid gap-4 sm:max-w-3xl sm:grid-cols-2">
      <Field label="Área">{p => <Select {...p} value={area} onChange={e => onArea(e.target.value)}><option value="">Todas las áreas</option>{areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>}</Field>
      <Field label="Turno">{p => <Select {...p} value={shiftId ?? ''} onChange={e => onShift(e.target.value ? Number(e.target.value) : undefined)}><option value="">Todos los turnos</option>{shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name}</option>)}</Select>}</Field>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading ? <p role="status">Cargando salones…</p> : <><p className="text-sm text-ink-500">{rows.length} salones</p><ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map(c => <li key={c.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5"><div><strong className="font-display text-lg text-marino-900">{c.name}</strong><p className="mt-1 text-sm text-ink-500">{c.area.name} · {c.shift.name}</p></div><Button variant="secondary" onClick={() => onSelect(c.id)} aria-label={`Ver partes de ${c.name}`}>Ver partes</Button></li>)}</ul>{!rows.length && <p role="status">No hay salones para estos filtros.</p>}</>}
  </main>;
}
