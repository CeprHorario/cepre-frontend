import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiDownload } from 'react-icons/fi';
import { api, apiErrorMessage } from '@/api/client';
import { SimpleLayout } from '@/components/layout/ModuleLayout';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { limaDate } from '@/features/partes/model';
import { useOperations } from './useOperations';
import { reportColumns } from './reportColumns';
import '@/components/layout/task-workspace.css';

export function ReportsPage() {
  const op = useOperations();
  const [from, setFrom] = useState(limaDate()), [to, setTo] = useState(limaDate());
  const [type, setType] = useState('incidences'), [page, setPage] = useState(1), [error, setError] = useState('');
  const params = { from, to, type, page, limit: 25 };
  const result = useQuery({ queryKey: [...op.scope, 'reports', params], queryFn: ({ signal }) => op.read<{ data: Record<string, unknown>[]; hasNext: boolean }>('reports', params, signal), enabled: !!op.context });
  async function download() {
    try {
      const { data } = await api.get<Blob>('/operations/reports/excel', { params, headers: op.headers, responseType: 'blob' });
      const url = URL.createObjectURL(data), anchor = document.createElement('a');
      anchor.href = url; anchor.download = `Reporte-${type}.xlsx`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (failure) { setError(apiErrorMessage(failure)); }
  }
  return <SimpleLayout crumbs={[{ label: 'Panel', to: '/admin' }, { label: 'Reportes' }]}>
    <main className="task-workspace mx-auto w-full max-w-[1600px] space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-2xl font-bold">Reportes de seguimiento</h1><nav className="flex flex-wrap gap-2"><ButtonLink to="/admin/solicitudes" variant="secondary">Administrar reemplazos y documentos</ButtonLink><ButtonLink to="/admin/incidencias" variant="secondary">Administrar incidencias e historial</ButtonLink></nav></div>
      <p className="break-all text-xs text-ink-500">{op.context?.process}</p>
      <div className="grid items-end gap-4 rounded-xl border border-line bg-white p-4 sm:grid-cols-4">
        <label>Desde<Input type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} /></label>
        <label>Hasta<Input type="date" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} /></label>
        <label>Reporte<Select value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="incidences">Incidencias personales</option><option value="observations">Observaciones de bloques y alumnos</option><option value="requests">Solicitudes y reemplazos</option><option value="performance">Seguimiento de personal</option></Select></label>
        <Button variant="secondary" icon={<FiDownload aria-hidden="true" />} onClick={() => void download()}>Exportar Excel</Button>
      </div>
      {(error || result.error) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-red-50 p-4 text-red-800"><span>{error || apiErrorMessage(result.error)}</span>{result.error && <Button variant="secondary" onClick={() => { void result.refetch(); }}>Reintentar reporte</Button>}</div>}
      <div className="overflow-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm"><thead><tr>{Object.keys(result.data?.data[0] ?? {}).map(key => <th key={key} className="border-r">{reportColumns[key] ?? key.replaceAll('_', ' ')}</th>)}</tr></thead>
          <tbody>{result.data?.data.map((row, index) => <tr key={index} className="border-b">{Object.entries(row).map(([key, value]) => <td key={key} className="max-w-sm border-r align-top">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</td>)}</tr>)}</tbody>
        </table>
        {!result.data?.data.length && !result.isError && <p className="p-6">{result.isPending ? 'Cargando…' : 'Sin registros en este rango.'}</p>}
      </div>
      <details className="text-xs text-ink-500"><summary>Qué describe el reporte</summary><p className="mt-2">Incidencias, solicitudes y control registrado por persona. Las métricas describen registros existentes. No asignan justificaciones, puntajes ni sanciones automáticamente.</p></details>
      <div className="flex justify-end gap-3"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button><span>Página {page}</span><Button variant="secondary" disabled={!result.data?.hasNext} onClick={() => setPage(page + 1)}>Siguiente</Button></div>
    </main>
  </SimpleLayout>;
}
