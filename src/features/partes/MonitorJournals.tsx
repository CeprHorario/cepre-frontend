import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { limaTime } from './model';
import type { MonitorJournalsProps } from './types';

export function MonitorJournals(p: MonitorJournalsProps & { error: string; onRefresh: () => void }) {
  const filters = p.journalFilters;
  return <main className="space-y-4" aria-busy={p.journalsLoading}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-2xl font-bold">Partes por fecha</h1><Button variant="secondary" disabled={p.journalsLoading} onClick={p.onRefresh}>Actualizar</Button></div>
    <p className="text-sm">Jornadas por fecha, salón y turno, de la más reciente a la más antigua. Selecciona una para consultar todos sus bloques.</p>
    <fieldset className="flex flex-wrap gap-3" disabled={p.journalsLoading}>
      <Field label="Desde">{props => <Input {...props} type="date" value={filters.from} onChange={event => p.onJournalFilters({ ...filters, from: event.target.value, page: 1 })} />}</Field>
      <Field label="Hasta">{props => <Input {...props} type="date" value={filters.to} onChange={event => p.onJournalFilters({ ...filters, to: event.target.value, page: 1 })} />}</Field>
      <Field label="Jornadas por página">{props => <Select {...props} value={filters.limit} onChange={event => p.onJournalFilters({ ...filters, limit: Number(event.target.value), page: 1 })}>{[25, 50, 100].map(limit => <option key={limit} value={limit}>{limit}</option>)}</Select>}</Field>
    </fieldset>
    <p className="text-sm">Rango: {filters.from} — {filters.to} (máximo 93 días). Horas de Lima.</p>
    {p.error && <p role="alert">{p.error}</p>}
    {p.journalsLoading ? <p role="status">Cargando jornadas…</p> : p.journals && !p.journals.data.length && <p role="status">No hay jornadas registradas en este rango.</p>}
    <ul className="space-y-2">{p.journals?.data.map(journal => <li key={`${journal.date}:${journal.classId}:${journal.shiftId}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">
      <div><strong>{journal.date.split('-').reverse().join('/')} · {journal.className || 'Salón'}</strong><p className="text-sm">{journal.shift || `Turno ${journal.shiftId}`} · {limaTime(journal.scheduledStart)}–{limaTime(journal.scheduledEnd)} · {journal.blocks} bloques</p></div>
      <Button variant="secondary" onClick={() => p.onOpenJournal(journal)} aria-label={`Abrir jornada ${journal.date}, ${journal.className || 'salón'}, ${journal.shift || journal.shiftId}`}>Abrir jornada</Button>
    </li>)}</ul>
    <nav aria-label="Jornadas del monitor" className="flex flex-wrap items-center justify-end gap-3">
      <Button variant="secondary" disabled={p.journalsLoading || filters.page <= 1} onClick={() => p.onJournalFilters({ ...filters, page: filters.page - 1 })}>Anterior</Button>
      <span>Página {filters.page} · {p.journals?.total ?? 0} jornadas</span>
      <Button variant="secondary" disabled={p.journalsLoading || filters.page * filters.limit >= (p.journals?.total ?? 0)} onClick={() => p.onJournalFilters({ ...filters, page: filters.page + 1 })}>Siguiente</Button>
    </nav>
  </main>;
}
