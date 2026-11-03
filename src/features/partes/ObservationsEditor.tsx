import { useState } from 'react';
import { Dialog } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
export interface PartObservation { id:string; target:'TEACHER'|'STUDENT'|'CLASSROOM'; firstName?:string; lastName?:string; description:string }
const labels={TEACHER:'Docente de este bloque',STUDENT:'Alumno',CLASSROOM:'Aula'};
export function ObservationsEditor({value,onChange,disabled=false}:{value:PartObservation[];onChange:(value:PartObservation[])=>void;disabled?:boolean}) {
 const [open,setOpen]=useState(false);
 const [entries,setEntries]=useState<PartObservation[]>([]);
 const [error,setError]=useState('');
 return <><Button variant="secondary" disabled={disabled} onClick={()=>{setEntries(value.map(o=>({...o})));setError('');setOpen(true);}}>Observaciones{value.length ? ` (${value.length})` : ''}</Button>
 <Dialog open={open} onClose={()=>setOpen(false)} title="Observaciones del bloque">
 <p className="mb-4 text-sm text-muted">Identifica a quién corresponde cada observación. Solo las del docente se vinculan a su historial personal.</p>
 <div className="space-y-4">{entries.map((o,i)=><fieldset key={o.id} className="rounded-xl border border-border p-4 space-y-3"><legend>Observación {i+1}</legend>
 <Select aria-label="Tipo de observación" value={o.target} onChange={e=>setEntries(entries.map(x=>x.id===o.id?{...x,target:e.target.value as PartObservation['target']}:x))}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select>
 {o.target==='STUDENT'&&<div className="grid grid-cols-2 gap-3"><Input placeholder="Nombres" aria-label="Nombres del alumno" maxLength={128} value={o.firstName??''} onChange={e=>setEntries(entries.map(x=>x.id===o.id?{...x,firstName:e.target.value}:x))}/><Input placeholder="Apellidos" aria-label="Apellidos del alumno" maxLength={128} value={o.lastName??''} onChange={e=>setEntries(entries.map(x=>x.id===o.id?{...x,lastName:e.target.value}:x))}/></div>}
 <Textarea aria-label="Descripción de la observación" maxLength={2000} rows={3} value={o.description} onChange={e=>setEntries(entries.map(x=>x.id===o.id?{...x,description:e.target.value}:x))}/>
 <Button variant="ghost" onClick={()=>setEntries(entries.filter(x=>x.id!==o.id))}>Quitar observación</Button></fieldset>)}</div>
 {error&&<p role="alert" className="text-red-700">{error}</p>}
 <div className="mt-5 flex flex-wrap justify-end gap-3"><Button variant="secondary" disabled={entries.length>=20} onClick={()=>setEntries([...entries,{id:crypto.randomUUID(),target:'CLASSROOM',description:''}])}>Agregar observación</Button><Button variant="ghost" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={()=>{if(entries.some(o=>o.description.trim().length<3||(o.target==='STUDENT'&&(!o.firstName?.trim()||!o.lastName?.trim())))){setError('Completa la descripción y los nombres del alumno cuando corresponda.');return;}onChange(entries);setOpen(false);}}>Aplicar al borrador</Button></div>
 </Dialog></>;
}
