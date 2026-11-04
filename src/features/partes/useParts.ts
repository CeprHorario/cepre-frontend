import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useBlocker } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiErrorMessage } from "@/api/client";
import { CatalogApi, ClassesApi } from "@/api/services";
import { useAuth } from "@/auth/AuthProvider";
import { academicDate, configPayload, editorDraft, editorFields, editStartsAt, limaDate, operationDraft, ordinaryWritable, requireReason, toDraft, updatePayload, validateRange } from "./model";
import { createPartsApi } from "./service";
import type { PartObservation } from './ObservationsEditor';
import type { AuditEvent, CaptureDraft, JournalFilters, MonitorJournalsProps, MonitorObservation, OperationDraft, PartAlert, PartContext, PartFilters, PartJournal, PartRecord, PartRole, PartWorkspace, PartWorkspaceRow, PartsViewProps, RecordDraft, ReviewDraft, Slot, UploadedCapture } from "./types";

const blankReview = (): ReviewDraft => ({ result: "CONFORMING", comments: "", confirmed: false });
export interface Workspace {
  journal: PartJournal | null; journalFilters: JournalFilters;
  inFlight: boolean;
  filters: PartFilters; sheetFilters: { date: string; classId?: string; shiftId?: number } | null;
  id: number | null; base: PartRecord | null; draft: RecordDraft | null; detail: boolean;
  review: ReviewDraft; reviewDirty: boolean; pendingFiles: Partial<Record<Slot, UploadedCapture>>;
  conflict: boolean; operation: OperationDraft | null; operationBase: PartRecord | null;
  configVersion: number | null; targets: PartRecord[]; operationTargets: PartRecord[];
  followupOpen: boolean; showJournals: boolean;
  captureDrafts?: Partial<Record<Slot, CaptureDraft>>;
  proposalOperation?: { signature: string; id: string };
  noteComposer?: PartObservation | null;
  followupDraft?: PartsViewProps['followupDraft'];
}
function freshWorkspace(): Workspace {
  const date = limaDate();
  const from = new Date(`${date}T12:00:00Z`); from.setUTCDate(from.getUTCDate() - 30);
  return { journal: null, journalFilters: { from: from.toISOString().slice(0, 10), to: date, page: 1, limit: 25 }, inFlight: false, filters: { from: date, to: date, page: 1, limit: 25 }, sheetFilters: null, id: null, base: null, draft: null, detail: false, review: blankReview(), reviewDirty: false, pendingFiles: {}, conflict: false, operation: null, operationBase: null, configVersion: null, targets: [], operationTargets: [], followupOpen: false, showJournals: false };
}

/** Estado de trabajo separado de la caché del servidor. Solo memoria, nunca Web Storage. */
export function useParts(context: PartContext, role: PartRole, onContextChanged: () => void, bootstrap?: PartWorkspace): PartsViewProps & MonitorJournalsProps {
  const client = useQueryClient();
  const { status } = useAuth();
  const scope = useMemo(() => ["parts", context.accountId, context.process] as const, [context.accountId, context.process]);
  const workspaceKey = useMemo(() => [...scope, "workspace"], [scope]);
  const service = useMemo(() => createPartsApi(context.process, context.accountId), [context.process, context.accountId]);
  const initialWorkspace = useRef(client.getQueryData<Workspace>(workspaceKey) ?? freshWorkspace());
  const subscribe = useCallback((notify: () => void) => client.getQueryCache().subscribe(event => {
    if (event.query.queryKey.length === workspaceKey.length && event.query.queryKey.every((value: unknown, index: number) => value === workspaceKey[index])) notify();
  }), [client, workspaceKey]);
  const snapshot = useCallback(() => client.getQueryData<Workspace>(workspaceKey) ?? initialWorkspace.current, [client, workspaceKey]);
  // La suscripción síncrona evita que el batching de consultas retrase los controles de formulario.
  const state = useSyncExternalStore(subscribe, snapshot, snapshot);
  const busy = state.inFlight;
  const running = useRef(false);
  const alive = useRef(true);
  const setState = useCallback((update: (previous: Workspace) => Workspace) => {
    // Incluso si mantenimiento desmontó la vista, conservar el resultado confirmado en SU contexto.
    // Un logout confirmado elimina la entrada: una respuesta tardía no debe recrearla.
    if (!client.getQueryState(workspaceKey)) return;
    client.setQueryData<Workspace>(workspaceKey, previous => update(previous ?? freshWorkspace()));
  }, [client, workspaceKey]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [operationOpen, setOperationOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [alertsPage, setAlertsPage] = useState(1);
  const [showAlerts, setShowAlerts] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const [reportOpen, setReportOpen] = useState(false);
  const [followupPage, setFollowupPage] = useState(1);
  const [peopleParams, setPeopleParams] = useState({ kind: "TEACHER" as "TEACHER" | "MONITOR", search: "", page: 1 });
  const [images, setImages] = useState<Record<string, string>>({});
  const imageUrls = useRef(new Map<string, string>());
  const imageRequests = useRef(new Map<string, AbortController>());
  const [clock, setClock] = useState(performance.now());
  const serverClock = useRef({ server: Date.parse(context.serverNow), local: performance.now() });
  const enabled = !status?.maintenance || role === "administrador";
  const dirty = Boolean(state.base && state.draft && JSON.stringify(toDraft(state.base)) !== JSON.stringify(state.draft));
  const incidenceDraft = useQuery<{ dirty: boolean; busy: boolean }>({ queryKey: ['incidences', 'draft', context.accountId, context.process], queryFn: async () => ({ dirty: false, busy: false }), enabled: false });
  const pending = dirty || state.reviewDirty || Boolean(state.operation || state.noteComposer || state.followupDraft?.text || state.followupDraft?.reason) || Object.keys(state.pendingFiles).length > 0 || Object.keys(state.captureDrafts ?? {}).length > 0 || Boolean(incidenceDraft.data?.dirty || incidenceDraft.data?.busy);
  const blocker = useBlocker(pending || busy);

  useEffect(() => { client.setQueryDefaults(workspaceKey, { gcTime: Infinity }); if (!client.getQueryData(workspaceKey)) client.setQueryData(workspaceKey, initialWorkspace.current); }, [client, workspaceKey]);
  useEffect(() => { serverClock.current = { server: Date.parse(context.serverNow), local: performance.now() }; }, [context.serverNow]);
  useEffect(() => { const timer = window.setInterval(() => setClock(performance.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (blocker.state === "blocked") { setError("Hay cambios u operaciones pendientes. Guarda o descarta explícitamente antes de salir."); blocker.reset(); }
  }, [blocker]);
  useEffect(() => {
    alive.current = true;
    const urls = imageUrls.current, requests = imageRequests.current;
    return () => {
      alive.current = false;
      requests.forEach(controller => controller.abort()); requests.clear();
      urls.forEach(url => URL.revokeObjectURL(url)); urls.clear();
      void client.cancelQueries({ queryKey: scope });
      client.removeQueries({ queryKey: scope, predicate: q => q.queryKey[3] !== "workspace" });
    };
  }, [client, scope]);

  const queryOptions = { retry: false as const, staleTime: Infinity, refetchOnWindowFocus: false, enabled };
  const singleDay = state.filters.from === state.filters.to;
  // Los anulados solo están en el listado administrativo; la hoja no los mezcla con la jornada activa.
  const sheetMode = singleDay && !state.filters.includeDeleted;
  const sheetParams = state.sheetFilters ?? (bootstrap ? {} : { date: state.filters.from, classId: state.filters.classId, shiftId: state.filters.shiftId });
  // A: bootstrap + jornada completa. Sustituye agenda/list/detail en la lectura ordinaria.
  const sheet = useQuery({ ...queryOptions, queryKey: [...scope, "sheet", sheetParams], initialData: state.sheetFilters === null ? bootstrap : undefined, enabled: enabled && sheetMode && !state.showJournals, queryFn: ({ signal }) => service.workspace(sheetParams, signal) });
  useEffect(() => { if (sheet.data) serverClock.current = { server: Date.parse(sheet.data.context.serverNow), local: performance.now() }; }, [sheet.data]);
  const nextUpdate = sheet.data?.summary.nextUpdateAt;
  const calibratedAt = sheet.data?.context.serverNow;
  useEffect(() => {
    if (!enabled || !nextUpdate || !calibratedAt) return;
    const timer = setTimeout(() => { if (document.visibilityState === 'visible') void client.invalidateQueries({queryKey:[...scope,'sheet']}, {cancelRefetch:false}); }, Math.max(1,Date.parse(nextUpdate)-Date.parse(calibratedAt)));
    return () => clearTimeout(timer);
  }, [client,scope,enabled,nextUpdate,calibratedAt]);
  useEffect(() => {
    const visible = () => { if (enabled && document.visibilityState === 'visible') void client.invalidateQueries({queryKey:[...scope,'sheet']}, {cancelRefetch:false}); };
    document.addEventListener('visibilitychange',visible);
    return () => document.removeEventListener('visibilitychange',visible);
  }, [client,scope,enabled]);
  const journals = useQuery({ ...queryOptions, queryKey: [...scope, "journals", state.journalFilters], enabled: enabled && role === 'monitor' && state.showJournals, queryFn: ({ signal }) => service.journals(state.journalFilters, signal) });
  const list = useQuery({ ...queryOptions, queryKey: [...scope, "list", state.filters], enabled: enabled && !sheetMode && role !== 'monitor', queryFn: ({ signal }) => service.list(state.filters, signal) });
  // El detalle extenso solo se trae al abrir historial/operaciones; la fila del workspace ya abre los editores.
  const detail = useQuery({ ...queryOptions, queryKey: [...scope, "detail", state.id], queryFn: ({ signal }) => service.detail(state.id!, signal), enabled: enabled && state.detail && state.id !== null });
  const config = useQuery({ ...queryOptions, queryKey: [...scope, "config"], queryFn: ({ signal }) => service.configuration(signal), enabled: enabled && role === "administrador" && (state.operation?.action === "configuration" || reportOpen) });
  const [peopleOpen, setPeopleOpen] = useState(false);
  const people = useQuery({ ...queryOptions, queryKey: [...scope, "people", state.id, peopleParams], queryFn: ({ signal }) => service.people(state.id!, peopleParams.kind, peopleParams.search, peopleParams.page, signal), enabled: enabled && state.id !== null && (peopleOpen || state.operation?.action === 'replacement') });
  const history = useQuery({ ...queryOptions, queryKey: [...scope, "history", state.id, historyPage], queryFn: ({ signal }) => service.history(state.id!, historyPage, signal), enabled: enabled && role === "administrador" && state.id !== null && showHistory });
  const alerts = useQuery({ ...queryOptions, queryKey: [...scope, "alerts", alertsPage], queryFn: ({ signal }) => service.alerts(alertsPage, signal), enabled: enabled && role !== "monitor" && showAlerts });
  const classrooms = useQuery({ ...queryOptions, queryKey: [...scope, "classes"], queryFn: ClassesApi.list, enabled: enabled && role === "administrador" && state.operation?.action === "recovery" });
  const periods = useQuery({ ...queryOptions, queryKey: [...scope, "periods"], queryFn: CatalogApi.hourSessions, enabled: enabled && role === "administrador" && state.operation?.action === "recovery" });
  const report = useQuery({ ...queryOptions, queryKey: [...scope, "report", state.filters, reportPage], queryFn: ({ signal }) => service.report({ ...state.filters, page: reportPage }, signal), enabled: enabled && role === "administrador" && reportOpen });
  const summary = useQuery({ ...queryOptions, queryKey: [...scope, "summary", state.filters], queryFn: ({ signal }) => service.summary(state.filters, signal), enabled: enabled && role === "administrador" && reportOpen });

  const rows = (sheetMode ? sheet.data?.rows ?? [] : list.data?.data ?? []) as PartRecord[];
  const sheetRow = sheet.data?.rows.find(row => row.id === state.id) ?? null;
  const selected = sheetRow ?? (detail.data?.id === state.id ? detail.data : null) ?? (state.base?.id === state.id ? state.base : null);
  const policy = (sheetRow as PartWorkspaceRow | null)?.policy ?? detail.data?.policy;
  // Un reloj de render anterior a la última sincronización no debe retroceder la hora del servidor.
  const now = serverClock.current.server + Math.max(0, clock - serverClock.current.local);
  const unavailable = (axios.isAxiosError(detail.error) && [403, 404].includes(detail.error.response?.status ?? 0)) || Boolean(sheetMode && state.id !== null && sheet.data && !sheetRow) || Boolean(selected?.deletedAt);
  const withinTime = !policy || (now >= Date.parse(policy.editOpensAt) && (now < Date.parse(policy.editDeadline) || Boolean(policy.grant && !policy.grant.revokedAt && now < Date.parse(policy.grant.expiresAt))));
  const writable = enabled && !unavailable && Boolean(selected && !selected.deletedAt && (policy ? policy.canEdit && (role === 'administrador' || withinTime) : role === "administrador" || ordinaryWritable(selected, context.accountId, now))) && !state.conflict;
  const requiresReason = role === 'administrador' || Boolean(policy?.requiresReason || (policy?.grant && now >= Date.parse(policy.editDeadline)));
  const followupRow = (selected as PartWorkspaceRow | null) ?? (rows[0] as PartWorkspaceRow | undefined);
  const followupParams = sheet.data?.selection.classId && sheet.data.selection.shiftId && (followupRow?.effectiveMonitorId ?? followupRow?.titularMonitorId)
    ? { date: sheet.data.selection.date, classId: sheet.data.selection.classId, shiftId: sheet.data.selection.shiftId, monitorId: (followupRow.effectiveMonitorId ?? followupRow.titularMonitorId)! }
    : null;
  const followup = useQuery({ ...queryOptions, queryKey: [...scope, "followup", followupParams, followupPage], enabled: enabled && state.followupOpen && Boolean(followupParams), queryFn: ({ signal }) => service.followup({ ...followupParams!, page: followupPage }, signal) });

  useEffect(() => {
    const record = (detail.data?.id === state.id ? detail.data : null) ?? sheetRow;
    if (!record || record.id !== state.id || busy) return;
    setState(previous => {
      if (!previous.base || previous.base.id !== record.id) return { ...previous, base: record, draft: toDraft(record), conflict: false };
      if (previous.base.version === record.version) return previous;
      const hasDraft = previous.draft && JSON.stringify(previous.draft) !== JSON.stringify(toDraft(previous.base));
      if (hasDraft || previous.reviewDirty || previous.operation || previous.noteComposer || Object.keys(previous.pendingFiles).length || Object.keys(previous.captureDrafts??{}).length) return previous.conflict ? previous : { ...previous, conflict: true };
      return { ...previous, base: record, draft: toDraft(record), conflict: false };
    });
  }, [detail.data, sheetRow, state.id, busy, setState]);

  // Un monitor con una sola jornada no necesita el listado previo: la selección viene de A.
  useEffect(() => {
    if (role !== 'monitor' || state.showJournals || !sheet.data?.selection.classId || !sheet.data.selection.shiftId) return;
    const { date, classId, shiftId } = sheet.data.selection;
    // No reescribir la clave con classId/shiftId: el servidor ya eligió el recurso y
    // un cambio de clave provocaría una segunda lectura A en el montaje.
    if (state.filters.from === date && state.filters.to === date && state.journal?.classId === classId) return;
    setState(previous => ({
      ...previous,
      filters: { ...previous.filters, from: date, to: date, page: 1, limit: 100 },
      journal: previous.journal ?? {
        date, classId, shiftId,
        className: sheet.data.options.classes.find(clas => clas.id === classId)?.name ?? null,
        shift: sheet.data.options.shifts.find(item => item.id === shiftId)?.name ?? null,
        scheduledStart: sheet.data.rows[0]?.scheduledStart ?? new Date().toISOString(),
        scheduledEnd: sheet.data.rows.at(-1)?.scheduledEnd ?? new Date().toISOString(),
        blocks: sheet.data.selection.blocks,
      },
    }));
  }, [role, sheet.data, state.showJournals, state.filters, state.journal?.classId, setState]);

  // La configuración solo se consulta al abrir su operación o el reporte, no al montar la hoja.
  useEffect(() => {
    if (state.operation?.action !== 'configuration' || state.configVersion !== null || !config.data) return;
    const loaded = config.data;
    setState(s => ({
      ...s,
      configVersion: loaded.version,
      operation: s.operation?.action === 'configuration'
        ? { ...operationDraft('configuration', s.operationBase, loaded), reason: s.operation.reason }
        : s.operation,
    }));
  }, [config.data, state.operation?.action, state.configVersion, setState]);

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const thumbnailCache = useRef(new Map<string, string>());
  const [visibleCaptures, setVisibleCaptures] = useState<string[]>([]);
  const [thumbnailAttempt, setThumbnailAttempt] = useState(0);
  const onVisibleCaptures = useCallback((next: string[]) => setVisibleCaptures(previous => previous.join('|') === next.join('|') ? previous : next), []);
  const captureKey = rows.flatMap(row => [
    row.initialFileId && row.initialCapture?.generation ? `${row.id}:initial:${row.initialFileId}:${row.initialCapture.generation}` : "",
    row.finalFileId && row.finalCapture?.generation ? `${row.id}:final:${row.finalFileId}:${row.finalCapture.generation}` : "",
  ]).filter(Boolean).join("|");
  useEffect(() => {
    if (!enabled || document.visibilityState !== 'visible') return;
    const refs = rows.flatMap(row => {
      const list = [] as { recordId: number; slot: Slot; fileId: string; generation: string }[];
      if (row.initialFileId && row.initialCapture?.generation) list.push({ recordId: row.id, slot: 'initial', fileId: row.initialFileId, generation: row.initialCapture.generation });
      if (row.finalFileId && row.finalCapture?.generation) list.push({ recordId: row.id, slot: 'final', fileId: row.finalFileId, generation: row.finalCapture.generation });
      return list.filter(ref => visibleCaptures.includes(`${ref.recordId}:${ref.slot}`));
    });
    const missing = refs.filter(ref => !thumbnailCache.current.has(`${ref.fileId}:${ref.generation}`));
    if (!missing.length) return;
    const controller = new AbortController();
    void (async () => {
      for (let index = 0; index < missing.length; index += 32) {
        const result = await service.thumbnails(missing.slice(index, index + 32), controller.signal);
        if (!alive.current || controller.signal.aborted) return;
        const next: Record<string, string> = {};
        for (const item of result.data) {
          if (item.status === "AVAILABLE" && item.content && item.contentType) {
            const url = `data:${item.contentType};base64,${item.content}`;
            thumbnailCache.current.set(`${item.fileId}:${item.generation}`, url);
            next[item.fileId] = url;
          } else {
            thumbnailCache.current.delete(`${item.fileId}:${item.generation}`);
          }
        }
        if (Object.keys(next).length) setThumbnails(previous => ({ ...previous, ...next }));
      }
    })().catch(cause => { if (!controller.signal.aborted && alive.current) setError(apiErrorMessage(cause, "No se pudieron cargar las miniaturas.")); });
    return () => controller.abort();
    // La clave resume las referencias; evita una descarga por render o por cada nota.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureKey, enabled, visibleCaptures, thumbnailAttempt]);

  const failures = [journals.error, list.error, sheet.error, detail.error, config.error, people.error, history.error, alerts.error, classrooms.error, periods.error, report.error, summary.error, followup.error];
  const failure = failures.find(Boolean);
  const contextFailure = failures.find(e => axios.isAxiosError(e) && e.response?.data?.code === "CLASS_SESSION_CONTEXT_CHANGED");
  useEffect(() => { if (contextFailure) onContextChanged(); }, [contextFailure, onContextChanged]);

  const refresh = async () => { await client.invalidateQueries({ queryKey: [...scope, "sheet"] }); await client.invalidateQueries({ queryKey: [...scope, "list"] }); await client.invalidateQueries({ queryKey: [...scope, "followup"] }); };
  const run = async (work: () => Promise<void>) => {
    if (running.current || busy || !enabled) return false;
    running.current = true; setState(s => ({ ...s, inFlight: true })); setError(""); setNotice("");
    try { await work(); return true; }
    catch (cause) {
      if (!alive.current) return false;
      if (axios.isAxiosError(cause) && cause.response?.data?.code === "CLASS_SESSION_CONTEXT_CHANGED") { onContextChanged(); setError("La cuenta o el proceso cambió. El borrador se conserva aislado. Comprueba el historial antes de repetir: el conflicto también puede ocurrir al actualizar la vista después de una escritura."); }
      else if (axios.isAxiosError(cause) && cause.response?.status === 409) {
        setState(s => ({ ...s, conflict: true }));
        await client.invalidateQueries({ queryKey: [...scope, "sheet"] });
        if (state.detail) await detail.refetch();
        if (state.operation?.action === "configuration") await config.refetch();
        setError("Conflicto: se conserva tu borrador. Revisa la versión del servidor y descarta explícitamente antes de continuar. No se reintentó la operación.");
      } else {
        setError(apiErrorMessage(cause, cause instanceof Error ? cause.message : undefined));
        if (axios.isAxiosError(cause) && cause.response?.status === 403 && state.detail) await detail.refetch();
      }
      if (axios.isAxiosError(cause) && cause.response?.status === 401) { void client.invalidateQueries({ queryKey: ["me"] }); }
      return false;
    } finally { running.current = false; setState(s => ({ ...s, inFlight: false })); }
  };
  const canLeave = () => {
    if (running.current || pending) { setError("Hay un borrador, revisión, operación o subida pendiente. Guarda, asocia o descarta explícitamente antes de cambiar de parte o filtros."); return false; }
    setError(""); return true;
  };
  const requireRecord = () => {
    if (!state.base || !selected || state.base.id !== state.id) throw new Error("Carga primero el detalle del parte.");
    if (state.conflict || state.base.version !== selected.version) throw new Error("Resuelve primero el conflicto de versión.");
    return state.base;
  };
  const applySaved = async (record: PartRecord, clearDraft = true, savedFields?: (keyof RecordDraft)[]) => {
    if (!alive.current) return;
    if (state.detail) client.setQueryData([...scope, "detail", record.id], record);
    client.setQueriesData<PartWorkspace>({ queryKey: [...scope, 'sheet'] }, previous => previous ? { ...previous, rows: previous.rows.map(row => row.id === record.id ? { ...row, ...record } as PartWorkspaceRow : row) } : previous);
    setState(s => {
      const original = s.base ? toDraft(s.base) : null;
      const remaining = original && s.draft ? Object.fromEntries(Object.keys(original).filter(key => key !== 'reason' && !savedFields?.includes(key as keyof RecordDraft) && JSON.stringify(original[key as keyof RecordDraft]) !== JSON.stringify(s.draft![key as keyof RecordDraft])).map(key => [key, s.draft![key as keyof RecordDraft]])) : {};
      return { ...s, base: record, draft: clearDraft ? { ...toDraft(record), ...(savedFields ? remaining : {}) } : s.draft, conflict: false };
    });
  };
  const reloadRecord = async (): Promise<PartRecord | null> => {
    if (!state.id) return null;
    const fresh = await sheet.refetch();
    const row = fresh.data?.rows.find(item => item.id === state.id);
    if (row) return row;
    const current = await service.detail(state.id);
    if (state.detail) client.setQueryData([...scope, "detail", state.id], current);
    return current;
  };
  const acceptRecord = async (clearDraft: boolean) => {
    const current = await reloadRecord();
    if (!current) return null;
    setState(s => ({ ...s, base: current, draft: clearDraft ? toDraft(current) : s.draft, conflict: false }));
    await refresh();
    return current;
  };
  const loadImage = (id: string) => {
    if (imageUrls.current.has(id) || imageRequests.current.has(id) || !enabled) return;
    const controller = new AbortController(); imageRequests.current.set(id, controller);
    void service.content(id, controller.signal).then(blob => {
      if (!alive.current || controller.signal.aborted) return;
      const url = URL.createObjectURL(blob); imageUrls.current.set(id, url); setImages(previous => ({ ...previous, [id]: url }));
    }).catch(cause => { if (!controller.signal.aborted && alive.current) setError(apiErrorMessage(cause, "No se pudo cargar la imagen.")); }).finally(() => imageRequests.current.delete(id));
  };

  return {
    journal: state.journal, journals: journals.data ?? null, journalFilters: state.journalFilters, journalsLoading: journals.isFetching,
    onJournalFilters: filters => {
      if (!canLeave()) return;
      try { validateRange(filters.from, filters.to); setState(s => ({ ...s, journalFilters: filters })); }
      catch (cause) { setError((cause as Error).message); }
    },
    onOpenJournal: journal => {
      if (!canLeave()) return;
      setState(s => ({ ...s, journal, showJournals: false, sheetFilters: { date: journal.date, classId: journal.classId, shiftId: journal.shiftId }, filters: { from: journal.date, to: journal.date, classId: journal.classId, shiftId: journal.shiftId, page: 1, limit: 100 }, id: null, base: null, draft: null, detail: false }));
    },
    onCloseJournal: () => {
      if (canLeave()) setState(s => ({ ...s, showJournals: false, id: null, base: null, draft: null, detail: false }));
    },
    onShowJournals: show => {
      if (!canLeave()) return;
      setState(s => ({ ...s, showJournals: show, id: null, base: null, draft: null, detail: false }));
    },
    onSheet: selection => {
      if (!canLeave()) return;
      setState(s => ({ ...s, journal: null, showJournals: false, sheetFilters: selection, filters: { ...s.filters, from: selection.date, to: selection.date, classId: selection.classId, shiftId: selection.shiftId, page: 1, limit: 100 }, id: null, base: null, draft: null, detail: false, conflict: false }));
    },
    role, process: context.process, filters: state.filters, rows, total: sheetMode ? rows.length : list.data?.total ?? 0,
    editableRecordIds: rows.filter(row => enabled && !row.deletedAt && ((row as PartWorkspaceRow).policy?.canEdit ?? (role === 'administrador' || (role === 'monitor' && ordinaryWritable(row, context.accountId, now))))).map(row => row.id),
    incompleteRecordIds: rows.filter(row => !row.deletedAt && row.completeness === 'INCOMPLETE' && now >= Date.parse(row.scheduledEnd)).map(row => row.id),
    loading: sheet.isFetching || list.isFetching || (state.detail && detail.isLoading), busy, error: error || (failure ? apiErrorMessage(failure, failure instanceof Error ? failure.message : undefined) : ""), notice,
    selected, base: state.base, draft: state.draft, dirty, conflict: state.conflict, unavailable, writable,
    requiresReason,
    sheet: sheet.data ?? null,
    thumbnails,
    serverNow: now,
    onVisibleCaptures,
    onRetryThumbnails: () => setThumbnailAttempt(value=>value+1),
    captureDrafts: state.captureDrafts ?? {},
    noteComposer: state.noteComposer ?? null,
    onNoteComposer: noteComposer => { if (!busy && writable) setState(s => ({ ...s, noteComposer })); },
    followupDraft: state.followupDraft ?? {text:'',reason:'',editing:null},
    onFollowupDraft: patch => { if (!busy) setState(s => ({ ...s, followupDraft: {text:'',reason:'',editing:null,...s.followupDraft,...patch} })); },
    onPrepareCapture: (slot, file) => { if (!busy && writable) setState(s => { const pendingFiles={...s.pendingFiles};delete pendingFiles[slot];return { ...s, pendingFiles, captureDrafts: { ...s.captureDrafts, [slot]: { file, remove: !file } } }; }); },
    onDiscardCapture: slot => { if (!busy) setState(s => { const captureDrafts = { ...s.captureDrafts }, pendingFiles = { ...s.pendingFiles }; delete captureDrafts[slot]; delete pendingFiles[slot]; return { ...s, captureDrafts, pendingFiles, draft: s.draft ? { ...s.draft, reason: '' } : null }; }); },
    onDiscardEditor: editor => { if (!busy && state.base) setState(s => ({ ...s, ...(editor === 'observations' ? {noteComposer:null} : {}), draft: s.base && s.draft ? { ...s.draft, ...Object.fromEntries(editorFields[editor].map(key => [key, toDraft(s.base!)[key]])), reason: '' } : s.draft })); },
    onSaveCapture: slot => run(async () => {
      const base = requireRecord(), capture = state.captureDrafts?.[slot];
      if (!writable || !capture || state.operation) throw new Error('No hay una captura preparada o la edición cerró.');
      const reason = state.draft?.reason ?? '';
      if (requiresReason) requireReason(reason);
      let saved: PartRecord;
      if (capture.remove) saved = await service.detach(base.id, slot, base.version, reason);
      else {
        if (!capture.file) throw new Error('Selecciona una captura PNG.');
        let uploaded = state.pendingFiles[slot];
        if (!uploaded) {
          uploaded = await service.upload(base.id, capture.file, role === 'administrador', reason);
          setState(s => ({ ...s, pendingFiles: { ...s.pendingFiles, [slot]: uploaded } }));
        }
        saved = await service.associate(base.id, slot, uploaded.id, base.version, role === 'administrador', reason);
      }
      setState(s => { const captureDrafts = { ...s.captureDrafts }, pendingFiles = { ...s.pendingFiles }; delete captureDrafts[slot]; delete pendingFiles[slot]; return { ...s, captureDrafts, pendingFiles }; });
      await applySaved(saved, false);
      setState(s => ({ ...s, draft: s.draft ? { ...s.draft, reason: '' } : null }));
      setNotice(capture.remove ? 'Captura retirada del parte; el original y el historial se conservan.' : 'Captura guardada y asociada.');
    }),
    followup: (followup.data?.data ?? sheet.data?.monitorFollowup?.observations ?? []) as MonitorObservation[],
    followupTotal: followup.data?.total ?? sheet.data?.monitorFollowup?.total ?? 0,
    followupLoading: followup.isFetching,
    followupOpen: state.followupOpen,
    followupPage,
    onFollowupPage: setFollowupPage,
    onFollowupUpdate: (id, version, text) => run(async () => {
      if (!followupParams) throw new Error('Selecciona una jornada con monitor.');
      await service.followupUpdate(id, { ...followupParams, text, expectedVersion: version });
      await client.invalidateQueries({ queryKey: [...scope, 'followup'] });
      setNotice('Nota privada actualizada.');
    }),
    showJournals: state.showJournals,
    writeLimit: selected ? selected.deletedAt ? "Parte anulado; restaura antes de corregir evidencias." : role === "administrador" ? "Corrección extraordinaria con motivo; conserva el cierre original." : policy?.grant ? `Habilitación vigente hasta ${new Date(policy.grant.expiresAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima); cada guardado exige motivo. El cierre original no cambia.` : now < editStartsAt(selected) ? "Edición aún no habilitada. El primer bloque abre 5 minutos antes del turno; los siguientes, al comenzar." : writable ? `Edición disponible. Cierre original: ${new Date(selected.editDeadline).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima).` : "Edición cerrada: solo administración puede corregir el parte con un motivo. El cierre es 90 minutos después del último bloque del turno." : "",
    review: state.review, reviewDirty: state.reviewDirty, pendingFiles: state.pendingFiles, images,
    history: (history.data ?? []) as AuditEvent[], historyPage, historyLoading: history.isFetching,
    alerts: (alerts.data ?? []) as PartAlert[], alertsPage, config: config.data ?? null,
    operation: state.operation, operationOpen, selectedIds: (state.operation ? state.operationTargets : state.targets).map(r => r.id),
    people: people.data?.data ?? [], peopleTotal: people.data?.total ?? 0, peopleLoading: people.isFetching,
    peoplePage: peopleParams.page, peopleSearch: peopleParams.search, peopleKind: peopleParams.kind,
    classrooms: classrooms.data ?? [], periods: periods.data ?? [], report: report.data ?? null, summary: summary.data ?? null, reportOpen,
    onFilters: filters => {
      if (!canLeave()) return;
      try { validateRange(filters.from, filters.to); setState(s => ({ ...s, filters, sheetFilters: null, id: null, base: null, draft: null, detail: false })); setReportOpen(false); }
      catch (cause) { setError((cause as Error).message); }
    },
    onRefresh: () => { void sheet.refetch(); },
    onSelect: (id, withDetail = false) => { if (id === state.id && state.detail === withDetail) return; if (id !== state.id && !canLeave()) return; setState(s => ({ ...s, id, base: id === s.id ? s.base : null, draft: id === s.id ? s.draft : null, detail: withDetail, conflict: id === s.id ? s.conflict : false, review: blankReview(), reviewDirty: false })); setShowHistory(false); setHistoryPage(1); },
    onDraft: patch => { if (!busy && writable && !state.operation) setState(s => ({ ...s, draft: s.draft ? { ...s.draft, ...patch, ...(patch.classState && patch.classState !== "RN" && patch.classState !== "RE" ? { replacementEmail: "" } : {}), ...(patch.classState === "SD" ? {actualStart:"",actualEnd:""} : {}) } : null })); },
    onSave: editor => run(async () => {
      const base = requireRecord(); if (!state.draft || !writable || state.operation) throw new Error("El registro no admite edición o tiene una operación pendiente.");
      const draft = editor ? editorDraft(base, state.draft, editor) : {...toDraft(base),effectiveTeacherId:state.draft.effectiveTeacherId,effectiveMonitorId:state.draft.effectiveMonitorId,reason:state.draft.reason};
      const proposing = Boolean(draft.replacementEmail.trim());
      const signature = JSON.stringify([base.id, draft.classState, draft.replacementEmail.trim().toLowerCase(), draft.reason.trim()]);
      const operation = state.proposalOperation?.signature === signature ? state.proposalOperation : { signature, id: crypto.randomUUID() };
      if (proposing) setState(s => ({ ...s, proposalOperation: operation }));
      const saved = await service.update(base.id, updatePayload(base, draft, role === "administrador", requiresReason, operation.id), role === "administrador");
      await applySaved(saved, true, editor ? editorFields[editor] : ['effectiveTeacherId','effectiveMonitorId']);
      setNotice(saved.observationWarning ?? (proposing ? "Propuesta registrada como pendiente. Solo administración autoriza el reemplazo; no confirma el dictado." : "Cambios guardados."));
    }),
    onDiscard: () => void run(async () => {
      let removed = false;
      if (state.operation?.action === "configuration") await config.refetch();
      if (state.id) {
        try { removed = Boolean((await acceptRecord(true))?.deletedAt); }
        catch (cause) {
          if (!axios.isAxiosError(cause) || ![403, 404].includes(cause.response?.status ?? 0)) throw cause;
          // El usuario pidió descartar: no depender de poder volver a leer un recurso retirado.
          removed = true;
        }
      }
      setState(s => ({
        ...s,
        ...(removed ? { id: null, base: null, draft: null, detail: false } : {}),
        pendingFiles: {},
        captureDrafts: {}, noteComposer: null,
        conflict: false, operation: null, operationBase: null, operationTargets: [], targets: [], review: blankReview(), reviewDirty: false,
      })); setOperationOpen(false);
      setNotice(removed ? "Se descartaron los borradores y referencias locales del parte no disponible. No se borró ningún archivo del servidor." : "Se cargó la versión del servidor y se descartaron los borradores y referencias locales de subidas. Los archivos no se borran del servidor.");
    }),
    onReview: patch => { if (!busy && role === "supervisor") setState(s => ({ ...s, review: { ...s.review, ...patch }, reviewDirty: true })); },
    onSubmitReview: () => void run(async () => {
      const base = requireRecord(); if (role !== "supervisor" || !state.review.confirmed) throw new Error("Confirma explícitamente la revisión de esta versión.");
      await service.operation(`${base.id}/reviews`, { expectedVersion: base.version, ...state.review });
      setState(s => ({ ...s, review: blankReview(), reviewDirty: false })); await refresh(); setNotice("Revisión registrada para esta versión.");
    }),
    onDiscardReview: () => { if (!busy) setState(s => ({ ...s, review: blankReview(), reviewDirty: false })); },
    onUpload: (slot, file) => void run(async () => {
      const base = requireRecord(); if (!writable || state.operation) throw new Error("La edición está cerrada o tiene una operación pendiente.");
      if (file.size > 10 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".png")) throw new Error("Selecciona un PNG de hasta 10 MiB. El servidor validará estructura, dimensiones y formato.");
      if (requiresReason) requireReason(state.draft?.reason ?? "");
      const uploaded = await service.upload(base.id, file, role === "administrador", requiresReason ? state.draft?.reason ?? "" : "");
      setState(s => ({ ...s, pendingFiles: { ...s.pendingFiles, [slot]: uploaded } }));
      setNotice("Archivo subido, todavía sin asociar. Usa Asociar captura para registrarlo.");
    }),
    onAssociate: slot => void run(async () => {
      const base = requireRecord(), file = state.pendingFiles[slot];
      if (!file || !writable || state.operation) throw new Error("No hay una subida asociable, el plazo cerró o hay una operación pendiente.");
      if (state.draft && JSON.stringify({ ...state.draft, reason: "" }) !== JSON.stringify(toDraft(base))) throw new Error("Guarda o descarta los cambios del registro antes de asociar una captura.");
      if (requiresReason) requireReason(state.draft?.reason ?? "");
      const saved = await service.associate(base.id, slot, file.id, base.version, role === "administrador", requiresReason ? state.draft?.reason ?? "" : "");
      setState(s => { const pendingFiles = { ...s.pendingFiles }; delete pendingFiles[slot]; return { ...s, pendingFiles }; });
      await applySaved(saved); setNotice("Captura asociada. El cierre original no cambió.");
    }),
    onDetach: slot => void run(async () => {
      const base = requireRecord();
      if (!writable || state.operation) throw new Error("La edición está cerrada o tiene una operación pendiente.");
      if (requiresReason) requireReason(state.draft?.reason ?? "");
      const saved = await service.detach(base.id, slot, base.version, requiresReason ? state.draft?.reason ?? "" : "");
      await applySaved(saved);
      setNotice("Captura retirada del parte. El archivo y el historial se conservan.");
    }),
    onDiscardUpload: slot => { if (!busy) setState(s => { const pendingFiles = { ...s.pendingFiles }; delete pendingFiles[slot]; return { ...s, pendingFiles }; }); },
    onLoadImage: loadImage,
    onHistory: page => { if(role!=="administrador") return; setShowHistory(true); setHistoryPage(page); void history.refetch(); },
    onAlerts: page => { setShowAlerts(true); setAlertsPage(page); if (showAlerts && alertsPage === page) void alerts.refetch(); },
    onAcknowledge: id => void run(async () => { await service.operation(`alerts/${id}/acknowledge`, {}); await alerts.refetch(); setNotice("Acuse registrado. La alerta no se considera resuelta por este acuse."); }),
    onPeople: (kind, search, page) => { if (search.length <= 100) { setPeopleOpen(true); setPeopleParams({ kind, search, page }); } },
    onToggleTarget: id => { if (busy || state.operation) { setError("Los destinos están fijados en el borrador de la operación. Descártalo para cambiar la selección."); return; } const row = rows.find(r => r.id === id); if (row) setState(s => ({ ...s, targets: s.targets.some(r => r.id === id) ? s.targets.filter(r => r.id !== id) : s.targets.length < 200 ? [...s.targets, row] : s.targets })); },
    onOperation: action => {
      if (busy || state.conflict) return;
      if (role !== "administrador" && !(role === "supervisor" && (action === "replacement" || action === 'resolve'))) return;
      if (state.operation) { if (state.operation.action === action) setOperationOpen(true); else setError("Continúa o descarta la operación pendiente antes de iniciar otra."); return; }
      if (dirty) { setError("Guarda o descarta los cambios del registro antes de iniciar una operación."); return; }
      if (action !== "configuration" && !state.base && !((action === "cancel" || action === "restore") && state.targets.length)) { setError("Selecciona primero un parte."); return; }
      const record = selected ?? state.base;
      const draft = operationDraft(action, record, config.data ?? null);
      if (role === "supervisor" && action === "replacement") draft.kind = "MONITOR";
      if (role === 'supervisor' && action === 'resolve') { draft.kind = 'MONITOR'; draft.status = 'REVOKED'; draft.coverageId = String(record?.coverages.find(coverage => coverage.kind === 'MONITOR' && coverage.status === 'AUTHORIZED')?.id ?? ''); }
      setState(s => ({ ...s, operation: draft, operationBase: record, operationTargets: s.targets.length ? [...s.targets] : record ? [record] : [], configVersion: config.data?.version ?? null }));
      setOperationOpen(true); setError("");
    },
    onOperationDraft: patch => { if (!busy) setState(s => ({ ...s, operation: s.operation ? { ...s.operation, ...patch, operationId: crypto.randomUUID() } : null })); },
    onCloseOperation: () => { if (!busy) setOperationOpen(false); },
    onDiscardOperation: () => { if (!busy) { setState(s => ({ ...s, operation: null, operationBase: null })); setOperationOpen(false); } },
    onSubmitOperation: () => void run(async () => {
      const op = state.operation, base = state.operationBase;
      if (!op || state.conflict) throw new Error("Carga y revisa primero la operación."); requireReason(op.reason);
      if (dirty) throw new Error("Descarta la operación para continuar con los cambios del registro.");
      const reason = op.reason.trim(), expectedVersion = base?.version;
      if (op.action === "configuration") {
        if (!config.data || state.configVersion === null) throw new Error("La configuración no está disponible.");
        await service.operation("configuration", configPayload({ ...config.data, version: state.configVersion }, op), "patch");
      } else if (op.action === "cancel" || op.action === "restore") {
        // ponytail: no API masiva para anular/restaurar; operaciones separadas, progreso explícito y sin reintentos.
        for (const target of state.operationTargets) {
          try { await service.operation(`${target.id}/${op.action}`, { expectedVersion: target.version, reason }); }
          catch (cause) { if (alive.current) setNotice(`Parte #${target.id} no confirmado. El lote se detuvo; los destinos ya procesados se conservaron y se retiraron de la selección. No se reintentó ningún destino.`); throw cause; }
          setState(s => ({ ...s, operationTargets: s.operationTargets.filter(r => r.id !== target.id), targets: s.targets.filter(r => r.id !== target.id) }));
          if (alive.current) setNotice(`Parte #${target.id} procesado. Cada parte es una operación independiente.`);
        }
      } else {
        if (!base) throw new Error("Selecciona primero un parte.");
        if (op.action === "replacement") {
          if (!op.personId) throw new Error("Selecciona la persona reemplazante.");
          await service.operation("replacements", { operationId: op.operationId, targets: state.operationTargets.map(r => ({ recordId: r.id, expectedVersion: r.version })), kind: role === "supervisor" ? "MONITOR" : op.kind, personId: op.personId, mode: op.mode, reason });
        } else if (op.action === "resolve") await service.operation(`replacements/${Number(op.coverageId)}/resolve`, { expectedVersion, status: op.status, reason });
        else if (op.action === "grant") {
          if (!op.accountId || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(op.expiresAt)) throw new Error("Define un vencimiento válido en Lima.");
          await service.operation(`${base.id}/grants`, { expectedVersion, accountId: op.accountId, expiresAt: `${op.expiresAt}:00-05:00`, reason });
        } else if (op.action === "revoke") await service.operation(`grants/${Number(op.grantId)}/revoke`, { expectedVersion, reason });
        else if (op.action === "recovery") await service.operation("recoveries", { originalRecordId: base.id, classId: op.classId, hourSessionId: Number(op.hourSessionId), date: academicDate(op.date), reason });
      }
      setState(s => ({ ...s, operation: null, operationBase: null, targets: [], operationTargets: [] })); setOperationOpen(false);
      if (state.id && op.action !== "configuration") await acceptRecord(true); else await refresh();
      setNotice("Operación registrada. Autorización y ejecución se mantienen separadas; no cambió el cierre original.");
    }),
    onFollowup: open => { if (!busy) setState(s => ({ ...s, followupOpen: open })); },
    onFollowupCreate: text => run(async () => {
      if (!followupParams) throw new Error("Selecciona una jornada con monitor registrado.");
      await service.followupCreate({ ...followupParams, text });
      await refresh();
      setNotice("Nota privada registrada. No se envía al monitor ni crea un antecedente formal.");
    }),
    onFollowupWithdraw: (id, version, reason) => run(async () => {
      if (!followupParams) throw new Error("Selecciona una jornada con monitor registrado.");
      await service.followupWithdraw(id, { ...followupParams, expectedVersion: version, reason });
      await refresh();
      setNotice("Nota privada retirada lógicamente; su historial se conserva.");
    }),
    onReport: page => { setReportPage(page); setReportOpen(true); }, onCloseReport: () => setReportOpen(false),
  };
}
