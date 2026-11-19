import {useOperations} from '@/features/operations/useOperations';
import {useMemo,useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {api,apiErrorMessage} from '@/api/client';
import {useAuth} from '@/auth/AuthProvider';
import {Dialog} from '@/components/ui/Overlay';
import {Button} from '@/components/ui/Button';
import {Field,Input,Select,Textarea} from '@/components/ui/Field';
import type {PartRecord,PartRole,PersonKind} from './types';
import {limaTime} from './model';

export function consecutiveBlocks(rows:PartRecord[],base:PartRecord,kind:PersonKind){
  const ordered=rows.filter(r=>r.classId===base.classId&&r.shiftId===base.shiftId&&r.date===base.date&&(kind==='MONITOR'||r.courseId===base.courseId)).sort((a,b)=>a.period-b.period);
  let first=ordered.findIndex(r=>r.id===base.id),last=first;
  if(first<0)return [base];
  while(first>0&&ordered[first-1].period===ordered[first].period-1)first--;
  while(last+1<ordered.length&&ordered[last+1].period===ordered[last].period+1)last++;
  return ordered.slice(first,last+1);
}
export function PartEmergencyDialog({record,rows,role,process,onClose,onSaved}:{record:PartRecord;rows:PartRecord[];role:PartRole;process:string;onClose:()=>void;onSaved:()=>void}){
  const {user}=useAuth(),cache=useQueryClient(),op=useOperations();
  const [sameTurn,setSameTurn]=useState(false),[sameTurnReason,setSameTurnReason]=useState(''),[shiftId,setShiftId]=useState('');
  const [kind,setKind]=useState<PersonKind>('TEACHER'),[scope,setScope]=useState('BLOCK'),[person,setPerson]=useState(''),[search,setSearch]=useState(''),[page,setPage]=useState(1),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const headers=useMemo(()=>({'X-Class-Session-Context':process,'X-Class-Session-Account':user?.id}),[process,user?.id]);
  const candidates=useQuery({queryKey:['emergency-people',user?.id,process,record.id,kind,search,page,sameTurn,shiftId],queryFn:async({signal})=>(await api.get<{data:{id:string;name:string;email:string}[];total:number;limit:number}>(`/class-session-records/${record.id}/people`,{params:{kind,search,page,limit:25,sameTurn:sameTurn||undefined,shiftId:shiftId||undefined},headers,signal})).data,enabled:role!=='monitor',retry:false});
  const targets=scope==='CONSECUTIVE'?consecutiveBlocks(rows,record,kind):[record];
  async function save(){setBusy(true);setError('');try{
    if(role==='monitor')await api.post(`/class-session-records/${record.id}/emergency-request`,{expectedVersion:record.version,reason},{headers});
    else await api.post('/class-session-records/replacements',{operationId:crypto.randomUUID(),targets:targets.map(r=>({recordId:r.id,expectedVersion:r.version})),kind,personId:person,mode:'EMERGENCY',reason,sameTurn,sameTurnReason:sameTurn?sameTurnReason:undefined},{headers});
    await cache.invalidateQueries();onSaved();
  }catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}}
  return <Dialog open onClose={()=>!busy&&onClose()} title={role==='monitor'?'Solicitar cobertura de emergencia':'Registrar reemplazo de emergencia'} size="lg" footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Cancelar</Button><Button disabled={busy||reason.trim().length<3||(role!=='monitor'&&(!person||(sameTurn&&sameTurnReason.trim().length<10)))} onClick={()=>void save()}>{role==='monitor'?'Avisar al supervisor y administrador':'Registrar cobertura'}</Button></>}><div className="space-y-4"><div className="rounded-xl border border-line bg-marino-50 p-4 text-sm"><strong>{record.snapshot.className}</strong><p>{record.snapshot.course} · {limaTime(record.scheduledStart)}–{limaTime(record.scheduledEnd)}</p></div>
    {role!=='monitor'&&<><Field label="Persona a reemplazar">{p=><Select {...p} value={kind} onChange={e=>{setKind(e.target.value as PersonKind);setPerson('');setPage(1);}}><option value="TEACHER">Docente</option><option value="MONITOR">Monitor</option></Select>}</Field><Field label="Cobertura de emergencia">{p=><Select {...p} value={scope} onChange={e=>setScope(e.target.value)}><option value="BLOCK">Solo este bloque</option><option value="CONSECUTIVE">Todos los bloques consecutivos de esta clase</option></Select>}</Field><ul className="rounded-lg border border-line p-3 text-sm">{targets.map(r=><li key={r.id}>Bloque {r.period} · {limaTime(r.scheduledStart)}–{limaTime(r.scheduledEnd)}</li>)}</ul><Field label="Filtrar candidatos por turno">{p=><Select {...p} value={shiftId} onChange={e=>{setShiftId(e.target.value);setPerson('');}}><option value="">Todos los turnos</option>{op.context?.shifts?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</Select>}</Field>{kind==='MONITOR'&&<div className="rounded-xl bg-amber-50 p-3 text-sm"><label className="flex gap-2"><input type="checkbox" checked={sameTurn} onChange={e=>{setSameTurn(e.target.checked);setPerson('');}}/>No se encontró monitor de otro turno; registrar excepción.</label>{sameTurn&&<Field label="Justificación de mismo turno">{p=><Textarea {...p} value={sameTurnReason} onChange={e=>setSameTurnReason(e.target.value)}/>}</Field>}</div>}<Field label="Buscar reemplazante de emergencia">{p=><Input {...p} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>}</Field><Field label="Reemplazante de emergencia">{p=><Select {...p} value={person} onChange={e=>setPerson(e.target.value)}><option value="">Selecciona una persona compatible</option>{candidates.data?.data.map(c=><option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</Select>}</Field><div className="flex justify-end gap-2"><Button variant="ghost" disabled={page===1} onClick={()=>setPage(page-1)}>Anterior</Button><Button variant="ghost" disabled={page*25>=(candidates.data?.total??0)} onClick={()=>setPage(page+1)}>Más candidatos</Button></div>{candidates.error&&<p role="alert">{apiErrorMessage(candidates.error)}</p>}</>}
    <Field label="Motivo de la emergencia">{p=><Textarea {...p} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)}/>}</Field><p className="text-sm text-ink-500">{role==='monitor'?'Este aviso no asigna personas. Supervisión o administración registrarán la cobertura.':'Se identifica al reemplazante en los bloques seleccionados. Para docente se registra RE y el horario completo de cada bloque. El documento de sustento quedará pendiente.'}</p>{error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}</div></Dialog>;
}
