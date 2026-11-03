import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiAlertTriangle } from 'react-icons/fi';
import { apiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Overlay';
import { useDniIncidenceCounts, type DniIncidenceCount } from './useDniIncidenceCounts';
import type { PartContext } from '../partes/types';
import { incidenceApi } from './service';

function DniHistory({ dni, context, onClose }: { dni: string; context: PartContext; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const history = useQuery({ queryKey: ['incidences', context.accountId, context.process, 'dni-history', dni, page], queryFn: () => incidenceApi(context.process, context.accountId).list({ dni, page }), retry: false });
  return <Dialog open onClose={onClose} title={`Historial de incidencias · DNI ${dni}`} description="Todos los procesos, incluidas las incidencias resueltas." size="lg" footer={<><Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button><span className="self-center text-sm">Página {page} · {history.data?.total ?? '…'} incidencias</span><Button variant="ghost" disabled={!history.data || page * history.data.limit >= history.data.total} onClick={() => setPage(page + 1)}>Siguiente</Button><Button onClick={onClose}>Cerrar</Button></>}>
    {history.isPending && <p role="status">Cargando historial…</p>}
    {history.isError && <p role="alert">{apiErrorMessage(history.error)} <Button variant="ghost" onClick={() => void history.refetch()}>Reintentar</Button></p>}
    {history.data?.data.length === 0 && <p>Sin incidencias registradas.</p>}
    <ol className="flex flex-col gap-4">{history.data?.data.map(row => <li key={row.id} className="rounded-lg border border-line p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{row.title}</strong><span>{row.status === 'OPEN' ? 'Pendiente' : 'Resuelta'}</span></div><p className="text-xs text-ink-500">{row.subject_name} · {row.subject_role} · {row.process_schema} · {new Date(row.occurred_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Lima)</p><p className="mt-2 whitespace-pre-wrap break-words">{row.description}</p></li>)}</ol>
  </Dialog>;
}

export function DniIncidenceWarning({ dni, count, context }: { dni: string; count?: DniIncidenceCount; context?: PartContext }) {
  const [open, setOpen] = useState(false);
  return <span className="inline-flex flex-wrap items-center gap-2"><span>{dni || '—'}</span>{Boolean(count?.total) && <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded p-2 text-amber-800 hover:bg-amber-100 focus-visible:outline" aria-label={`DNI ${dni}: tiene ${count!.total} incidencias. Ver historial`} title={`Tiene ${count!.total} ${count!.total === 1 ? 'incidencia' : 'incidencias'}: ${count!.pending} pendientes; ${count!.total - count!.pending} resueltas. Haz clic para ver el historial.`}><FiAlertTriangle aria-hidden="true" /></button>}{open && context && <DniHistory dni={dni} context={context} onClose={() => setOpen(false)} />}</span>;
}

export function DniIncidenceNotice({ dni }: { dni: string }) {
  const summary = useDniIncidenceCounts([dni]);
  if (!/^\d{8}$/.test(dni)) return null;
  if (summary.loading) return <p role="status" className="text-xs text-ink-500">Consultando antecedentes del DNI…</p>;
  if (summary.error) return <p role="alert" className="text-sm text-danger-700">No se pudo verificar el historial: {apiErrorMessage(summary.error)}. Puedes continuar y consultarlo después.</p>;
  const count = summary.counts.get(dni);
  if (!count?.total) return null;
  return <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><DniIncidenceWarning key={dni} dni={dni} count={count} context={summary.context} /><p>Esta persona tiene antecedentes en el historial. Puedes revisarlos y continuar con el registro.</p></div>;
}
