import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiCalendar, FiRepeat } from 'react-icons/fi';
import { api, apiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Field, Select } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Overlay';
import type { PartContext } from './types';

interface Planning {
  current: {from:string;to:string;generated:boolean;advancedWeekday:number|null;sunday:string};
  next: {from:string;to:string;sunday:string;cutoff:string;weekday:number|null;version:number;generated:boolean;canChoose:boolean;days:{weekday:number;label:string;academicDate:string}[]};
}
const display=(date:string)=>new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'short'}).format(new Date(date+'T12:00:00Z'));

export function WeeklyPartsPlanner({context}:{context:PartContext}) {
  const cache=useQueryClient();
  const key=['parts-week-plan',context.accountId,context.process];
  const headers={'X-Class-Session-Context':context.process,'X-Class-Session-Account':context.accountId};
  const query=useQuery({queryKey:key,queryFn:async({signal})=>(await api.get<Planning>('/class-session-records/weeks/planning',{headers,signal})).data,retry:false,refetchInterval:30000});
  const [generating,setGenerating]=useState(false),[error,setError]=useState('');
  async function generate() {
    setError('');setGenerating(true);
    try {await api.post('/class-session-records/weeks/generate',{}, {headers});await query.refetch();await cache.invalidateQueries({queryKey:['parts',context.accountId,context.process]});}
    catch(e){setError(apiErrorMessage(e));}finally{setGenerating(false);}
  }
  return <section aria-label="Planificación semanal de partes" className="mx-auto mt-5 w-[calc(100%-2rem)] max-w-[1232px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-line bg-marino-50 px-5 py-4"><FiCalendar className="text-xl text-guinda-700"/><div><h2 className="font-display font-bold text-marino-900">Planificación semanal</h2><p className="text-xs text-ink-500">Una jornada de la próxima semana puede dictarse el domingo previo.</p></div></div>
    <div className="space-y-4 p-5">
      {(error||query.error)&&<div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error||apiErrorMessage(query.error)} <Button size="sm" variant="secondary" onClick={()=>void query.refetch()}>Actualizar planificación</Button></div>}
      {query.isPending&&<p role="status">Cargando planificación…</p>}
      {query.data&&<><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm"><strong>Semana actual:</strong> {display(query.data.current.from)} — {display(query.data.current.to)} <span className="ml-2 rounded-full bg-marino-50 px-2 py-1 text-xs">{query.data.current.generated?'Partes generados':'Por generar'}</span></p>{!query.data.current.generated&&<Button disabled={generating} onClick={()=>void generate()}>{generating?'Generando…':'Generar semana actual'}</Button>}</div>
      {query.data.current.advancedWeekday!==null&&<p className="rounded-xl bg-amber-50 p-3 text-sm">Esta semana incluye una jornada adelantada al domingo {display(query.data.current.sunday)}. Cada parte conserva su fecha académica.</p>}
      <WeekAdvanceForm key={`${context.process}:${query.data.next.from}:${query.data.next.version}`} data={query.data} headers={headers} onSaved={data=>{cache.setQueryData(key,data);}}/>
      </>}
    </div>
  </section>;
}

function WeekAdvanceForm({data,headers,onSaved}:{data:Planning;headers:Record<string,string>;onSaved:(data:Planning)=>void}) {
  const [choice,setChoice]=useState(data.next.weekday===null?'':String(data.next.weekday));
  const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const selected=data.next.days.find(d=>String(d.weekday)===choice);
  const dirty=choice!==(data.next.weekday===null?'':String(data.next.weekday));
  const cutoff=new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'medium',timeStyle:'short'}).format(new Date(data.next.cutoff));
  async function save(){setBusy(true);setError('');try{const response=await api.patch<Planning>('/class-session-records/weeks/advance',{weekStart:data.next.from,weekday:choice?Number(choice):null,expectedVersion:data.next.version},{headers});onSaved(response.data);setConfirm(false);}catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}}
  return <div className="space-y-3 border-t border-line pt-4">
    <div className="flex items-center gap-2 text-sm font-semibold text-marino-900"><FiRepeat/> Próxima semana: {display(data.next.from)} — {display(data.next.to)}</div>
    <div className="flex flex-wrap items-end gap-4"><div className="w-full max-w-sm"><Field label="Día que se adelantará al domingo">{p=><Select {...p} disabled={!data.next.canChoose||busy} value={choice} onChange={e=>setChoice(e.target.value)}><option value="">Sin adelanto</option>{data.next.days.map(d=><option key={d.weekday} value={d.weekday}>{d.label} · {display(d.academicDate)}</option>)}</Select>}</Field></div><Button disabled={!data.next.canChoose||!dirty||busy} onClick={()=>setConfirm(true)}>Guardar adelanto</Button></div>
    <p className="text-sm text-ink-500">Domingo de ejecución: <strong>{display(data.next.sunday)}</strong>. Se conservan cursos, docentes, salones y bloques horarios del día elegido.</p>
    <p className="text-xs text-ink-500">Puedes decidir hasta el cierre del último turno del sábado: {cutoff} (Lima). Después, la planificación queda cerrada y se genera la semana.</p>
    {!data.current.generated&&<p className="text-sm text-guinda-700">Genera primero los partes de la semana actual para habilitar esta opción.</p>}
    {data.current.generated&&!data.next.canChoose&&<p className="text-sm text-ink-500">La próxima semana ya está generada, terminó el plazo o está fuera del periodo operativo.</p>}
    <Dialog open={confirm} onClose={()=>!busy&&setConfirm(false)} title={choice?'Confirmar adelanto de jornada':'Quitar adelanto de jornada'} footer={<><Button variant="secondary" disabled={busy} onClick={()=>setConfirm(false)}>Cancelar</Button><Button disabled={busy} onClick={()=>void save()}>{busy?'Guardando…':'Confirmar planificación'}</Button></>}>
      <p className="text-sm">{selected?`La jornada académica del ${display(selected.academicDate)} se dictará el domingo ${display(data.next.sunday)}, con sus mismos cursos, docentes y horarios. Sus plazos de edición corresponderán al domingo y no se repetirá en la fecha original.`:'La próxima semana mantendrá sus fechas habituales, sin adelanto al domingo.'}</p>
      <p className="mt-3 text-sm text-ink-500">Esta decisión se registra en el historial. No traslada ni modifica partes existentes.</p>
      {error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </Dialog>
  </div>;
}
