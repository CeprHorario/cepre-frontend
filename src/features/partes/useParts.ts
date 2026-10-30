import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useBlocker } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiErrorMessage } from "@/api/client";
import { CatalogApi, ClassesApi } from "@/api/services";
import { useAuth } from "@/auth/AuthProvider";
import { academicDate, configPayload, limaDate, operationDraft, ordinaryWritable, requireReason, toDraft, updatePayload, validateRange } from "./model";
import { createPartsApi } from "./service";
import type { AuditEvent, OperationDraft, PartAlert, PartContext, PartFilters, PartRecord, PartRole, PartsViewProps, RecordDraft, ReviewDraft, Slot, UploadedCapture } from "./types";

const blankReview = (): ReviewDraft => ({ result: "CONFORMING", comments: "", confirmed: false });
export interface Workspace {
  inFlight: boolean;
  filters: PartFilters; id: number | null; base: PartRecord | null; draft: RecordDraft | null;
  review: ReviewDraft; reviewDirty: boolean; pendingFiles: Partial<Record<Slot, UploadedCapture>>;
  conflict: boolean; operation: OperationDraft | null; operationBase: PartRecord | null;
  configVersion: number | null; targets: PartRecord[]; operationTargets: PartRecord[];
}
function freshWorkspace(): Workspace {
  const date = limaDate();
  return { inFlight: false, filters: { from: date, to: date, page: 1, limit: 25 }, id: null, base: null, draft: null, review: blankReview(), reviewDirty: false, pendingFiles: {}, conflict: false, operation: null, operationBase: null, configVersion: null, targets: [], operationTargets: [] };
}

/** Estado de trabajo separado de la caché del servidor. Solo memoria, nunca Web Storage. */
export function useParts(context: PartContext, role: PartRole, onContextChanged: () => void): PartsViewProps {
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
  const [peopleParams, setPeopleParams] = useState({ kind: "TEACHER" as "TEACHER" | "MONITOR", search: "", page: 1 });
  const [images, setImages] = useState<Record<string, string>>({});
  const imageUrls = useRef(new Map<string, string>());
  const imageRequests = useRef(new Map<string, AbortController>());
  const [clock, setClock] = useState(Date.now());
  const serverClock = useRef({ server: Date.parse(context.serverNow), local: Date.now() });
  const enabled = !status?.maintenance || role === "administrador";
  const dirty = Boolean(state.base && state.draft && JSON.stringify(toDraft(state.base)) !== JSON.stringify(state.draft));
  const pending = dirty || state.reviewDirty || Boolean(state.operation) || Object.keys(state.pendingFiles).length > 0;
  const blocker = useBlocker(pending || busy);

  useEffect(() => { client.setQueryDefaults(workspaceKey, { gcTime: Infinity }); if (!client.getQueryData(workspaceKey)) client.setQueryData(workspaceKey, initialWorkspace.current); }, [client, workspaceKey]);
  useEffect(() => { serverClock.current = { server: Date.parse(context.serverNow), local: Date.now() }; }, [context.serverNow]);
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
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

  const queryOptions = { retry: false as const, staleTime: 0, enabled };
  const list = useQuery({ ...queryOptions, queryKey: [...scope, "list", state.filters], queryFn: async ({ signal }) => {
    // La agenda prepara solo bloques futuros del día; el listado aporta paginación y filtros.
    if (state.filters.from === limaDate() && state.filters.to === state.filters.from) await service.agenda(state.filters.from, signal);
    return service.list(state.filters, signal);
  } });
  const detail = useQuery({ ...queryOptions, queryKey: [...scope, "detail", state.id], queryFn: ({ signal }) => service.detail(state.id!, signal), enabled: enabled && state.id !== null, refetchOnWindowFocus: true, refetchInterval: 30_000 });
  const config = useQuery({ ...queryOptions, queryKey: [...scope, "config"], queryFn: ({ signal }) => service.configuration(signal), enabled: enabled && role === "administrador" });
  const people = useQuery({ ...queryOptions, queryKey: [...scope, "people", state.id, peopleParams], queryFn: ({ signal }) => service.people(state.id!, peopleParams.kind, peopleParams.search, peopleParams.page, signal), enabled: enabled && state.id !== null });
  const history = useQuery({ ...queryOptions, queryKey: [...scope, "history", state.id, historyPage], queryFn: ({ signal }) => service.history(state.id!, historyPage, signal), enabled: enabled && state.id !== null && showHistory });
  const alerts = useQuery({ ...queryOptions, queryKey: [...scope, "alerts", alertsPage], queryFn: ({ signal }) => service.alerts(alertsPage, signal), enabled: enabled && role !== "monitor" && showAlerts });
  const classrooms = useQuery({ ...queryOptions, queryKey: [...scope, "classes"], queryFn: ClassesApi.list, enabled: enabled && role === "administrador" && state.operation?.action === "recovery" });
  const periods = useQuery({ ...queryOptions, queryKey: [...scope, "periods"], queryFn: CatalogApi.hourSessions, enabled: enabled && role === "administrador" && state.operation?.action === "recovery" });
  const report = useQuery({ ...queryOptions, queryKey: [...scope, "report", state.filters, reportPage], queryFn: ({ signal }) => service.report({ ...state.filters, page: reportPage }, signal), enabled: enabled && role === "administrador" && reportOpen });
  const summary = useQuery({ ...queryOptions, queryKey: [...scope, "summary", state.filters], queryFn: ({ signal }) => service.summary(state.filters, signal), enabled: enabled && role === "administrador" && reportOpen });

  const selected = detail.data ?? (state.base?.id === state.id ? state.base : null);
  const now = serverClock.current.server + clock - serverClock.current.local;
  const unavailable = axios.isAxiosError(detail.error) && [403, 404].includes(detail.error.response?.status ?? 0);
  const writable = enabled && !unavailable && Boolean(selected && !selected.deletedAt && (role === "administrador" || ordinaryWritable(selected, context.accountId, now))) && !state.conflict;

  useEffect(() => {
    const record = detail.data;
    if (!record || record.id !== state.id || busy) return;
    setState(previous => {
      if (!previous.base || previous.base.id !== record.id) return { ...previous, base: record, draft: toDraft(record), conflict: false };
      if (previous.base.version === record.version) return previous;
      const hasDraft = previous.draft && JSON.stringify(previous.draft) !== JSON.stringify(toDraft(previous.base));
      if (hasDraft || previous.reviewDirty || previous.operation || Object.keys(previous.pendingFiles).length) return previous.conflict ? previous : { ...previous, conflict: true };
      return { ...previous, base: record, draft: toDraft(record), conflict: false };
    });
  }, [detail.data, state.id, busy, setState]);

  const failures = [list.error, detail.error, config.error, people.error, history.error, alerts.error, classrooms.error, periods.error, report.error, summary.error];
  const contextFailure = failures.find(e => axios.isAxiosError(e) && e.response?.data?.code === "CLASS_SESSION_CONTEXT_CHANGED");
  useEffect(() => { if (contextFailure) onContextChanged(); }, [contextFailure, onContextChanged]);

  const refresh = async () => { await client.invalidateQueries({ queryKey: scope, predicate: q => q.queryKey[3] !== "workspace" }); };
  const run = async (work: () => Promise<void>) => {
    if (running.current || busy || !enabled) return;
    running.current = true; setState(s => ({ ...s, inFlight: true })); setError(""); setNotice("");
    try { await work(); }
    catch (cause) {
      if (!alive.current) return;
      if (axios.isAxiosError(cause) && cause.response?.data?.code === "CLASS_SESSION_CONTEXT_CHANGED") { onContextChanged(); setError("La cuenta o el proceso cambió. El borrador se conserva aislado. Comprueba el historial antes de repetir: el conflicto también puede ocurrir al actualizar la vista después de una escritura."); }
      else if (axios.isAxiosError(cause) && cause.response?.status === 409) {
        setState(s => ({ ...s, conflict: true }));
        await client.invalidateQueries({ queryKey: [...scope, "list"] });
        if (state.id) await detail.refetch();
        if (state.operation?.action === "configuration") await config.refetch();
        setError("Conflicto: se conserva tu borrador. Revisa la versión del servidor y descarta explícitamente antes de continuar. No se reintentó la operación.");
      } else {
        setError(apiErrorMessage(cause, cause instanceof Error ? cause.message : undefined));
        if (axios.isAxiosError(cause) && cause.response?.status === 403 && state.id) await detail.refetch();
      }
      if (axios.isAxiosError(cause) && cause.response?.status === 401) { void client.invalidateQueries({ queryKey: ["me"] }); }
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
  const acceptRecord = async (clearDraft: boolean) => {
    if (!state.id) return;
    const current = await service.detail(state.id);
    if (!alive.current) return;
    client.setQueryData([...scope, "detail", state.id], current);
    setState(s => ({ ...s, base: current, draft: clearDraft ? toDraft(current) : s.draft, conflict: false }));
    await refresh();
  };
  const loadImage = (id: string) => {
    if (imageUrls.current.has(id) || imageRequests.current.has(id) || !enabled) return;
    const controller = new AbortController(); imageRequests.current.set(id, controller);
    void service.content(id, controller.signal).then(blob => {
      if (!alive.current || controller.signal.aborted) return;
      const url = URL.createObjectURL(blob); imageUrls.current.set(id, url); setImages(previous => ({ ...previous, [id]: url }));
    }).catch(cause => { if (!controller.signal.aborted && alive.current) setError(apiErrorMessage(cause, "No se pudo cargar la imagen.")); }).finally(() => imageRequests.current.delete(id));
  };
  useEffect(() => {
    if (!selected) return;
    for (const id of [selected.initialFileId, selected.finalFileId]) if (id) loadImage(id);
    // Solo las dos evidencias seleccionadas, no todas las imágenes de la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.initialFileId, selected?.finalFileId, enabled]);

  return {
    role, process: context.process, filters: state.filters, rows: list.data?.data ?? [], total: list.data?.total ?? 0,
    loading: list.isFetching || (state.id !== null && detail.isLoading), busy, error: error || (failures.find(Boolean) ? apiErrorMessage(failures.find(Boolean)) : ""), notice,
    selected, base: state.base, draft: state.draft, dirty, conflict: state.conflict, unavailable, writable,
    writeLimit: selected ? selected.deletedAt ? "Parte anulado; restaura antes de corregir evidencias." : role === "supervisor" ? "Solo revisión; no modifica el registro, aunque esté cerrado." : role === "administrador" ? "Corrección extraordinaria con motivo; conserva el cierre original." : now < Date.parse(selected.scheduledStart) ? "El bloque todavía no comienza." : writable ? `Edición disponible. Cierre original: ${new Date(selected.editDeadline).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima).` : "Edición cerrada. Una subida previa no habilita su asociación; requiere habilitación o corrección administrativa." : "",
    review: state.review, reviewDirty: state.reviewDirty, pendingFiles: state.pendingFiles, images,
    history: (history.data ?? []) as AuditEvent[], historyPage, historyLoading: history.isFetching,
    alerts: (alerts.data ?? []) as PartAlert[], alertsPage, config: config.data ?? null,
    operation: state.operation, operationOpen, selectedIds: (state.operation ? state.operationTargets : state.targets).map(r => r.id),
    people: people.data?.data ?? [], peopleTotal: people.data?.total ?? 0, peopleLoading: people.isFetching,
    peoplePage: peopleParams.page, peopleSearch: peopleParams.search, peopleKind: peopleParams.kind,
    classrooms: classrooms.data ?? [], periods: periods.data ?? [], report: report.data ?? null, summary: summary.data ?? null, reportOpen,
    onFilters: filters => {
      if (!canLeave()) return;
      try { validateRange(filters.from, filters.to); setState(s => ({ ...s, filters, id: null, base: null, draft: null })); setReportOpen(false); }
      catch (cause) { setError((cause as Error).message); }
    },
    onRefresh: () => { void refresh(); },
    onSelect: id => { if (id === state.id || !canLeave()) return; setState(s => ({ ...s, id, base: null, draft: null, conflict: false, review: blankReview(), reviewDirty: false })); setShowHistory(true); setHistoryPage(1); },
    onDraft: patch => { if (!busy && writable && !state.operation) setState(s => ({ ...s, draft: s.draft ? { ...s.draft, ...patch } : null })); },
    onSave: () => void run(async () => {
      const base = requireRecord(); if (!state.draft || !writable || state.operation) throw new Error("El registro no admite edición o tiene una operación pendiente.");
      await service.update(base.id, updatePayload(base, state.draft, role === "administrador"), role === "administrador");
      await acceptRecord(true); setNotice("Cambios guardados. La revisión corresponde a la nueva versión.");
    }),
    onDiscard: () => void run(async () => {
      let unavailable = false;
      if (state.operation?.action === "configuration") await config.refetch();
      if (state.id) {
        try { await acceptRecord(true); }
        catch (cause) {
          if (!axios.isAxiosError(cause) || ![403, 404].includes(cause.response?.status ?? 0)) throw cause;
          // El usuario pidió descartar: no depender de poder volver a leer un recurso retirado.
          unavailable = true;
          setState(s => ({ ...s, id: null, base: null, draft: null, pendingFiles: {} }));
        }
      }
      setState(s => ({ ...s, conflict: false, operation: null, operationBase: null, operationTargets: [], targets: [], review: blankReview(), reviewDirty: false })); setOperationOpen(false);
      setNotice(unavailable ? "Se descartaron los borradores y referencias de subidas del parte no disponible. No se borró ningún archivo del servidor." : "Se cargó la versión del servidor y se descartaron los borradores. Las subidas sin asociar se conservan por separado.");
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
      if (role === "administrador") requireReason(state.draft?.reason ?? "");
      const uploaded = await service.upload(base.id, file, role === "administrador", state.draft?.reason ?? "");
      setState(s => ({ ...s, pendingFiles: { ...s.pendingFiles, [slot]: uploaded } }));
      setNotice("Archivo subido, todavía sin asociar. Usa Asociar captura para registrarlo.");
    }),
    onAssociate: slot => void run(async () => {
      const base = requireRecord(), file = state.pendingFiles[slot];
      if (!file || !writable || state.operation) throw new Error("No hay una subida asociable, el plazo cerró o hay una operación pendiente.");
      if (state.draft && JSON.stringify({ ...state.draft, reason: "" }) !== JSON.stringify(toDraft(base))) throw new Error("Guarda o descarta los cambios del registro antes de asociar una captura.");
      if (role === "administrador") requireReason(state.draft?.reason ?? "");
      await service.associate(base.id, slot, file.id, base.version, role === "administrador", state.draft?.reason ?? "");
      setState(s => { const pendingFiles = { ...s.pendingFiles }; delete pendingFiles[slot]; return { ...s, pendingFiles }; });
      await acceptRecord(true); setNotice("Captura asociada. El cierre original no cambió.");
    }),
    onDiscardUpload: slot => { if (!busy) setState(s => { const pendingFiles = { ...s.pendingFiles }; delete pendingFiles[slot]; return { ...s, pendingFiles }; }); },
    onLoadImage: loadImage,
    onHistory: page => { setShowHistory(true); setHistoryPage(page); void history.refetch(); },
    onAlerts: page => { setShowAlerts(true); setAlertsPage(page); if (showAlerts && alertsPage === page) void alerts.refetch(); },
    onAcknowledge: id => void run(async () => { await service.operation(`alerts/${id}/acknowledge`, {}); await alerts.refetch(); setNotice("Acuse registrado. La alerta no se considera resuelta por este acuse."); }),
    onPeople: (kind, search, page) => { if (search.length <= 100) setPeopleParams({ kind, search, page }); },
    onToggleTarget: id => { if (busy || state.operation) { setError("Los destinos están fijados en el borrador de la operación. Descártalo para cambiar la selección."); return; } const row = list.data?.data.find(r => r.id === id); if (row) setState(s => ({ ...s, targets: s.targets.some(r => r.id === id) ? s.targets.filter(r => r.id !== id) : s.targets.length < 200 ? [...s.targets, row] : s.targets })); },
    onOperation: action => {
      if (busy || state.conflict) return;
      if (state.operation) { if (state.operation.action === action) setOperationOpen(true); else setError("Continúa o descarta la operación pendiente antes de iniciar otra."); return; }
      if (dirty) { setError("Guarda o descarta los cambios del registro antes de iniciar una operación."); return; }
      if (action !== "configuration" && !state.base && !((action === "cancel" || action === "restore") && state.targets.length)) { setError("Selecciona primero un parte."); return; }
      const record = detail.data ?? state.base;
      setState(s => ({ ...s, operation: operationDraft(action, record, config.data ?? null), operationBase: record, operationTargets: s.targets.length ? [...s.targets] : record ? [record] : [], configVersion: config.data?.version ?? null }));
      setOperationOpen(true); setError("");
    },
    onOperationDraft: patch => { if (!busy) setState(s => ({ ...s, operation: s.operation ? { ...s.operation, ...patch } : null })); },
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
          await service.operation("replacements", { targets: state.operationTargets.map(r => ({ recordId: r.id, expectedVersion: r.version })), kind: op.kind, personId: op.personId, mode: role === "monitor" ? "EMERGENCY" : op.mode, reason });
        } else if (op.action === "resolve") await service.operation(`replacements/${Number(op.coverageId)}/resolve`, { expectedVersion, status: op.status, reason });
        else if (op.action === "grant") {
          if (!base.monitorAccountId || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(op.expiresAt)) throw new Error("Define un vencimiento válido en Lima.");
          await service.operation(`${base.id}/grants`, { expectedVersion, accountId: base.monitorAccountId, expiresAt: `${op.expiresAt}:00-05:00`, reason });
        } else if (op.action === "revoke") await service.operation(`grants/${Number(op.grantId)}/revoke`, { expectedVersion, reason });
        else if (op.action === "recovery") await service.operation("recoveries", { originalRecordId: base.id, classId: op.classId, hourSessionId: Number(op.hourSessionId), date: academicDate(op.date), reason });
      }
      setState(s => ({ ...s, operation: null, operationBase: null, targets: [], operationTargets: [] })); setOperationOpen(false);
      if (state.id && op.action !== "configuration") await acceptRecord(true); else await refresh();
      setNotice("Operación registrada. Autorización y ejecución se mantienen separadas; no cambió el cierre original.");
    }),
    onReport: page => { setReportPage(page); setReportOpen(true); }, onCloseReport: () => setReportOpen(false),
  };
}
