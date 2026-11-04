import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { FiAlertTriangle, FiArrowUp, FiCalendar, FiCheck, FiClock, FiEdit2, FiGrid, FiImage, FiInfo, FiMaximize, FiMoreHorizontal, FiPlus, FiRepeat, FiTrash2, FiUser, FiUsers, FiUserX, FiX } from 'react-icons/fi';
import { Dialog } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { editorDraft, limaTime, toDraft } from './model';
import type { ClassState, PartEditor, PartRecord, PartsViewProps, Slot } from './types';
import type { PartObservation } from './ObservationsEditor';
import './official-parts.css';

const states: { code: ClassState | ''; label: string; icon: typeof FiCheck }[] = [
  { code: 'N', label: 'Normal', icon: FiCheck }, { code: 'T', label: 'Tardanza', icon: FiClock }, { code: 'SD', label: 'Sin docente', icon: FiUserX },
  { code: 'RN', label: 'Reemplazo normal', icon: FiRepeat }, { code: 'RE', label: 'Emergencia', icon: FiAlertTriangle }, { code: '', label: 'Sin registrar', icon: FiPlus },
];
const noteLabels = { TEACHER: 'Docente', STUDENT: 'Alumno', CLASSROOM: 'Aula' };
const noteIcons = { TEACHER: FiUser, STUDENT: FiUsers, CLASSROOM: FiGrid };
const initials = (text: string) => text.split(/\s+/).slice(0, 2).map(word => word[0] ?? '').join('').toUpperCase();
const courses:Record<string,{code:string;tone:number}>={'Razonamiento matemático':{code:'RM',tone:0},'Biología':{code:'BIO',tone:1},'Matemática':{code:'MAT',tone:2},'Filosofía':{code:'FIL',tone:3}};
const avatarTone=(name:string)=>[...name].reduce((hash,char)=>(hash+char.charCodeAt(0))%4,0);
const missingFields=(record:PartRecord,now:number)=>{
  if(record.deletedAt||record.teachingStatus==='NOT_TAUGHT')return [];
  const start=now>=Date.parse(record.scheduledStart),end=now>=Date.parse(record.scheduledEnd);
  return [start&&!record.actualStart?'start':'',start&&!record.classState&&!record.coverages.some(c=>c.kind==='TEACHER'&&c.status==='PENDING')?'state':'',end&&!record.actualEnd?'end':'',start&&!record.initialFileId?'initial':'',end&&!record.finalFileId?'final':''].filter(Boolean);
};
const noteTime = (note: PartObservation) => note.createdAt ? limaTime(note.createdAt) : 'Fecha no disponible';
const notesOf = (row: PartRecord) => [...(row.structuredObservations ?? [])].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || a.id.localeCompare(b.id));

/** Native popover stays above a modal; CSS anchors handle edges without a global tooltip engine. */
function Help({ text, children }: { text: string; children: ReactNode }) {
  const id = useId().replaceAll(':', '');
  const tip = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hide = () => { clearTimeout(timer.current); tip.current?.hidePopover(); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return <span className="part-help" onMouseEnter={() => { clearTimeout(timer.current); timer.current = setTimeout(() => tip.current?.showPopover(), 480); }} onMouseLeave={() => { clearTimeout(timer.current); timer.current=setTimeout(hide,150); }} onFocus={() => { timer.current = setTimeout(() => tip.current?.showPopover(), 350); }} onBlur={hide} onKeyDown={event => { if (event.key === 'Escape' && tip.current?.matches(':popover-open')) { hide(); event.stopPropagation(); } }}>
    <button type="button" className="part-help-trigger" aria-label={text} aria-describedby={id} style={{ anchorName: `--${id}` } as CSSProperties} onClick={() => { if (tip.current?.matches(':popover-open')) hide(); else tip.current?.showPopover(); }}>{children}</button>
    <span id={id} ref={tip} role="tooltip" popover="auto" className="part-tooltip" style={{ positionAnchor: `--${id}` } as CSSProperties} onMouseEnter={() => clearTimeout(timer.current)}>{text}</span>
  </span>;
}

function NotesComposer({ value, disabled, onChange, entry, setEntry }: { value: PartObservation[]; disabled: boolean; onChange: (notes: PartObservation[]) => void; entry:PartObservation|null; setEntry:(entry:PartObservation|null)=>void }) {
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const confirm = () => {
    if (!entry || entry.description.trim().length < 3 || (entry.target === 'STUDENT' && (!entry.firstName?.trim() || !entry.lastName?.trim()))) { setError('Completa la descripción y los nombres y apellidos del alumno.'); return; }
    onChange(value.some(note => note.id === entry.id) ? value.map(note => note.id === entry.id ? entry : note) : [...value, entry]);
    setEntry(null); setError(''); setFeedback('Observación lista para guardar.');
  };
  return <div className="part-notes-editor">
    <div className="part-notes-toolbar"><span>{value.length} observaciones</span><small>Recientes primero</small><button className="part-icon-button" aria-label="Añadir observación" disabled={disabled || value.length >= 20} onClick={() => { setEntry({ id: crypto.randomUUID(), target: 'TEACHER', description: '' }); setError(''); }}><FiPlus /></button></div>
    {entry && <fieldset className="part-composer" disabled={disabled}>
      <legend className="sr-only">Compositor de observación</legend>
      <div className="part-type-switch">{(['TEACHER', 'STUDENT', 'CLASSROOM'] as const).map(target => { const Icon = noteIcons[target]; return <label key={target}><input type="radio" name="part-note-type" checked={entry.target === target} onChange={() => setEntry({ ...entry, target })} /><span><Icon />{noteLabels[target]}</span></label>; })}</div>
      {entry.target === 'STUDENT' && <div className="part-student-names"><label>Nombres<input value={entry.firstName ?? ''} maxLength={128} onChange={event => setEntry({ ...entry, firstName: event.target.value })} /></label><label>Apellidos<input value={entry.lastName ?? ''} maxLength={128} onChange={event => setEntry({ ...entry, lastName: event.target.value })} /></label></div>}
      <label className="sr-only" htmlFor="part-note-description">Descripción de la observación</label><textarea id="part-note-description" maxLength={2000} value={entry.description} onChange={event => setEntry({ ...entry, description: event.target.value })} />
      {error && <p role="alert">{error}</p>}
      <div className="part-composer-actions"><button className="part-icon-button" aria-label="Cancelar composición" onClick={() => setEntry(null)}><FiX /></button><button className="part-icon-button primary" aria-label="Confirmar observación en el borrador" onClick={confirm}><FiCheck /></button></div>
    </fieldset>}
    <div className="part-notes-list">{[...value].sort((a,b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).map(note => { const Icon = noteIcons[note.target]; return <article key={note.id} className="part-note-card">
      <span className={`part-note-type ${note.target.toLowerCase()}`}><Icon /></span><div className="part-note-copy"><div><strong>{note.target === 'STUDENT' ? `${note.firstName ?? ''} ${note.lastName ?? ''}` : noteLabels[note.target]}</strong><time>{noteTime(note)}</time></div><p>{note.description}</p></div>
      <div className="part-note-actions"><button className="part-icon-button" aria-label="Editar observación" disabled={disabled} onClick={() => { setEntry({ ...note }); setError(''); }}><FiEdit2 /></button><button className="part-icon-button" aria-label="Quitar observación del borrador" disabled={disabled} onClick={() => { onChange(value.filter(item => item.id !== note.id)); setFeedback('Observación quitada del borrador. Guarda para aplicar.'); }}><FiTrash2 /></button></div>
    </article>; })}{!value.length && <p className="part-notes-empty">Sin observaciones</p>}</div>
    {feedback && <p className="part-local-feedback" role="status">{feedback}</p>}
    {entry && <p className="part-local-feedback">Confirma o cancela el compositor antes de guardar las observaciones del bloque.</p>}
    <input type="hidden" data-composer-pending={Boolean(entry)} />
  </div>;
}

function CaptureEditor({ p, slot, onZoom }: { p: PartsViewProps; slot: Slot; onZoom: (id: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const local = p.captureDrafts[slot];
  const row = p.selected;
  const fileId = row ? slot === 'initial' ? row.initialFileId : row.finalFileId : null;
  useEffect(() => {
    if (!local?.file) { setPreview(''); return; }
    const url = URL.createObjectURL(local.file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [local?.file]);
  const image = local?.remove ? '' : preview || (fileId ? p.thumbnails[fileId] || p.images[fileId] : '');
  const prepare = async (file?: File) => {
    if (!file || !p.writable || p.busy) return;
    try {
      if (file.size > 10 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.png') || (file.type && file.type !== 'image/png')) throw new Error('Selecciona un PNG de hasta 10 MiB.');
      const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (signature.join(',') !== '137,80,78,71,13,10,26,10') throw new Error('El archivo no tiene firma PNG.');
      const bitmap = await createImageBitmap(file);
      const valid = bitmap.width <= 4096 && bitmap.height <= 4096; bitmap.close();
      if (!valid) throw new Error('La imagen debe tener como máximo 4096 px por eje.');
      p.onPrepareCapture(slot, file); setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo decodificar el PNG.'); }
  };
  return <div>
    <div className={`part-capture-stage ${dragging ? 'dragover' : ''}`} onDragOver={event => { event.preventDefault(); if (p.writable) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void prepare(event.dataTransfer.files[0]); }}>
      {image ? <><img src={image} alt="Captura preparada" /><div className="part-stage-actions">{!local?.file && fileId && <button className="part-icon-button" aria-label="Ampliar captura" onClick={() => onZoom(fileId)}><FiMaximize /></button>}<button className="part-icon-button" aria-label="Quitar captura del borrador" disabled={!p.writable || p.busy} onClick={() => p.onPrepareCapture(slot, null)}><FiTrash2 /></button><button className="part-icon-button" aria-label="Elegir otra captura" disabled={!p.writable || p.busy} onClick={() => input.current?.click()}><FiEdit2 /></button></div></> : <button className="part-dropzone" disabled={!p.writable || p.busy} onClick={() => input.current?.click()}><span><FiArrowUp /></span><strong>Arrastra una captura aquí</strong><span>o haz clic para elegir un PNG</span><small>Hasta 10 MiB · 4096 px por eje</small></button>}
      <input ref={input} type="file" accept="image/png,.png" className="sr-only" aria-label="Seleccionar captura PNG" disabled={!p.writable || p.busy} onChange={event => { void prepare(event.target.files?.[0]); event.target.value = ''; }} />
    </div>
    <div className="part-capture-meta"><span className={`part-capture-status ${local?.remove ? 'removing' : local?.file ? 'pending' : fileId ? 'associated' : 'empty'}`}>{local?.remove ? 'Se quitará al guardar' : local?.file ? p.pendingFiles[slot] ? 'Subida, sin asociar' : 'Preparada, sin asociar' : fileId ? 'Asociada' : 'Sin captura'}</span><span>{local?.file?.name ?? ''}</span></div>
    {error && <p role="alert" className="part-editor-error">{error}</p>}
  </div>;
}

export function OfficialPartsSheet({ p, onMore, onFollowup, onTools }: { p: PartsViewProps; onMore: (id: number) => void; onFollowup: () => void; onTools: () => void }) {
  const [editor, setEditor] = useState<PartEditor | Slot | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const [fullSize, setFullSize] = useState(false);
  const [timeline, setTimeline] = useState<{ top: number; height: number; progress: number; id: number }[]>([]);
  const scroll = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const sheet = p.sheet;
  const row = p.selected;
  const draft = p.draft;
  const first = p.rows[0];
  const pending=p.rows.filter(record=>missingFields(record,p.serverNow).length).length;
  const day=sheet?.selection.date??p.filters.from;
  const dateLabel=new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',weekday:'long',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${day}T12:00:00Z`)).replaceAll(',','').replaceAll(' de ',' ').replace('.','');
  const { rows, serverNow, onVisibleCaptures } = p;
  const name = first?.effectiveSnapshot.MONITOR?.name || first?.snapshot.monitor?.name || first?.snapshot.monitor?.email || 'Sin monitor';
  const open = (event: React.MouseEvent<HTMLElement>, record: PartRecord, next: PartEditor | Slot) => {
    p.onSelect(record.id, false);
    if (p.selected?.id !== record.id && (p.dirty || p.reviewDirty || Object.keys(p.pendingFiles).length || Object.keys(p.captureDrafts).length)) return;
    trigger.current = event.currentTarget; setEditor(next);
  };
  const close = () => { if (!p.busy) { setEditor(null); requestAnimationFrame(() => trigger.current?.isConnected && trigger.current.focus()); } };
  const onZoom = (id: string) => { p.onLoadImage(id); setZoom(id); setFullSize(false); };
  useEffect(() => {
    const region = scroll.current;
    if (!region) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = region.getBoundingClientRect();
        const visible = [...region.querySelectorAll<HTMLElement>('[data-capture-ref]')].filter(element => { const box = element.getBoundingClientRect(); return box.bottom >= bounds.top - 70 && box.top <= bounds.bottom + 70 && box.right >= bounds.left - 120 && box.left <= bounds.right + 120; }).map(element => element.dataset.captureRef!);
        onVisibleCaptures(visible);
        setTimeline([...region.querySelectorAll<HTMLElement>('tr[data-record]')].map(element => { const record = rows.find(item => String(item.id) === element.dataset.record)!; const box = element.getBoundingClientRect(); return { id: record.id, top: box.top - bounds.top, height: box.height, progress: Math.min(1, Math.max(0, (serverNow - Date.parse(record.scheduledStart)) / (Date.parse(record.scheduledEnd) - Date.parse(record.scheduledStart)))) }; }));
      });
    };
    const observer = new ResizeObserver(update); observer.observe(region); if (board.current) observer.observe(board.current);
    region.addEventListener('scroll', update, { passive: true }); update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); region.removeEventListener('scroll', update); };
  }, [rows, serverNow, onVisibleCaptures]);
  const activeEditor = editor && editor !== 'initial' && editor !== 'final' ? editor : null;
  const changed = !!(row && draft && activeEditor && JSON.stringify({...editorDraft(row, draft, activeEditor),reason:''}) !== JSON.stringify(toDraft(row)));
  const captureChanged = editor === 'initial' || editor === 'final' ? Boolean(p.captureDrafts[editor]) : false;
  const validHours = !draft?.actualStart || !draft.actualEnd || draft.actualEnd >= draft.actualStart;
  const selectedState = states.find(state => state.code === draft?.classState);
  const coverage = row?.coverages.find(item => item.kind === 'TEACHER' && ['PENDING', 'AUTHORIZED'].includes(item.status));
  return <div className="official-parts">
    <div className="part-heading"><h1>Parte diario</h1><div className="part-heading-status"><span className="part-status-stack">{!!pending && <span className="part-alert-chip" aria-label={`${pending} partes pendientes`}><FiAlertTriangle />{pending}</span>}<time className="part-now-chip"><i />{new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(p.serverNow)}<small>Lima</small></time></span><button className="part-icon-button" aria-label="Más opciones de Partes" onClick={onTools}><FiMoreHorizontal /></button></div></div>
    <div className="part-context-bar">
      <label className="part-context-item date"><span className="part-context-icon"><FiCalendar /></span><b>{dateLabel.charAt(0).toUpperCase()+dateLabel.slice(1)}</b><input type="date" aria-label="Fecha de la jornada" value={day} disabled={p.busy} onChange={event => p.onSheet({ date: event.target.value, classId: sheet?.selection.classId ?? undefined, shiftId: sheet?.selection.shiftId ?? undefined })} /></label>
      <label className="part-context-item room"><span className="part-context-icon"><FiGrid /></span>{(sheet?.options.classes.length ?? 0) > 1 ? <select aria-label="Aula de la jornada" value={sheet?.selection.classId ?? ''} disabled={p.busy} onChange={event => { const clas = sheet?.options.classes.find(item => item.id === event.target.value); p.onSheet({ date: sheet!.selection.date, classId: clas?.id, shiftId: clas?.shiftId }); }}>{sheet?.options.classes.map(clas => <option key={clas.id} value={clas.id}>{clas.name}</option>)}</select> : <b>{sheet?.options.classes.find(clas => clas.id === sheet.selection.classId)?.name ?? first?.snapshot.className ?? 'Sin aula'}</b>}</label>
      <span className="part-context-item shift"><span className="part-context-icon"><FiClock /></span><b>{first?.snapshot.shift ?? sheet?.options.shifts.find(shift => shift.id === sheet.selection.shiftId)?.name ?? 'Sin turno'}</b></span>
      <span className="part-context-item monitor"><span className="part-context-icon"><FiUser /></span><span>Monitor ·</span><b>{name}</b>{sheet?.policy.canFollowMonitor && <button className="part-icon-button" aria-label="Seguimiento del monitor" onClick={onFollowup}><FiMoreHorizontal /></button>}</span>
    </div>
    {p.error && <p className="part-editor-error" role="alert">{p.error}</p>}
    {p.notice && <p className="part-local-feedback" role="status">{p.notice}</p>}
    <div className="part-workspace">
      <div className="part-timeline" aria-label="Progreso de la jornada"><span className="part-timeline-head"><Help text="Hora de Lima; el punto indica el bloque actual"><FiClock /></Help></span>{timeline.map(item => <div key={item.id} className={`part-timeline-segment ${item.progress >= 1 ? 'past' : item.progress > 0 ? 'current' : 'future'}`} style={{ top: Math.max(54, item.top), height: Math.max(0, item.height - 6 - Math.max(0, 54 - item.top)) }} title={`Bloque ${p.rows.find(row => row.id === item.id)?.period}`}>{item.progress > 0 && item.progress < 1 && <i style={{ top: `${item.progress * 100}%` }} />}</div>)}</div>
      <div className="part-board" ref={board}><div className="part-board-scroll" ref={scroll} tabIndex={0} role="region" aria-label="Parte diario con desplazamiento horizontal">
        <table className={`part-official-table ${p.rows.length <= 7 ? 'normal-day' : ''}`} style={{'--part-rows':p.rows.length || 1} as CSSProperties}><caption className="sr-only">Parte diario. Horas de Lima. Abrir una celda no modifica ni revisa el registro.</caption><colgroup>{[4, 8, 8.5, 14, 16.5, 15, 20, 7, 7].map((width,index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
          <thead><tr><th rowSpan={2} scope="col">#</th><th rowSpan={2} scope="col">Programado <Help text="Intervalo programado del bloque"><FiInfo /></Help></th><th rowSpan={2} scope="col">Hora real <Help text="Inicio y fin declarados; no se copian del horario"><FiInfo /></Help></th><th rowSpan={2} scope="col">Curso</th><th rowSpan={2} scope="col">Docente</th><th rowSpan={2} scope="col">Estado <Help text="Declaración del bloque; una propuesta no es autorización ni ejecución"><FiInfo /></Help></th><th rowSpan={2} scope="col">Observaciones <Help text="Notas de clase; el seguimiento privado del monitor está fuera de esta tabla"><FiInfo /></Help></th><th colSpan={2} scope="colgroup">Capturas <Help text="Miniaturas privadas; el original solo se descarga al ampliar"><FiInfo /></Help></th></tr><tr><th scope="col">Inicio</th><th scope="col">Fin</th></tr></thead>
          <tbody>{p.rows.map(record => {
            const current = p.serverNow >= Date.parse(record.scheduledStart) && p.serverNow < Date.parse(record.scheduledEnd);
            const dueStart = p.serverNow >= Date.parse(record.scheduledStart), dueEnd = p.serverNow >= Date.parse(record.scheduledEnd);
            const replacement = record.coverages.find(item => item.kind === 'TEACHER' && ['PENDING', 'AUTHORIZED'].includes(item.status));
            const notes = notesOf(record), state = states.find(state => state.code === (record.classState || (replacement?.status==='PENDING' ? replacement.mode==='EMERGENCY'?'RE':'RN' : '')))!, StateIcon = !state.code&&dueStart?FiAlertTriangle:state.icon;
            const course=courses[record.snapshot.course??'']??{code:initials(record.snapshot.course||'Curso'),tone:record.courseId%4};
            return <tr key={record.id} data-record={record.id} className={`${current ? 'current' : ''} ${record.deletedAt ? 'deleted' : ''}`}>
              <td><div className="part-num-cell"><button className="part-row-num" aria-label={`Opciones del parte #${record.id}`} onClick={() => onMore(record.id)}>{record.period}</button>{!!missingFields(record,p.serverNow).length && <FiAlertTriangle className="part-alert-icon" />}</div></td>
              <td><span className="part-time soft">{limaTime(record.scheduledStart)} <span>–</span> {limaTime(record.scheduledEnd)}</span></td>
              <td><button className="part-cell-button" aria-label={`Editar hora real del parte #${record.id}`} disabled={p.busy} onClick={event => open(event, record, 'hours')}><span className="part-time"><span className={dueStart && !record.actualStart ? 'missing' : ''}>{limaTime(record.actualStart) || '--:--'}</span><span>–</span><span className={dueEnd && !record.actualEnd ? 'missing' : ''}>{limaTime(record.actualEnd) || '--:--'}</span>{((dueStart&&!record.actualStart)||(dueEnd&&!record.actualEnd))&&<FiAlertTriangle className="part-alert-icon"/>}</span><FiEdit2 className="part-cell-pencil" /></button></td>
              <td><div className="part-course"><span className={`part-code tone-${course.tone}`}>{course.code}</span><span>{record.snapshot.course || 'Curso sin nombre'}</span></div></td>
              <td><div className="part-person"><span className={`part-code tone-${avatarTone(record.snapshot.teacher?.name||'')}`}>{initials(record.snapshot.teacher?.name || 'Sin asignar')}</span><div><strong title={record.snapshot.teacher?.name}>{record.snapshot.teacher?.name || 'Sin asignar'}</strong><span title={record.snapshot.teacher?.email}>{record.snapshot.teacher?.email}</span></div></div></td>
              <td><button className="part-cell-button" aria-label={`Editar estado del parte #${record.id}`} disabled={p.busy} onClick={event => open(event, record, 'state')}><span className="part-state-stack"><span className={`part-pill ${state.code.toLowerCase() || 'empty'} ${!state.code && dueStart ? 'due' : ''}`}><StateIcon />{state.label}</span>{replacement && <span className="part-replacement"><span>{replacement.personSnapshot.email}</span>{replacement.status === 'PENDING' ? <FiClock aria-label="Propuesta pendiente" /> : <FiCheck aria-label="Cobertura autorizada" />}</span>}</span><FiEdit2 className="part-cell-pencil" /></button></td>
              <td><button className="part-cell-button" aria-label={`Editar observaciones del parte #${record.id}`} disabled={p.busy} onClick={event => open(event, record, 'observations')}><span className="part-mini-notes">{notes.length ? notes.slice(0,2).map(note => { const Icon = noteIcons[note.target]; return <span key={note.id} className={`part-mini-note ${note.target.toLowerCase()}`}><Icon /><span>{note.description}</span></span>; }) : <span className="part-notes-plus"><FiPlus /></span>}{notes.length > 2 && <small>+{notes.length - 2} más</small>}</span><FiEdit2 className="part-cell-pencil" /></button></td>
              {(['initial', 'final'] as const).map(slot => { const id = slot === 'initial' ? record.initialFileId : record.finalFileId; const due = slot === 'initial' ? dueStart : dueEnd; return <td key={slot} className="part-cap-cell" data-capture-ref={`${record.id}:${slot}`}><div className="part-cap-wrap">{id ? <><button className="part-thumb" aria-label={`Ampliar captura de ${slot === 'initial' ? 'inicio' : 'fin'} del parte #${record.id}`} onClick={() => onZoom(id)}>{p.thumbnails[id] ? <img src={p.thumbnails[id]} alt="Captura de clase" /> : <FiImage />}<span><FiMaximize /></span></button><button className="part-thumb-edit" aria-label={`Editar captura de ${slot === 'initial' ? 'inicio' : 'fin'} del parte #${record.id}`} onClick={event => open(event, record, slot)}><FiEdit2 /></button></> : <button className={`part-empty-cap ${due ? 'due' : ''}`} aria-label={`Editar captura de ${slot === 'initial' ? 'inicio' : 'fin'} del parte #${record.id}`} onClick={event => open(event, record, slot)}>{due ? <FiAlertTriangle /> : <FiImage />}</button>}</div></td>; })}
            </tr>;
          })}</tbody>
        </table>
        {!p.rows.length && <p className="part-empty">{p.loading ? 'Cargando jornada…' : 'No hay partes para esta jornada.'}</p>}
      </div></div>
    </div>
    <div className="part-board-foot"><span>Línea de tiempo · horas de Lima</span></div>
    <Dialog className="parts-editor" open={!!editor && !!row} onClose={close} title={editor === 'hours' ? 'Hora real' : editor === 'state' ? 'Estado' : editor === 'observations' ? 'Observaciones' : `Captura de ${editor === 'initial' ? 'inicio' : 'fin'}`} description={row ? `${row.snapshot.course ?? 'Clase'} · ${row.period}º bloque · ${limaTime(row.scheduledStart)} – ${limaTime(row.scheduledEnd)}` : undefined} footer={<><Button variant="secondary" disabled={p.busy} onClick={() => { if (activeEditor) p.onDiscardEditor(activeEditor); else if (editor) p.onDiscardCapture(editor as Slot); close(); }}>Descartar</Button><Button disabled={p.busy || !p.writable || p.conflict || !(changed || captureChanged) || (p.requiresReason && (draft?.reason.trim().length ?? 0) < 3) || (editor === 'hours' && !validHours)} onClick={async () => { if (document.querySelector('.parts-editor [data-composer-pending="true"]')) return; const ok = activeEditor ? await p.onSave(activeEditor) : await p.onSaveCapture(editor as Slot); if (ok) close(); }}>Guardar</Button></>}>
      {p.error && <p className="part-editor-error" role="alert">{p.error}</p>}
      {row && draft && <fieldset className="part-editor-body" disabled={p.busy || !p.writable}>
        {editor === 'hours' && <><div className="part-time-grid"><label>Inicio<input type="time" step={60} value={draft.actualStart} onChange={event => p.onDraft({ actualStart: event.target.value })} /></label><label>Fin<input type="time" step={60} value={draft.actualEnd} onChange={event => p.onDraft({ actualEnd: event.target.value })} /></label></div><p className="part-scheduled-line"><FiClock />Programado: {limaTime(row.scheduledStart)} – {limaTime(row.scheduledEnd)}</p>{!validHours && <p role="alert" className="part-editor-error">El fin no puede ser anterior al inicio.</p>}</>}
        {editor === 'state' && <><div className="part-state-grid">{states.map(state => { const Icon = state.icon; return <label key={state.code} className={`part-state-option ${state.code.toLowerCase() || 'empty'}`}><input type="radio" name="part-class-state" checked={draft.classState === state.code} onChange={() => p.onDraft({ classState: state.code })} /><span><i><Icon /></i><strong>{state.label}</strong><small>{state.code || '—'}</small></span></label>; })}</div>{['RN','RE'].includes(draft.classState) && <div className="part-replace-panel"><label>Correo del docente reemplazante<input type="email" maxLength={254} placeholder="docente@correo.edu" value={draft.replacementEmail || coverage?.personSnapshot.email || ''} onChange={event => p.onDraft({ replacementEmail: event.target.value })} /></label><p>{coverage && !draft.replacementEmail ? coverage.status === 'PENDING' ? 'Propuesta pendiente de autorización administrativa' : 'Cobertura autorizada; la ejecución se registra por separado' : 'Se registrará una propuesta pendiente, sin autorizar ni confirmar el dictado.'}</p></div>}<span className="sr-only">{selectedState?.label}</span></>}
        {editor === 'observations' && <NotesComposer key={row.id} value={draft.structuredObservations} entry={p.noteComposer} setEntry={p.onNoteComposer} disabled={p.busy || !p.writable} onChange={structuredObservations => p.onDraft({ structuredObservations })} />}
        {(editor === 'initial' || editor === 'final') && <CaptureEditor p={p} slot={editor} onZoom={onZoom} />}
        {p.requiresReason && <label className="part-reason">Motivo de esta operación<textarea required minLength={3} maxLength={2000} value={draft.reason} onChange={event => p.onDraft({ reason: event.target.value })} /></label>}
      </fieldset>}
      {!p.writable && <p className="part-local-feedback">{p.writeLimit} El borrador se conserva; puedes cerrarlo y volver o descartarlo explícitamente.</p>}
      {p.conflict && <p role="alert" className="part-editor-error">Hay otra versión en el servidor. Tu borrador se conserva; revisa el conflicto en Más opciones.</p>}
    </Dialog>
    <Dialog className="parts-editor part-preview-dialog" open={!!zoom} title="Captura completa" onClose={() => setZoom(null)} footer={<><Button variant="secondary" onClick={() => setFullSize(!fullSize)}>{fullSize ? 'Ajustar a pantalla' : 'Zoom 100 %'}</Button><Button onClick={() => setZoom(null)}>Cerrar ampliación</Button></>}><div className={`part-preview ${fullSize ? 'full' : ''}`} tabIndex={0} role="region" aria-label="Imagen íntegra con desplazamiento">{zoom && p.images[zoom] ? <img src={p.images[zoom]} alt="Captura completa sin recorte" /> : <p role="status">Cargando imagen…</p>}</div></Dialog>
  </div>;
}
