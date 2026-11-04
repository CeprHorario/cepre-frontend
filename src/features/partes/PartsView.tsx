import { useEffect, useId, useState, type ReactNode } from "react";
import { OfficialPartsSheet } from './OfficialPartsSheet';
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Overlay";
import { academicDate, limaDate, limaTime, toDraft } from "./model";
import type { ClassState, Operation, OperationDraft, PartFilters, PartRecord, PartsViewProps, PersonKind, RecordDraft, Slot } from "./types";
import "./partes.css";

const CLASS_STATES: Record<ClassState, string> = {N:'N · Normal',T:'T · Tardanza',SD:'SD · Sin docente',RN:'RN · Reemplazo normal',RE:'RE · Reemplazo de emergencia'};
const TEACHING: Record<PartRecord["teachingStatus"], string> = {
  UNCONFIRMED: "Por confirmar", TAUGHT: "Dictada", NOT_TAUGHT: "No dictada", INTERRUPTED: "Interrumpida",
};
const TITULAR: Record<PartRecord["titularOutcome"], string> = {
  UNKNOWN: "Por confirmar", PRESENT: "Presente", ABSENT: "Ausente", PLANNED_REPLACEMENT: "Reemplazo previsto",
};
const REVIEW = { PENDING: "Pendiente de revisión", CONFORMING: "Conforme", OBSERVED: "Observado" };
const COVERAGE = { PENDING: "Pendiente", AUTHORIZED: "Autorizado", REJECTED: "Rechazado", REVOKED: "Revocado" };
const OPERATIONS: Record<Operation, string> = {
  replacement: "Registrar reemplazo / emergencia", resolve: "Resolver cobertura", grant: "Habilitar edición temporal",
  revoke: "Revocar habilitación", cancel: "Anular partes", restore: "Restaurar partes", recovery: "Crear recuperación", configuration: "Configuración operativa",
};
const LABELS: Record<string, string> = {
  id: "ID", version: "Versión", date: "Fecha", action: "Acción", reason: "Motivo", actor: "Responsable",
  actualStart: "Inicio real", actualEnd: "Fin real", teachingStatus: "Dictado", titularOutcome: "Condición del titular",
   effectiveTeacherId: "Docente efectivo", effectiveMonitorId: "Monitor efectivo", incidents: "Observaciones", structuredObservations: "Observaciones clasificadas", classState: "Estado del parte",
   target: "Tipo", description: "Observación", firstName: "Nombres", lastName: "Apellidos",
  initialFileId: "Captura inicial", finalFileId: "Captura final", initialAssociatedAt: "Asociación inicial", finalAssociatedAt: "Asociación final",
  createdAt: "Creado", updatedAt: "Actualizado", deletedAt: "Anulado", deletionReason: "Motivo de anulación",
  scheduledStart: "Inicio programado", scheduledEnd: "Fin programado", editDeadline: "Cierre de edición",
  className: "Aula", course: "Curso", teacher: "Docente", monitor: "Monitor", name: "Nombre", email: "Correo",
  snapshot: "Datos de programación", effectiveSnapshot: "Personas efectivas", classId: "Aula", hourSessionId: "Período horario", shiftId: "Turno", courseId: "Curso", areaId: "Área",
  titularTeacherId: "Docente titular", titularMonitorId: "Monitor titular", monitorAccountId: "Cuenta del monitor", supervisorId: "Supervisor",
  uploadedAt: "Subida del archivo", associatedAt: "Asociación al parte",
  recordId: "Parte", recordVersion: "Versión revisada", personSnapshot: "Persona reemplazante", requestedBy: "Solicitado por", requestedAt: "Solicitud", resolvedBy: "Resuelto por", resolvedAt: "Resolución",
  kind: "Tipo", mode: "Modalidad", status: "Estado", accountId: "Cuenta", expiresAt: "Vencimiento", revokedAt: "Revocación", grantedBy: "Habilitado por",
  enabled: "Habilitado", startsOn: "Fecha de inicio", endsOn: "Fecha de fin", latenessToleranceMinutes: "Tolerancia de tardanza (minutos)", replacementWaitMinutes: "Espera de reemplazo (minutos)", alertThresholdMinutes: "Umbral de alerta (minutos)", continuityGapMinutes: "Separación de continuidad (minutos)",
  class_id: "ID de aula", hour_session_id: "ID de período", shift_id: "ID de turno", course_id: "ID de curso", area_id: "ID de área",
  scheduled_start: "Inicio programado", scheduled_end: "Fin programado", actual_start: "Inicio real", actual_end: "Fin real",
  teaching_status: "Dictado", titular_outcome: "Condición del titular", titular_teacher_id: "ID docente titular",
  effective_teacher_id: "ID docente efectivo", titular_monitor_id: "ID monitor titular", effective_monitor_id: "ID monitor efectivo",
  monitor_account_id: "Cuenta del monitor", supervisor_id: "ID supervisor", pedagogical_minutes: "Minutos pedagógicos",
  class_name: "Aula", course_name: "Curso", shift_name: "Turno", area_name: "Área", period: "Período", origin: "Origen",
  teacher_replacement_authorization: "Autorización de reemplazo docente", monitor_replacement_authorization: "Autorización de reemplazo de monitor",
  titular_absent: "Titular ausente", timing_kind: "Tipo de control", timing_classification: "Clasificación horaria",
  scheduled_minutes: "Minutos programados", actual_minutes: "Minutos reales", actual_clock_hours: "Horas reloj reales",
  completeness: "Integridad", review_status: "Revisión", deleted_at: "Anulado", original_record_id: "Parte de origen",
  records: "Partes", absent_blocks: "Bloques con titular ausente", absent_teacher_days: "Días-docente de ausencia",
  authorized_replacement_blocks: "Bloques con reemplazo autorizado", executed_replacement_blocks: "Bloques con reemplazo ejecutado",
  pending_replacement_blocks: "Bloques con reemplazo pendiente", late_arrivals: "Llegadas tardías", late_resumptions: "Reanudaciones tardías",
  incident_records: "Partes con observaciones", incomplete_records: "Partes incompletos", pending_reviews: "Revisiones pendientes",
};
const VALUES: Record<string, string> = {
  ...TEACHING, ...TITULAR, ...COVERAGE, ...REVIEW, ...CLASS_STATES, STUDENT: "Alumno", CLASSROOM: "Aula", REGULAR: "Regular", RECOVERY: "Recuperación",
  COMPLETE: "Completo", INCOMPLETE: "Incompleto", ARRIVAL: "Llegada", RESUMPTION: "Reanudación",
  LATE: "Tardía", ON_TIME: "A tiempo", PLANNED: "Previsto", EMERGENCY: "Emergencia", TEACHER: "Docente", MONITOR: "Monitor",
  MATERIALIZED: "Parte generado", UPDATE: "Registro actualizado", ADMIN_CORRECTION: "Corrección administrativa",
  CANCEL: "Anulación", RESTORE: "Restauración", REVIEW: "Revisión registrada", FILE_ASSOCIATED: "Captura asociada",
  NO_START_CONFIRMATION: "Inicio sin confirmar", ALERT_CREATED: "Alerta generada", ALERT_ACKNOWLEDGED: "Acuse de alerta",
};

function date(value: string | null | undefined) {
  return value ? academicDate(value).split("-").reverse().join("/") : "—";
}
function instant(value: string | null | undefined) {
  if (!value) return "—";
  const day = limaDate(new Date(value));
  return `${date(day)} ${limaTime(value)} (Lima)`;
}
function Control({ label, children, hint, required }: { label: string; children: (id: string, describedBy?: string) => ReactNode; hint?: ReactNode; required?: boolean }) {
  return <Field label={label} hint={hint} required={required}>{({ id, describedBy }) => children(id, describedBy)}</Field>;
}
function Pagination({ page, hasNext, disabled, onPage, label }: { page: number; hasNext: boolean; disabled: boolean; onPage: (page: number) => void; label: string }) {
  return <nav className="parts-pagination" aria-label={label}>
    <Button size="sm" variant="secondary" disabled={disabled || page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button>
    <span>Página {page}</span>
    <Button size="sm" variant="secondary" disabled={disabled || !hasNext} onClick={() => onPage(page + 1)}>Siguiente</Button>
  </nav>;
}

function Filters({ p }: { p: PartsViewProps }) {
  const change = (patch: Partial<PartFilters>) => p.onFilters({ ...p.filters, ...patch, page: 1 });
  const choices = (key: "classId" | "teacherId" | "monitorId" | "courseId" | "shiftId") => {
    const entries = new Map<string, string>();
    if (key === "classId" && p.role === "administrador") p.classrooms.forEach(room => entries.set(room.id, room.name));
    p.rows.forEach(row => {
      if (key === "classId" && !entries.has(row.classId)) entries.set(row.classId, row.snapshot.className);
      if (key === "courseId") entries.set(String(row.courseId), row.snapshot.course || `Curso ${row.courseId}`);
      if (key === "shiftId") entries.set(String(row.shiftId), row.snapshot.shift || `Turno ${row.shiftId}`);
      if (key === "teacherId") {
        if (row.snapshot.teacher) entries.set(row.snapshot.teacher.id, row.snapshot.teacher.name || row.snapshot.teacher.email);
        if (row.effectiveSnapshot.TEACHER) entries.set(row.effectiveSnapshot.TEACHER.id, row.effectiveSnapshot.TEACHER.name || row.effectiveSnapshot.TEACHER.email);
      }
      if (key === "monitorId" && row.snapshot.monitor) entries.set(row.snapshot.monitor.id, row.snapshot.monitor.name || row.snapshot.monitor.email);
    });
    const current = p.filters[key];
    if (current && !entries.has(String(current))) entries.set(String(current), `Seleccionado: ${current}`);
    return [...entries].map(([value, label]) => <option key={value} value={value}>{label}</option>);
  };
  return <details className="parts-section parts-filters">
    <summary>Filtros de la jornada</summary>
    <fieldset disabled={p.busy || p.loading} className="parts-grid">
      <Control label="Desde">{id => <Input id={id} type="date" disabled={p.role === 'monitor'} value={p.filters.from} onChange={e => change({ from: e.target.value })} />}</Control>
      <Control label="Hasta">{id => <Input id={id} type="date" disabled={p.role === 'monitor'} value={p.filters.to} onChange={e => change({ to: e.target.value })} />}</Control>
      {([['classId', 'Aula'], ['teacherId', 'Docente'], ['monitorId', 'Monitor'], ['courseId', 'Curso'], ['shiftId', 'Turno']] as const).map(([key, label]) =>
        <Control key={key} label={label}>{id => <Select id={id} disabled={p.role === 'monitor' && (key === 'classId' || key === 'shiftId')} value={p.filters[key] ?? ""} onChange={e => change({ [key]: e.target.value ? (key === "courseId" || key === "shiftId" ? Number(e.target.value) : e.target.value) : undefined })}>
          <option value="">Todos</option>{choices(key)}
        </Select>}</Control>)}
      {p.role !== 'monitor' && <Control label="Filas por página">{id => <Select id={id} value={p.filters.limit} onChange={e => change({ limit: Number(e.target.value) })}>{[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}</Select>}</Control>}
      <Checkbox label="Solo pendientes de revisión" checked={p.filters.pendingReview ?? false} onChange={e => change({ pendingReview: e.target.checked })} />
      {p.role === "administrador" && <Checkbox label="Incluir anulados" checked={p.filters.includeDeleted ?? false} onChange={e => change({ includeDeleted: e.target.checked })} />}
    </fieldset>
    <p className="parts-help">{p.role === "administrador" ? "Aula usa el catálogo administrativo completo. Las opciones de personas, curso y turno corresponden a los registros de esta página." : "Las opciones de aula, personas, curso y turno corresponden a los registros de esta página; no son el catálogo completo."}</p>
    {p.role === 'monitor' && <p className="parts-help">La fecha, el aula y el turno corresponden a la jornada elegida. Vuelve al listado para cambiar de jornada. Se muestran todos sus bloques; puedes filtrar personas, curso y revisión.</p>}
  </details>;
}

function PeoplePicker({ p, kind, value, onChange, disabled, label, empty = "Sin asignar" }: {
  p: PartsViewProps; kind: PersonKind; value: string; onChange: (id: string) => void; disabled: boolean; label: string; empty?: string;
}) {
  const active = p.peopleKind === kind;
  const selected = p.selected;
  const known = new Map<string, string>();
  const titular = kind === "TEACHER" ? selected?.snapshot.teacher : selected?.snapshot.monitor;
  const effective = selected?.effectiveSnapshot[kind];
  [titular, effective].forEach(person => { if (person) known.set(person.id, person.name || person.email); });
  selected?.coverages.filter(c => c.kind === kind).forEach(c => known.set(c.personSnapshot.id, c.personSnapshot.name || c.personSnapshot.email));
  if (active) p.people.forEach(person => known.set(person.id, `${person.name || person.email}${person.name ? ` · ${person.email}` : ""}`));
  if (value && !known.has(value)) known.set(value, `Persona seleccionada: ${value}`);
  return <div className="parts-person">
    <Control label={label}>{id => <Select id={id} value={value} disabled={disabled || p.peopleLoading} onChange={e => onChange(e.target.value)}>
      <option value="">{empty}</option>{[...known].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </Select>}</Control>
    {!active ? <Button size="sm" variant="secondary" disabled={disabled} onClick={() => p.onPeople(kind, "", 1)}>Buscar {kind === "TEACHER" ? "docentes" : "monitores"}</Button> : <>
      <Control label={`Buscar ${kind === "TEACHER" ? "docentes" : "monitores"}`} hint="Catálogo de personas activas del parte; no garantiza disponibilidad.">{(id, describedBy) =>
        <Input id={id} aria-describedby={describedBy} type="search" value={p.peopleSearch} disabled={disabled} placeholder="Nombre o correo" onChange={e => p.onPeople(kind, e.target.value, 1)} />}</Control>
      <Button size="sm" variant="secondary" disabled={disabled || p.peopleLoading} onClick={() => p.onPeople(kind, p.peopleSearch, 1)}>Actualizar catálogo</Button>
      <p className="parts-help" role="status">{p.peopleLoading ? "Buscando personas…" : `${p.peopleTotal} personas encontradas`}</p>
      <Pagination label={`Catálogo de ${kind === "TEACHER" ? "docentes" : "monitores"}`} page={p.peoplePage} hasNext={p.peoplePage * 25 < p.peopleTotal} disabled={disabled || p.peopleLoading} onPage={page => p.onPeople(kind, p.peopleSearch, page)} />
    </>}
  </div>;
}

function SaveActions({ p }: { p: PartsViewProps }) {
  return <div className="parts-actions">
    {p.writable && <Button size="sm" disabled={p.busy || p.conflict || Boolean(p.operation) || !p.dirty || (p.role === "administrador" && (p.draft?.reason.trim().length ?? 0) < 3)} onClick={() => void p.onSave()}>Guardar cambios</Button>}
    <Button size="sm" variant="secondary" disabled={p.busy || (!p.dirty && !p.conflict && !p.unavailable)} onClick={p.onDiscard}>{p.unavailable ? "Descartar borrador y subidas pendientes" : p.conflict ? "Cargar servidor y descartar borrador" : "Descartar cambios"}</Button>
    {p.unavailable && <span className="parts-help">El parte no está disponible. El descarte retira sus pendientes locales, no borra archivos del servidor.</span>}
  </div>;
}

function ReadValue({ value, name }: { value: unknown; name?: string }) {
  if (value === null || value === undefined || value === "") return <span className="parts-muted">Sin registrar</span>;
  if (typeof value === "boolean") return <>{value ? "Sí" : "No"}</>;
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length ? <ul className="parts-values">{value.map((item, index) => <li key={index}><ReadValue value={item} /></li>)}</ul> : <>Sin elementos</>;
    return <dl className="parts-values">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{LABELS[key] ?? key.replaceAll("_", " ")}</dt><dd><ReadValue value={item} name={key} /></dd></div>)}</dl>;
  }
  if (typeof value === "string") {
    if (name === "date" || name === "startsOn" || name === "endsOn") return <>{date(value)}</>;
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return <>{instant(value)}</>;
    return <>{VALUES[value] ?? value}</>;
  }
  return <>{String(value)}</>;
}

function Conflict({ p }: { p: PartsViewProps }) {
  const titleId = useId();
  if (!p.conflict) return null;
  const fields: (keyof RecordDraft)[] = ["actualStart", "actualEnd", "classState", "teachingStatus", "titularOutcome", "effectiveTeacherId", "effectiveMonitorId", "structuredObservations", "incidents", "reason"];
  const base = p.base ? toDraft(p.base) : null;
  const server = p.selected ? toDraft(p.selected) : null;
  return <section className="parts-conflict" aria-labelledby={titleId}>
    <h3 id={titleId}>El parte cambió en el servidor</h3>
    <p>Tu borrador se conserva. No se puede guardar, asociar capturas ni enviar una revisión hasta descartar explícitamente el borrador y cargar la versión del servidor.</p>
    <div className="parts-scroll" tabIndex={0} role="region" aria-label="Comparación de versiones">
      <table className="parts-table parts-comparison"><thead><tr><th>Campo</th><th>Base · v{p.base?.version ?? "—"}</th><th>Servidor · v{p.selected?.version ?? "—"}</th><th>Tu borrador</th></tr></thead>
        <tbody>{fields.map(key => <tr key={key}><th scope="row">{LABELS[key] ?? key}</th><td><ReadValue value={base?.[key]} /></td><td><ReadValue value={server?.[key]} /></td><td><ReadValue value={p.draft?.[key]} /></td></tr>)}</tbody>
      </table>
    </div>
    <Button variant="danger" disabled={p.busy} onClick={p.onDiscard}>Cargar servidor y descartar borrador</Button>
  </section>;
}

function RecordDetails({ p }: { p: PartsViewProps }) {
  const record = p.selected;
  if (!record) return null;
  const disabled = p.busy || !p.writable || Boolean(p.operation);
  return <div className="parts-content">
    <dl className="parts-facts">
      <div><dt>Aula / turno</dt><dd>{record.snapshot.className} / {record.snapshot.shift || "—"}</dd></div>
      <div><dt>Fecha / período</dt><dd>{date(record.date)} / {record.period}</dd></div>
      <div><dt>Docente titular</dt><dd>{record.snapshot.teacher?.name || record.snapshot.teacher?.email || "Sin asignar"}</dd></div>
      <div><dt>Monitor titular</dt><dd>{record.snapshot.monitor?.name || record.snapshot.monitor?.email || "Sin asignar"}</dd></div>
      <div><dt>Cierre original</dt><dd>{instant(record.editDeadline)}</dd></div>
      <div><dt>Versión / revisión</dt><dd>{record.version} / {REVIEW[record.reviewStatus]}</dd></div>
      <div><dt>Origen</dt><dd>{record.origin === "RECOVERY" ? `Recuperación del parte #${record.originalRecordId ?? "—"}` : "Programación regular"}</dd></div>
    </dl>
    {record.deletedAt && <p className="parts-warning">Anulado el {instant(record.deletedAt)}. {record.deletionReason}</p>}
    {p.writeLimit && <p className="parts-help">{p.writeLimit}</p>}
    <dl className="parts-facts">
      <div><dt>Inicio / fin real</dt><dd>{limaTime(record.actualStart) || "Sin registrar"} / {limaTime(record.actualEnd) || "Sin registrar"}</dd></div>
      <div><dt>Estado</dt><dd>{record.classState ? CLASS_STATES[record.classState] : 'Sin registrar'}</dd></div>
      <div><dt>Docente asignado</dt><dd>{record.effectiveSnapshot.TEACHER?.name || record.effectiveSnapshot.TEACHER?.email || "Sin registrar"}</dd></div>
      <div><dt>Monitor asignado</dt><dd>{record.effectiveSnapshot.MONITOR?.name || record.effectiveSnapshot.MONITOR?.email || "Sin registrar"}</dd></div>
      <div className="parts-span"><dt>Observaciones</dt><dd className="parts-prewrap">{record.incidents || "Sin observaciones"}</dd></div>
    </dl>
    {p.role === 'administrador' && p.draft && <fieldset className="parts-grid parts-grid-two" disabled={disabled}><legend>Rectificación explícita de efectivos</legend><PeoplePicker p={p} kind="TEACHER" label="Docente efectivo" value={p.draft.effectiveTeacherId} onChange={effectiveTeacherId => p.onDraft({ effectiveTeacherId })} disabled={disabled} /><PeoplePicker p={p} kind="MONITOR" label="Monitor efectivo" value={p.draft.effectiveMonitorId} onChange={effectiveMonitorId => p.onDraft({ effectiveMonitorId })} disabled={disabled} /><div className="parts-span"><Control label="Motivo de la corrección administrativa" required>{id => <Textarea id={id} required minLength={3} maxLength={2000} value={p.draft!.reason} onChange={event => p.onDraft({reason:event.target.value})} />}</Control></div></fieldset>}
    {p.role === 'administrador' ? <CoverageList p={p} /> : <ButtonLink variant="secondary" to={`/${p.role==='supervisor'?'supervisor':'monitor'}/solicitudes`}>Solicitudes y reemplazos</ButtonLink>}
    <ReviewSection p={p} />
  </div>;
}

function CoverageList({ p }: { p: PartsViewProps }) {
  const record = p.selected;
  if (!record) return null;
  return <details className="parts-section">
    <summary>Coberturas y permisos históricos</summary>
    {record.coverages.length === 0 ? <p className="parts-help">No hay coberturas registradas.</p> : <ul className="parts-list">{record.coverages.map(c => <li key={c.id}>
      <strong>{c.kind === "TEACHER" ? "Docente" : "Monitor"}: {c.personSnapshot.name || c.personSnapshot.email}</strong>
      <span>{COVERAGE[c.status]} · {c.mode === "PLANNED" ? "RN · Reemplazo normal" : "RE · Reemplazo de emergencia"} · cobertura #{c.id}</span>
      <span>Solicitado por {c.requestedBy.email} el {instant(c.requestedAt)}</span>
      {c.resolvedAt && <span>Resuelto por {c.resolvedBy?.email || "—"} el {instant(c.resolvedAt)}</span>}
      <span>{c.reason}</span>
    </li>)}</ul>}
    {(record.grants ?? []).length > 0 && <ul className="parts-list">{record.grants!.map(g => <li key={g.id}>
      <strong>Habilitación #{g.id} · cuenta {g.accountId}</strong><span>Hasta {instant(g.expiresAt)}{g.revokedAt ? ` · revocada ${instant(g.revokedAt)}` : ""}</span><span>{g.reason}</span>
    </li>)}</ul>}
    <div className="parts-actions">

      {p.role === "administrador" && (["replacement", "resolve", "grant", "revoke"] as const).map(action => <Button key={action} size="sm" variant="secondary" disabled={p.busy || p.conflict} onClick={() => p.onOperation(action)}>{OPERATIONS[action]}</Button>)}
    </div>
  </details>;
}

function ReviewSection({ p }: { p: PartsViewProps }) {
  const record = p.selected;
  if (!record) return null;
  return <section className="parts-review" aria-label="Revisión del parte">
    <h3>Revisión · versión {record.version}</h3>
    {p.role === "supervisor" && <>
      <p className="parts-help">Abrir el parte no lo marca como revisado. El cierre de edición no impide revisarlo.</p>
      <fieldset className="parts-content" disabled={p.busy || p.conflict}>
        <Control label="Resultado" required>{id => <Select id={id} value={p.review.result} onChange={e => p.onReview({ result: e.target.value as "CONFORMING" | "OBSERVED", confirmed: false })}>
          <option value="CONFORMING">Conforme</option><option value="OBSERVED">Observado</option>
        </Select>}</Control>
        <Control label="Comentario de revisión (opcional)">{id => <Textarea id={id} maxLength={10000} value={p.review.comments} onChange={e => p.onReview({ comments: e.target.value, confirmed: false })} />}</Control>
        <Checkbox label={`Confirmo que revisé los datos y las evidencias de la versión ${record.version}`} checked={p.review.confirmed} onChange={e => p.onReview({ confirmed: e.target.checked })} />
      </fieldset>
      <div className="parts-actions">
        <Button disabled={p.busy || p.conflict || !p.review.confirmed} onClick={p.onSubmitReview}>Enviar revisión</Button>
        <Button variant="secondary" disabled={p.busy || !p.reviewDirty} onClick={p.onDiscardReview}>Descartar revisión pendiente</Button>
      </div>
    </>}
    <details className="parts-section"><summary>Revisiones por versión ({record.reviews.length})</summary>
      {record.reviews.length === 0 ? <p className="parts-help">Todavía no hay revisiones.</p> : <ol className="parts-list">{record.reviews.map(r => <li key={r.id}>
        <strong>Versión {r.recordVersion} · {REVIEW[r.result]} {r.recordVersion !== record.version ? "(histórica)" : "(actual)"}</strong>
        <span>{r.actor.email} · {instant(r.createdAt)}</span><p className="parts-prewrap">{r.comments || "Sin comentario"}</p>
        {r.files.length > 0 && <details><summary>Evidencias de esta revisión</summary><ul className="parts-values">{r.files.map(f => <li key={`${f.id}-${f.generation}`}>Archivo {f.id} · generación {f.generation} · checksum {f.checksum}</li>)}</ul></details>}
      </li>)}</ol>}
    </details>
  </section>;
}

function Capture({ p, slot, onZoom }: { p: PartsViewProps; slot: Slot; onZoom: (id: string) => void }) {
  const r = p.selected;
  if (!r) return null;
  const id = slot === "initial" ? r.initialFileId : r.finalFileId;
  const associatedAt = slot === "initial" ? r.initialAssociatedAt : r.finalAssociatedAt;
  const pending = p.pendingFiles[slot];
  const label = slot === "initial" ? "Inicio" : "Fin";
  const preview = id ? p.thumbnails[id] || p.images[id] : null;
  return <section className="parts-capture" aria-label={`Captura de ${label.toLowerCase()}`}>
    <h3>{label}</h3>
    {id ? <>
      <button className="parts-thumbnail" type="button" disabled={p.busy} onClick={() => { if (!p.images[id]) p.onLoadImage(id); onZoom(id); }} aria-label={`Ampliar captura de ${label.toLowerCase()}`}>
        {preview ? <img src={preview} alt={`Captura de ${label.toLowerCase()}`} /> : <span>Ver captura</span>}
      </button>
      <p>Asociada: {instant(associatedAt)}</p>
      <p className="parts-help">La miniatura se carga en lote. El PNG original se solicita solo al ampliar.</p>
      <details><summary>Identificador de evidencia</summary><span className="parts-break">{id}</span></details>
    </> : <p className="parts-muted">Sin captura asociada.</p>}
    {pending && <p role="status">Hay una subida pendiente. Continúa en el editor de captura de la tabla; no se ha asociado.</p>}
  </section>;
}

function History({ p }: { p: PartsViewProps }) {
  return <div className="parts-content">
    <p className="parts-help">50 eventos por página. Se muestran los valores anteriores y posteriores de cada operación.</p>
    {p.historyLoading ? <p role="status">Cargando historial…</p> : p.history.length === 0 ? <p>No hay eventos en esta página.</p> : <ol className="parts-list parts-history">
      {p.history.map(event => <li key={event.id}>
        <strong>{VALUES[event.action] ?? event.action.replaceAll("_", " ")} · evento #{event.id}</strong>
        <span>{event.actor.email} · {event.actor.role} · {instant(event.createdAt)}</span>
        {event.reason && <p className="parts-prewrap">Motivo: {event.reason}</p>}
        <details><summary>Antes / después</summary><div className="parts-diff"><section><h4>Antes</h4><ReadValue value={event.before} /></section><section><h4>Después</h4><ReadValue value={event.after} /></section></div></details>
      </li>)}
    </ol>}
    <Pagination label="Historial del parte" page={p.historyPage} hasNext={p.history.length === 50} disabled={p.busy || p.historyLoading} onPage={p.onHistory} />
  </div>;
}

function OperationDialog({ p }: { p: PartsViewProps }) {
  const op = p.operation;
  if (!op || p.role === "monitor" || (p.role === "supervisor" && !['replacement','resolve'].includes(op.action))) return null;
  const record = p.selected;
  const patch = p.onOperationDraft;
  const targets = p.selectedIds.length ? p.selectedIds : record ? [record.id] : [];
  const action = op.action;
  const canSubmit = !p.busy && !p.conflict && op.reason.trim().length >= 3 &&
    (action === "configuration" ? Boolean(p.config) : action === "cancel" || action === "restore" ? targets.length > 0 : Boolean(record)) &&
    (action !== "recovery" || Boolean(op.date && op.classId && op.hourSessionId)) &&
    (action !== "replacement" || Boolean(op.personId)) && (action !== "resolve" || Boolean(op.coverageId)) &&
    (action !== "grant" || Boolean(record?.monitorAccountId && op.expiresAt)) && (action !== "revoke" || Boolean(op.grantId));
  const input = (key: keyof OperationDraft, label: string, type = "text", required = false, hint?: string) => <Control key={key} label={label} required={required} hint={hint}>{(id, describedBy) =>
    <Input id={id} aria-describedby={describedBy} type={type} required={required} value={String(op[key])} onChange={e => patch({ [key]: e.target.value })} {...(type === "number" ? { min: 0, max: 1440, step: 1 } : {})} />}</Control>;
  return <Dialog open={p.operationOpen} onClose={() => { if (!p.busy) p.onCloseOperation(); }} title={p.role === "supervisor" && action === "replacement" ? "Registrar sustitución de monitor" : OPERATIONS[action]} size="lg" description={action === "configuration" ? `Versión de configuración ${p.config?.version ?? "no disponible"}` : `Parte seleccionado #${record?.id ?? "—"}`} footer={<>
    <Button variant="ghost" disabled={p.busy} onClick={p.onCloseOperation}>Cerrar y conservar borrador</Button>
    <Button variant="secondary" disabled={p.busy} onClick={p.onDiscardOperation}>Descartar operación</Button>
    <Button type="submit" form="parts-operation-form" disabled={!canSubmit}>{action === "replacement" && p.role === "supervisor" ? "Registrar sustitución" : "Confirmar operación"}</Button>
  </>}>
    <form id="parts-operation-form" className="parts-content" onSubmit={e => { e.preventDefault(); if (canSubmit) p.onSubmitOperation(); }}>
      {p.error && <p className="parts-message parts-error" role="alert">{p.error}</p>}
      {p.notice && <p className="parts-message parts-notice" role="status">{p.notice}</p>}
      <fieldset className="parts-content" disabled={p.busy || p.conflict}>
        {(action === "cancel" || action === "restore" || action === "replacement") && <div className="parts-note">
          <strong>{targets.length} parte{targets.length !== 1 ? "s" : ""} de destino</strong><p className="parts-break">{targets.map(id => `#${id}`).join(", ") || "Selecciona al menos un parte."}</p><p>La selección de la tabla admite hasta 200 partes.</p>
        </div>}
        {action === "replacement" && <>
          <Control label="Tipo de persona" required>{id => <Select id={id} value={p.role === "supervisor" ? "MONITOR" : op.kind} disabled={p.role === "supervisor"} onChange={e => { const kind = e.target.value as PersonKind; patch({ kind, personId: "" }); p.onPeople(kind, "", 1); }}>
            {p.role !== "supervisor" && <option value="TEACHER">Docente</option>}<option value="MONITOR">Monitor</option>
          </Select>}</Control>
          <PeoplePicker p={p} label={p.role === "supervisor" ? "Monitor sustituto" : "Persona reemplazante"} kind={p.role === "supervisor" ? "MONITOR" : op.kind} value={op.personId} empty="Selecciona una persona" onChange={personId => patch({ personId })} disabled={p.busy || p.conflict} />
          <Control label="Modalidad" required>{id => <Select id={id} value={op.mode} onChange={e => patch({ mode: e.target.value as "PLANNED" | "EMERGENCY" })}>
            <option value="PLANNED">RN · Reemplazo normal</option><option value="EMERGENCY">RE · Reemplazo de emergencia</option>
          </Select>}</Control>
          <p className="parts-help">{p.role === "supervisor" ? "Registra quién ejerce como monitor en el bloque. No cambia la cuenta autenticada, el aula, la contraseña ni la asignación semanal." : "El reemplazo no confirma que hubo dictado ni cambia la persona efectiva del parte."}</p>
        </>}
        {action === "resolve" && <>
          <Control label="Cobertura a resolver" required>{id => <Select id={id} required value={op.coverageId} onChange={e => patch({ coverageId: e.target.value })}>
            <option value="">Selecciona una cobertura</option>{record?.coverages.filter(c => p.role === 'administrador' || c.kind === 'MONITOR').map(c => <option key={c.id} value={c.id}>#{c.id} · {c.kind === "TEACHER" ? "Docente" : "Monitor"} · {c.personSnapshot.name || c.personSnapshot.email} · {COVERAGE[c.status]}</option>)}
          </Select>}</Control>
          <Control label="Resolución" required>{id => <Select id={id} value={op.status} onChange={e => patch({ status: e.target.value as OperationDraft["status"] })}>
            {p.role === 'administrador' && <><option value="AUTHORIZED">Autorizar</option><option value="REJECTED">Rechazar</option></>}<option value="REVOKED">Revocar</option>
          </Select>}</Control>
          <p className="parts-help">Autorizar cobertura no confirma ejecución. El dictado y las personas efectivas se registran por separado.</p>
        </>}
        {action === "grant" && <>
          <Control label="Cuenta habilitada" required>{id => <Select id={id} value={op.accountId} onChange={event => patch({ accountId:event.target.value })}>{(record?.eligibleGrantAccounts ?? (record?.monitorAccountId ? [{id:record.monitorAccountId,email:'Cuenta del monitor',role:'monitor'}] : [])).map(account => <option key={account.id} value={account.id}>{account.email} · {account.role}</option>)}</Select>}</Control>
          {input("expiresAt", "Vencimiento (hora de Lima)", "datetime-local", true, "Se interpreta en America/Lima (UTC−05:00), no en la zona horaria del dispositivo.")}
          <p className="parts-help">El cierre original sigue siendo {instant(record?.editDeadline)}. La habilitación no modifica dicho cierre.</p>
        </>}
        {action === "revoke" && <Control label="Habilitación a revocar" required>{id => <Select id={id} required value={op.grantId} onChange={e => patch({ grantId: e.target.value })}>
          <option value="">Selecciona una habilitación</option>{record?.grants?.filter(g => !g.revokedAt).map(g => <option key={g.id} value={g.id}>#{g.id} · {g.accountId} · hasta {instant(g.expiresAt)}</option>)}
        </Select>}</Control>}
        {action === "cancel" && <p>La anulación conserva el historial y deja los partes fuera del seguimiento activo. No borra evidencias.</p>}
        {action === "restore" && <p>Se restaurarán los partes seleccionados. Sus datos e historial se conservan.</p>}
        {action === "recovery" && <>
          <p>La recuperación se vincula al parte #{record?.id ?? "—"}; no altera el registro de origen.</p>
          {input("date", "Fecha de recuperación", "date", true)}
          <Control label="Aula" required>{id => <Select id={id} required value={op.classId} onChange={e => patch({ classId: e.target.value, hourSessionId: "" })}>
            <option value="">Selecciona un aula</option>{p.classrooms.map(c => <option key={c.id} value={c.id}>{c.name} · {c.shift.name}</option>)}
          </Select>}</Control>
          <Control label="Período" required>{id => <Select id={id} required value={op.hourSessionId} onChange={e => patch({ hourSessionId: e.target.value })}>
            <option value="">Selecciona un período</option>{p.periods.filter(period => !op.classId || period.shiftId === p.classrooms.find(c => c.id === op.classId)?.shiftId).map(period =>
              <option key={period.id} value={period.id}>Período {period.period} · {period.startTime.includes("T") ? period.startTime.slice(11, 16) : period.startTime.slice(0, 5)}–{period.endTime.includes("T") ? period.endTime.slice(11, 16) : period.endTime.slice(0, 5)} · {period.shift.name}</option>)}
          </Select>}</Control>
        </>}
        {action === "configuration" && !p.config && <p role="status">Cargando configuración operativa…</p>}
        {action === "configuration" && p.config && <>
          <Checkbox label="Habilitar generación de partes" checked={op.enabled} onChange={e => patch({ enabled: e.target.checked })} />
          <div className="parts-grid parts-grid-two">{input("startsOn", "Fecha de inicio", "date", op.enabled)}{input("endsOn", "Fecha de fin", "date", op.enabled)}</div>
          <p className="parts-help">Los parámetros vacíos quedan sin definir (nulos), no equivalen a cero. Valores enteros entre 0 y 1440 minutos.</p>
          <div className="parts-grid parts-grid-two">
            {input("latenessToleranceMinutes", "Tolerancia de tardanza (minutos)", "number")}
            {input("replacementWaitMinutes", "Espera de reemplazo (minutos)", "number")}
            {input("alertThresholdMinutes", "Umbral de alerta (minutos)", "number")}
            {input("escalationDelayMinutes", "Demora de escalado tras el aviso (minutos)", "number", false, "Vacío desactiva el escalado. No existe un valor institucional predeterminado.")}
            {input("continuityGapMinutes", "Separación de continuidad (minutos)", "number")}
          </div>
        </>}
        <Control label="Motivo de la operación" required hint="Entre 3 y 2000 caracteres.">{(id, describedBy) => <Textarea id={id} aria-describedby={describedBy} required minLength={3} maxLength={2000} value={op.reason} onChange={e => patch({ reason: e.target.value })} />}</Control>
      </fieldset>
      {p.conflict && <p className="parts-warning">Resuelve primero el conflicto descartando explícitamente el borrador del parte.</p>}
    </form>
  </Dialog>;
}

function Alerts({ p }: { p: PartsViewProps }) {
  return <details className="parts-section" onToggle={e => { if (e.currentTarget.open && p.alerts.length === 0 && !p.busy) p.onAlerts(p.alertsPage); }}>
    <summary>Alertas de seguimiento</summary>
    <p className="parts-help">Acusar recibo indica que viste la alerta; no resuelve la incidencia ni modifica el parte.</p>
    <Button size="sm" variant="secondary" disabled={p.busy} onClick={() => p.onAlerts(p.alertsPage)}>Actualizar alertas</Button>
    {p.alerts.length === 0 ? <p className="parts-help">No hay alertas en esta página.</p> : <ul className="parts-list">{p.alerts.map(alert => <li key={alert.id}>
      <div className="parts-actions"><strong>{VALUES[alert.type] ?? alert.type.replaceAll("_", " ")}</strong><Button size="sm" variant="ghost" disabled={p.busy} onClick={() => p.onSelect(alert.recordId)}>Ver parte #{alert.recordId}</Button></div>
      <span>Creada: {instant(alert.createdAt)}</span>
      {alert.acknowledgedAt ? <span>Acuse: {instant(alert.acknowledgedAt)} · no implica resolución</span> : <Button size="sm" variant="secondary" disabled={p.busy} onClick={() => p.onAcknowledge(alert.id)}>Acusar recibo</Button>}
    </li>)}</ul>}
    <Pagination label="Alertas" page={p.alertsPage} hasNext={p.alerts.length === 50} disabled={p.busy} onPage={p.onAlerts} />
  </details>;
}

function Report({ p }: { p: PartsViewProps }) {
  const columns = [...new Set(p.report?.data.flatMap(row => Object.keys(row)) ?? [])];
  return <Dialog open={p.reportOpen} title="Reporte de partes" size="lg" onClose={() => { if (!p.busy) p.onCloseReport(); }} description={`${date(p.filters.from)} a ${date(p.filters.to)} · filtros actuales`} footer={<Button variant="secondary" disabled={p.busy} onClick={p.onCloseReport}>Cerrar reporte</Button>}>
    <div className="parts-content">
      {p.error && <p className="parts-message parts-error" role="alert">{p.error}</p>}
      <p className="parts-help">Datos y resumen calculados por el servidor. Autorizar reemplazo y ejecutar reemplazo son hechos distintos. Este reporte no calcula pagos.</p>
      {p.summary && <details className="parts-section"><summary>Resumen del servidor</summary><dl className="parts-facts">{Object.entries(p.summary).map(([key, value]) => <div key={key}><dt>{LABELS[key] ?? key.replaceAll("_", " ")}</dt><dd>{value ?? "Sin determinar"}</dd></div>)}</dl></details>}
      <div className="parts-scroll" tabIndex={0} role="region" aria-label="Tabla de reporte">
        <table className="parts-table parts-report"><caption>Detalle de partes · {p.report?.total ?? 0} registros</caption><thead><tr>{columns.map(key => <th key={key} scope="col">{LABELS[key] ?? key.replaceAll("_", " ")}</th>)}</tr></thead><tbody>
          {p.report?.data.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map(key => <td key={key}><ReadValue value={row[key]} name={key} /></td>)}</tr>)}
        </tbody></table>
      </div>
      {!p.report?.data.length && <p>{p.busy ? "Cargando reporte…" : "No hay resultados para estos filtros."}</p>}
      <Pagination label="Reporte" page={p.report?.page ?? 1} hasNext={Boolean(p.report && p.report.page * p.report.limit < p.report.total)} disabled={p.busy} onPage={p.onReport} />
    </div>
  </Dialog>;
}

function FollowupDialog({ p }: { p: PartsViewProps }) {
  const {text,reason,editing} = p.followupDraft;
  const setText = (text:string) => p.onFollowupDraft({text});
  const setReason = (reason:string) => p.onFollowupDraft({reason});
  const setEditing = (editing:PartsViewProps['followupDraft']['editing']) => p.onFollowupDraft({editing});
  const [tab, setTab] = useState<'notes'|'substitutions'>('notes');
  const close = () => { if (!p.busy) p.onFollowup(false); };
  return <Dialog open={p.followupOpen} onClose={close} title="Seguimiento del monitor" description="Privado de supervisión y administración; fuera de la tabla y de las observaciones de clase." footer={<Button variant="secondary" disabled={p.busy} onClick={close}>Cerrar y conservar borrador</Button>}>
    {p.error && <p role="alert" className="parts-message parts-error">{p.error}</p>}
    <nav className="parts-actions" aria-label="Seguimiento privado"><Button variant={tab === 'notes' ? 'primary' : 'secondary'} onClick={() => setTab('notes')}>Observaciones</Button><Button variant={tab === 'substitutions' ? 'primary' : 'secondary'} onClick={() => setTab('substitutions')}>Sustituciones</Button></nav>
    {tab === 'substitutions' ? <div className="parts-content"><Control label="Bloque a sustituir o rectificar">{id => <Select id={id} value={p.selected?.id ?? ''} onChange={event => p.onSelect(Number(event.target.value), true)}><option value="">Selecciona un bloque</option>{p.rows.map(row => <option key={row.id} value={row.id}>Bloque {row.period} · {limaTime(row.scheduledStart)}</option>)}</Select>}</Control><p className="parts-help">La cuenta sigue siendo la oficial. Una cobertura no confirma trabajo ni reescribe efectivos ya registrados.</p>{p.selected?.coverages.filter(coverage => coverage.kind === 'MONITOR').map(coverage => <p key={coverage.id}>{coverage.personSnapshot.name || coverage.personSnapshot.email} · {COVERAGE[coverage.status]}</p>)}<div className="parts-actions"><Button disabled={!p.base || p.busy} onClick={() => p.onOperation('replacement')}>Registrar sustitución</Button><Button variant="secondary" disabled={!p.base || p.busy || !p.selected?.coverages.some(coverage => coverage.kind === 'MONITOR' && coverage.status === 'AUTHORIZED')} onClick={() => p.onOperation('resolve')}>Revocar sustitución</Button></div></div> :
    <div className="parts-content">
      <p className="parts-help">Estas notas no crean antecedentes personales, no se envían al monitor y no modifican el parte. La autoría y la hora son del servidor.</p>
      <Control label="Nueva nota privada">{(id, describedBy) => <Textarea id={id} aria-describedby={describedBy} maxLength={2000} value={text} onChange={event => setText(event.target.value)} />}</Control>
      <div className="parts-actions"><Button size="sm" disabled={p.busy || text.trim().length < 3} onClick={async () => { const saved = editing ? await p.onFollowupUpdate(editing.id,editing.version,text.trim()) : await p.onFollowupCreate(text.trim()); if (saved) { setText(''); setEditing(null); } }}>{editing ? 'Guardar corrección' : 'Agregar nota'}</Button><Button size="sm" variant="secondary" disabled={p.busy || !text} onClick={() => { setText(''); setEditing(null); }}>Descartar borrador de nota</Button></div>
      <Control label="Motivo de retirada" hint="Se exige antes de retirar una nota; queda en auditoría.">{(id) => <Input id={id} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} />}</Control>
      {p.followupLoading ? <p role="status">Cargando seguimiento…</p> : p.followup.length === 0 ? <p className="parts-muted">Sin notas privadas en esta jornada.</p> : <ol className="parts-list">
        {p.followup.map(note => <li key={note.id}>
          <strong className="parts-prewrap">{note.text}</strong>
          <span>{note.author?.email || "Autor no disponible"} · {instant(note.created_at)} · versión {note.version}</span>
          <Button size="sm" variant="secondary" disabled={p.busy || !!text} onClick={() => { setEditing({id:note.id,version:note.version}); setText(note.text); }}>Editar nota</Button>
          <Button size="sm" variant="danger" disabled={p.busy || reason.trim().length < 3} onClick={async () => { if (await p.onFollowupWithdraw(note.id, note.version, reason.trim())) setReason(''); }}>Retirar nota</Button>
        </li>)}
      </ol>}
      <Pagination label="Notas privadas de jornada" page={p.followupPage} hasNext={p.followupPage * 25 < p.followupTotal} disabled={p.busy} onPage={p.onFollowupPage} />
    </div>}
  </Dialog>;
}

export function PartsView(props: PartsViewProps) {
  const p = props;
  const [panel, setPanel] = useState<"detail" | "evidence" | "history" | null>(null);
  const [zoomId, setZoomId] = useState<string | null>(null);
  const [fullSize, setFullSize] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const openPanel = (id: number, next: "detail" | "evidence" | "history") => {
    if (p.selected?.id !== id) p.onSelect(id, next !== "evidence");
    else if (next !== "evidence") p.onSelect(id, true);
    setPanel(next);
    if (next === "history" && p.selected?.id === id) p.onHistory(1);
  };
  const selected = p.selected;
  const editable = p.writable;
  // Un descarte o una anulación concurrente que retira el recurso no debe dejar un diálogo vacío.
  useEffect(() => { if (panel && !selected && !p.loading) setPanel(null); }, [panel, selected, p.loading]);
  return <main className="parts-view parts-official-view" aria-busy={p.busy || p.loading}>
    <OfficialPartsSheet p={p} onMore={id => openPanel(id, 'detail')} onFollowup={() => p.onFollowup(true)} onTools={() => setToolsOpen(true)} />
    <Dialog open={toolsOpen} onClose={() => setToolsOpen(false)} title="Opciones de Partes" footer={<Button onClick={() => setToolsOpen(false)}>Volver a la jornada</Button>}>
      <div className="parts-actions"><Button variant="secondary" disabled={p.busy} onClick={p.onRefresh}>Actualizar jornada</Button><Button variant="secondary" disabled={p.busy} onClick={p.onRetryThumbnails}>Reintentar miniaturas</Button>{p.role === 'monitor' && <Button variant="secondary" onClick={() => { setToolsOpen(false); p.onShowJournals(true); }}>Histórico de jornadas</Button>}{p.role === 'administrador' && <Button variant="secondary" onClick={() => { setToolsOpen(false); p.onReport(1); }}>Ver reporte</Button>}</div>
      <Filters p={p} />
      <Conflict p={p} />
    {p.role === "administrador" && <details className="parts-section"><summary>Operaciones administrativas</summary>
      <p className="parts-help">Selecciona partes con las casillas de la tabla (máximo 200). Para cobertura o recuperación, abre primero el parte correspondiente.</p>
      <div className="parts-actions">{(Object.keys(OPERATIONS) as Operation[]).filter(action => action !== 'grant' && action !== 'revoke').map(action => <Button key={action} size="sm" variant="secondary" disabled={p.busy || p.conflict || (action === "configuration" ? false : action === "cancel" || action === "restore" ? !selected && !p.selectedIds.length : !selected)} onClick={() => p.onOperation(action)}>{OPERATIONS[action]}</Button>)}</div>
      <p className="parts-help">{p.selectedIds.length} partes seleccionados.</p>
    </details>}
    {p.operation && !p.operationOpen && (p.role === "administrador" || (p.role === "supervisor" && p.operation.action === "replacement")) && <div className="parts-draft-bar"><span>Borrador conservado: {OPERATIONS[p.operation.action]}</span><Button size="sm" variant="secondary" disabled={p.busy} onClick={() => p.onOperation(p.operation!.action)}>Continuar operación</Button><Button size="sm" variant="ghost" disabled={p.busy} onClick={p.onDiscardOperation}>Descartar operación</Button></div>}
    {p.role !== 'monitor' && <Alerts p={p} />}
    {!p.sheet && <Pagination label="Partes diarios" page={p.filters.page} hasNext={p.filters.page * p.filters.limit < p.total} disabled={p.busy || p.loading} onPage={page => p.onFilters({ ...p.filters, page })} />}
    {p.role === 'administrador' && <fieldset className="parts-content"><legend>Destinos de operación (máximo 200)</legend>{p.rows.map(row => <Checkbox key={row.id} label={`Parte #${row.id} · ${date(row.date)} · bloque ${row.period}`} checked={p.selectedIds.includes(row.id)} disabled={p.busy || Boolean(p.operation)} onChange={() => p.onToggleTarget(row.id)} />)}</fieldset>}
    {selected && <section className="parts-selection" aria-label="Parte seleccionado"><div><strong>Parte #{selected.id} · versión {selected.version}</strong><span>{p.writeLimit || (editable ? "Seleccionado para edición" : "Solo lectura")}{p.dirty ? " · cambios sin guardar" : ""}{p.reviewDirty ? " · revisión pendiente" : ""}</span></div><div className="parts-actions"><Button size="sm" variant="secondary" disabled={p.busy} onClick={() => { p.onSelect(selected.id, true); setPanel("detail"); }}>Detalle{p.role === "supervisor" ? " y revisión" : ""}</Button>{p.role === "administrador" && <Button size="sm" variant="secondary" disabled={p.busy} onClick={() => { p.onSelect(selected.id, true); p.onHistory(1); setPanel("history"); }}>Historial</Button>}<Button size="sm" variant="ghost" disabled={p.busy} onClick={() => p.onSelect(null)}>Cerrar selección</Button></div></section>}
    </Dialog>
    <Dialog open={Boolean(panel && selected)} size="lg" onClose={() => { if (!p.busy) setPanel(null); }} title={`${panel === "evidence" ? "Evidencias" : panel === "history" ? "Historial" : "Detalle del parte"} #${selected?.id ?? ""}`} description={selected ? `${selected.snapshot.course || "Clase"} · ${selected.snapshot.className} · ${date(selected.date)}` : undefined} footer={<>
      <Button variant="secondary" disabled={p.busy} onClick={() => setPanel(null)}>Volver a la jornada</Button>{panel === "detail" && (editable || p.dirty || p.conflict || p.unavailable) && <SaveActions p={p} />}
    </>}>
      <div className="parts-dialog-content">
        {p.error && <p role="alert" className="parts-message parts-error">{p.error}</p>}{p.notice && <p role="status" className="parts-message parts-notice">{p.notice}</p>}
        {p.conflict && <Conflict p={p} />}
        <nav className="parts-actions parts-tabs" aria-label="Secciones del parte">{([['detail', 'Detalle'], ['evidence', 'Evidencias'], ['history', 'Historial']] as const).filter(([key])=>key!=='history'||p.role==='administrador').map(([key, label]) => <Button key={key} size="sm" variant={panel === key ? "primary" : "secondary"} aria-pressed={panel === key} disabled={p.busy} onClick={() => { setPanel(key); if (key === "history") p.onHistory(1); }}>{label}</Button>)}</nav>
        {panel === "detail" && <RecordDetails p={p} />}
        {panel === "evidence" && <><p className="parts-help">La miniatura se carga en lote; la imagen completa solo al ampliar. Subir y asociar son pasos separados. Retirar una captura es lógico y conserva el archivo y el historial.</p><div className="parts-captures">{(["initial", "final"] as const).map(slot => <Capture key={slot} p={p} slot={slot} onZoom={id => { setZoomId(id); setFullSize(false); }} />)}</div></>}
        {panel === "history" && p.role === "administrador" && <History p={p} />}
      </div>
    </Dialog>
    <Dialog open={Boolean(zoomId)} size="lg" title="Captura completa" description="Sin recorte. Usa Tab para llegar al área de imagen y las flechas para desplazarla al 100 %." onClose={() => setZoomId(null)} footer={<><Button variant="secondary" aria-pressed={!fullSize} onClick={() => setFullSize(false)}>Ajustar a pantalla</Button><Button variant="secondary" aria-pressed={fullSize} onClick={() => setFullSize(true)}>Zoom 100 %</Button><Button onClick={() => setZoomId(null)}>Cerrar ampliación</Button></>}>
      {p.error && <p role="alert" className="parts-message parts-error">{p.error}</p>}
      <div className={`parts-zoom ${fullSize ? "is-full" : ""}`} tabIndex={0} role="region" aria-label="Imagen completa con desplazamiento">{zoomId && p.images[zoomId] ? <img src={p.images[zoomId]} alt="Evidencia de clase completa, sin recorte" /> : <p role="status">Cargando imagen…</p>}</div>
      {zoomId && !p.images[zoomId] && <Button variant="secondary" disabled={p.busy} onClick={() => p.onLoadImage(zoomId)}>Volver a cargar imagen</Button>}
    </Dialog>
    <FollowupDialog p={p} />
    <OperationDialog p={p} />
    {p.role === "administrador" && <Report p={p} />}
  </main>;
}
