import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useOperations,type Page,type WorkBlock} from './useOperations';
import {limaDate,limaTime} from '@/features/partes/model';
import {Button} from '@/components/ui/Button';
import {LinkButtons} from '@/components/schedule/LinkButtons';
import {apiErrorMessage} from '@/api/client';

export function TeachingReplacements(){
  const op=useOperations(),[page,setPage]=useState(1);
  const from=limaDate(),to=limaDate(new Date(Date.now()+92*86400000));
  const query=useQuery({queryKey:[...op.scope,'teaching-replacements',from,to,page],queryFn:({signal})=>op.read<Page<{id:string;date:string;blocks:WorkBlock[];meet:string|null;classroom:string|null}>>('teaching-replacements',{from,to,page,limit:20},signal),enabled:!!op.context,refetchInterval:15000});
  if(!query.data?.data.length&&!query.error)return null;
  return <section className="rounded-2xl border border-dashed border-marino-200 bg-marino-50/60 p-5" aria-label="Clases de reemplazo autorizadas"><h2 className="font-display text-lg font-bold text-marino-900">Mis clases por reemplazo</h2><p className="mt-1 text-xs text-ink-500">Coberturas autorizadas para los próximos tres meses. Se muestran por fecha, sin modificar tu horario habitual.</p>{query.error&&<p role="alert">{apiErrorMessage(query.error)}</p>}<ul className="mt-4 grid gap-3 sm:grid-cols-2">{query.data?.data.map(r=><li key={r.id} className="rounded-xl border border-marino-200 bg-white/70 p-4"><span className="rounded-full bg-oro-100 px-2 py-1 text-xs text-oro-700">Reemplazo autorizado</span><strong className="mt-3 block">{r.date.slice(0,10).split('-').reverse().join('/')}</strong>{r.blocks.map(b=><p key={b.hourSessionId} className="mt-1 text-sm">{b.className} · {b.course} · {limaTime(b.start)}–{limaTime(b.end)}</p>)}<div className="mt-3"><LinkButtons meet={r.meet} classroom={r.classroom} size="sm"/></div></li>)}</ul>{(query.data?.total??0)>20&&<nav className="mt-3 flex justify-end gap-3"><Button variant="secondary" disabled={page===1} onClick={()=>setPage(page-1)}>Anterior</Button><Button variant="secondary" disabled={page*20>=(query.data?.total??0)} onClick={()=>setPage(page+1)}>Siguiente</Button></nav>}</section>;
}
