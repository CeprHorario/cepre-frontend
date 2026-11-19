import {ReplacementRequestForm,type PendingDocument} from './ReplacementRequestForm';
import {RequestPdfViewer,requestPdf} from './RequestPdfViewer';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '@/api/client';
import { useAuth, ROLE_HOME } from '@/auth/AuthProvider';
import { SimpleLayout } from '@/components/layout/ModuleLayout';
import { Button } from '@/components/ui/Button';
import { Select, Textarea, Field } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Overlay';
import { limaDate, limaTime } from '@/features/partes/model';
import { useOperations, type Page, type RequestRow, type RequestPerson } from './useOperations';
import '@/components/layout/task-workspace.css';

const states:Record<string,string>={PENDING:'Pendiente de revisión',ADMIN_PENDING:'Pendiente de permiso administrativo',CHANGES:'Por corregir',APPROVED:'Permiso aprobado',REJECTED:'Rechazada definitivamente',CANCELLED:'Cancelada',SUPERSEDED:'Sustituida por una corrección'};
const cancellation:Record<string,string>={REVIEW:'Cancelación pendiente de revisión',ADMIN:'Cancelación pendiente del administrador',CHANGES:'Corregir motivo de cancelación'};
const active=['PENDING','ADMIN_PENDING','CHANGES','APPROVED'];

export function RequestsPage(){
  const op=useOperations(), {user}=useAuth();
  if(!op.context)return <SimpleLayout crumbs={[{label:'Panel',to:user?ROLE_HOME[user.role]:'/'},{label:'Solicitudes y reemplazos'}]}><main className="mx-auto max-w-6xl p-6">{op.error?<p role="alert">{apiErrorMessage(op.error)}</p>:<p role="status">Verificando cuenta y proceso autorizado…</p>}</main></SimpleLayout>;
  return <RequestsWorkspace key={op.scope.join(':')}/>;
}
function RequestsWorkspace(){
  const {user}=useAuth(), op=useOperations(), cache=useQueryClient();
  const [pdf,setPdf]=useState<Blob|null>(null),[coverage,setCoverage]=useState<PendingDocument|null>(null);
  const pending=useQuery({queryKey:[...op.scope,'pending-documents'],queryFn:({signal})=>op.read<PendingDocument[]>('document-pending',{},signal),enabled:!!op.context&&['profesor','monitor'].includes(op.context.role)});
  const [page,setPage]=useState(1), [status,setStatus]=useState(''), [creating,setCreating]=useState(false), [editing,setEditing]=useState<RequestRow|null>(null);
  const [decision,setDecision]=useState<RequestRow|null>(null), [reason,setReason]=useState(''), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const list=useQuery({queryKey:[...op.scope,'requests',page,status],queryFn:({signal})=>op.read<Page<RequestRow>>('requests',{page,limit:20,status:status||undefined},signal),enabled:!!op.context});
  async function decide(action:string){
    if(!decision)return;setBusy(true);setError('');
    try{await api.patch(`/operations/requests/${decision.id}`,{expectedVersion:decision.version,status:action,reason:reason.trim()||undefined},{headers:op.headers});setDecision(null);await cache.invalidateQueries({queryKey:op.scope});await cache.invalidateQueries({queryKey:['parts']});}
    catch(e){setError(apiErrorMessage(e));}finally{setBusy(false);}
  }
  async function document(row:RequestRow,format:'pdf'|'docx'){
    try{const {data}=await api.get<Blob>(`/operations/requests/${row.id}/${format}`,{headers:op.headers,responseType:'blob'});const url=URL.createObjectURL(data),a=window.document.createElement('a');a.href=url;a.download=`Solicitud-${row.date.slice(0,10)}-${row.id}.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
    catch(e){setError(apiErrorMessage(e));}
  }
  const readOnly=user?.role==='coordinador'&&user.coordinatorCourseId==null;
  const owner=decision?.requester_user_id===user?.id;
  const canReview=!!decision&&decision.requester_user_id!==user?.id&&decision.replacement_user_id!==user?.id&&(
    decision.cancellation_stage==='ADMIN'?user?.role==='administrador':decision.cancellation_stage==='REVIEW'?decision.is_reviewer:!decision.cancellation_stage&&(decision.status==='ADMIN_PENDING'?user?.role==='administrador':decision.status==='PENDING'&&decision.is_reviewer));
  const canCancel=!!decision&&active.includes(decision.status)&&(!decision.cancellation_stage||decision.cancellation_stage==='CHANGES')&&(owner||decision.is_reviewer);
  const validDecision=busy||reason.trim().length<3;
  return <SimpleLayout crumbs={[{label:'Panel',to:user?ROLE_HOME[user.role]:'/'},{label:'Solicitudes y reemplazos'}]}>
    <main className="task-workspace mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-2xl font-bold">Solicitudes y reemplazos</h1><p className="mt-2 text-sm text-ink-500">El reemplazo se aplica únicamente cuando el administrador aprueba el permiso.</p></div>{!readOnly&&user?.role!=='administrador'&&<Button onClick={()=>{setEditing(null);setCoverage(null);setCreating(true);}}>Solicitar reemplazo</Button>}</div>
      {!!pending.data?.length&&<section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold">Documentos pendientes de tus reemplazos</h2><p className="mt-1 text-sm">Estas coberturas ya figuran en el parte y requieren su sustento documental.</p><ul className="mt-3 space-y-2">{pending.data.map(c=><li className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm" key={c.operationId}><span>{c.classroom} · {c.date.slice(0,10)} · {c.mode==='EMERGENCY'?'Emergencia':'RN provisional'}</span><Button size="sm" onClick={()=>{setCoverage(c);setEditing(null);setCreating(true);}}>Presentar documento</Button></li>)}</ul></section>}
      <Field label="Estado de la solicitud">{p=><Select {...p} value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Todos los estados</option>{Object.entries(states).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select>}</Field>
      {(error||list.error)&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error||apiErrorMessage(list.error)}</p>}
      <div className="overflow-x-auto rounded-2xl border border-line bg-white"><table className="w-full text-left text-sm"><thead className="bg-marino-900 text-white"><tr>{['Emisión y reemplazo','Solicitante y cobertura','Revisión y permiso','Documentos','Acciones'].map(t=><th key={t} className="border-r border-white/20 p-4">{t}</th>)}</tr></thead><tbody>
        {list.data?.data.map(r=>{const summary=r.summary;return <tr key={r.id} data-request={r.id} className="border-b border-line align-top">
          <td className="border-r p-4"><p className="text-xs text-ink-500">Emisión</p><p>{r.created_at?limaDate(new Date(r.created_at)):'—'}</p><p className="mt-3 text-xs text-ink-500">Fecha del reemplazo</p><strong>{r.date.slice(0,10)}</strong></td>
          <td className="min-w-72 border-r p-4"><RequestIdentity person={summary?.applicant} role={r.subject_role} fallback={r.requester_email??''}/><div className="my-3 rounded-lg border border-line bg-marino-50 px-3 py-2 text-sm"><strong>{summary?.full?'Todo el turno':'Cobertura parcial'}</strong><p>{summary?`${summary.shift} · ${summary.start}–${summary.end}`:`${limaTime(r.blocks[0]?.start??null)}–${limaTime(r.blocks.at(-1)?.end??null)}`}</p>{summary&&!summary.full&&r.blocks.map(b=><p className="text-xs" key={b.hourSessionId}>{limaTime(b.start)}–{limaTime(b.end)} · {b.course}</p>)}</div><span className="text-xs font-semibold uppercase text-ink-500">Reemplazante</span><RequestIdentity person={summary?.replacement} role={r.subject_role} fallback={r.replacement_email??''}/></td>
          <td className="min-w-52 border-r p-4"><span className="inline-block rounded-lg bg-marino-50 px-3 py-2 text-sm font-semibold">{states[r.status]??r.status}</span>{r.cancellation_stage&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">{cancellation[r.cancellation_stage]}. {r.status==='APPROVED'&&'El permiso sigue vigente hasta aprobar la cancelación.'}</p>}{r.decision_reason&&r.decision_reason!=='Conforme'&&<p className="mt-3 whitespace-pre-wrap text-sm">{r.decision_reason}</p>}{r.application_issue&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{r.application_issue}</p>}</td>
          <td className="border-r p-4"><div className="flex flex-col items-start gap-2">{r.docx_object&&<Button variant="secondary" size="sm" onClick={()=>void document(r,'docx')}>Solicitud Word</Button>}{['administrador','supervisor'].includes(user?.role??'')&&<Button variant="secondary" size="sm" onClick={()=>{void requestPdf(`/operations/requests/${r.id}/pdf`,op.headers).then(setPdf).catch(e=>setError(apiErrorMessage(e)));}}>Ver expediente PDF</Button>}<Button variant="ghost" size="sm" onClick={()=>void document(r,'pdf')}>Descargar PDF con anexos</Button></div></td>
          <td className="p-4"><div className="flex flex-col items-start gap-2">{!readOnly&&active.includes(r.status)?<Button size="sm" variant="secondary" onClick={()=>{setDecision(r);setReason('');setError('');}}>Gestionar solicitud</Button>:<Button size="sm" variant="secondary" disabled>{readOnly?'Solo lectura':states[r.status]??'Resuelta'}</Button>}{!readOnly&&r.status==='CHANGES'&&!r.cancellation_stage&&r.requester_user_id===user?.id&&<Button size="sm" onClick={()=>{setEditing(r);setCoverage(null);setCreating(true);}}>Corregir documento</Button>}</div></td>
        </tr>;})}
      </tbody></table>{list.isPending?<p className="p-6">Cargando solicitudes…</p>:!list.data?.data.length&&<p className="p-6">No hay solicitudes para estos filtros.</p>}</div>
      <nav className="flex items-center justify-end gap-3" aria-label="Paginación de solicitudes"><Button variant="secondary" disabled={page===1} onClick={()=>setPage(page-1)}>Anterior</Button><span>Página {page}</span><Button variant="secondary" disabled={page*20>=(list.data?.total??0)} onClick={()=>setPage(page+1)}>Siguiente</Button></nav>
      <Dialog open={!!decision} onClose={()=>!busy&&setDecision(null)} title="Gestionar solicitud">
        <p className="mb-3 whitespace-pre-wrap text-sm">{decision?.reason}</p>{decision?.cancellation_reason&&<p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm">Cancelación solicitada: {decision.cancellation_reason}</p>}
        <Field label="Motivo para rechazar, solicitar corrección o cancelar">{p=><Textarea {...p} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)}/>}</Field>
        {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          {canCancel&&<Button variant="secondary" disabled={validDecision} onClick={()=>void decide('REQUEST_CANCEL')}>{decision?.cancellation_stage==='CHANGES'?'Reenviar cancelación corregida':'Solicitar cancelación'}</Button>}
          {canReview&&<><Button variant="danger" disabled={validDecision} onClick={()=>void decide(decision?.cancellation_stage?'REJECT_CANCEL':'REJECTED')}>{decision?.cancellation_stage?'Rechazar cancelación':'Rechazar definitivamente'}</Button><Button variant="secondary" disabled={validDecision} onClick={()=>void decide('CHANGES')}>Solicitar corrección</Button><Button disabled={busy} onClick={()=>void decide(decision?.cancellation_stage?'APPROVE_CANCEL':'APPROVED')}>{user?.role==='administrador'?(decision?.cancellation_stage?'Autorizar cancelación':'Aprobar permiso y aplicar'):'Aprobar y enviar al administrador'}</Button></>}
        </div>
        {!canReview&&!canCancel&&<p className="mt-4 text-sm text-ink-500">La solicitud está en revisión por el responsable de la siguiente etapa.</p>}
      </Dialog>
      {creating&&<ReplacementRequestForm existing={editing} coverage={coverage} onClose={()=>setCreating(false)} onSaved={()=>{setCreating(false);setEditing(null);void cache.invalidateQueries({queryKey:op.scope});}}/>}
      <RequestPdfViewer blob={pdf} onClose={()=>setPdf(null)}/>
    </main>
  </SimpleLayout>;
}


function RequestIdentity({person,role,fallback}:{person?:RequestPerson;role:string;fallback:string}){
  return <div className="text-sm"><strong className="block">{role==='monitor'?`Monitor del salón ${person?.classroom??'registrado'}`:role==='profesor'?person?.course??'Docente':role==='supervisor'?`Supervisor ${person?.code??''}`:'Coordinación'}</strong>{person?<><span className="block">{person.name}</span><span className="block text-xs text-ink-500">DNI {person.dni??'No registrado'} · {person.email}</span>{person.shift&&<span className="block text-xs text-ink-500">{person.shift}</span>}</>:<span>{fallback}</span>}</div>;
}
