import type { PartObservation } from './ObservationsEditor';
import type { Paginated, Role, Classroom, HourSession } from "@/api/types";

export type PartRole = Extract<Role, "administrador" | "monitor" | "supervisor">;
export type Slot = "initial" | "final";
export type PartEditor = 'hours' | 'state' | 'observations';
export interface CaptureDraft { file: File | null; remove: boolean }
export type ClassState = 'N' | 'T' | 'SD' | 'RN' | 'RE';
export type PersonKind = "TEACHER" | "MONITOR";
export interface Person { id: string; name: string; email: string }
export interface Actor { id: string; origin: string; email: string; role: string; schema: string }
export interface Snapshot { className: string; area?: string; shift?: string; course?: string; teacher?: Person | null; monitor?: Person | null }
export interface Coverage {
  id: number; recordId: number; kind: PersonKind; teacherId: string | null; monitorId: string | null;
  mode: "PLANNED" | "EMERGENCY"; status: "PENDING" | "AUTHORIZED" | "REJECTED" | "REVOKED";
  personSnapshot: Person; operationId: string; requestedBy: Actor; requestedAt: string;
  resolvedBy: Actor | null; resolvedAt: string | null; reason: string;
}
export interface Review { id: number; recordId: number; recordVersion: number; result: "CONFORMING" | "OBSERVED"; comments: string | null; createdAt: string; actor: Actor; files: { id: string; generation: string; checksum: string }[] }
export interface Grant { id: number; recordId: number; accountId: string; expiresAt: string; reason: string; revokedAt: string | null; createdAt: string; grantedBy: Actor }
export interface WorkspacePolicy {
  editOpensAt: string; editDeadline: string; grant: Grant | null;
  canEdit: boolean; requiresReason: boolean; canReview: boolean;
  canResolveReplacement: boolean; canFollowMonitor: boolean; canGrant: boolean;
}
export interface CaptureReference { fileId: string; generation: string | null; status: string }
export interface PartRecord {
  eligibleGrantAccounts?: { id: string; email: string; role: string }[];
  editOpensAt?: string | null;
  classState?: ClassState | null;
  observationWarning?: string;
  policy?: WorkspacePolicy;
  initialCapture?: CaptureReference | null;
  finalCapture?: CaptureReference | null;
  id: number; version: number; date: string; classId: string; hourSessionId: number; shiftId: number; courseId: number; areaId: number; period: number;
  pedagogicalMinutes: number; origin: "REGULAR" | "RECOVERY"; originalRecordId: number | null;
  snapshot: Snapshot; effectiveSnapshot: Partial<Record<PersonKind, Person | null>>;
  titularTeacherId: string | null; titularMonitorId: string | null; effectiveTeacherId: string | null; effectiveMonitorId: string | null;
  monitorAccountId: string | null; supervisorId: string | null;
  scheduledStart: string; scheduledEnd: string; shiftEnd: string; editDeadline: string;
  actualStart: string | null; actualEnd: string | null;
  teachingStatus: "UNCONFIRMED" | "TAUGHT" | "NOT_TAUGHT" | "INTERRUPTED";
  titularOutcome: "UNKNOWN" | "PRESENT" | "ABSENT" | "PLANNED_REPLACEMENT";
  structuredObservations?: PartObservation[];
  incidents: string | null; initialFileId: string | null; finalFileId: string | null;
  initialAssociatedAt: string | null; finalAssociatedAt: string | null;
  deletedAt: string | null; deletionReason: string | null; createdAt: string; updatedAt: string;
  completeness: "COMPLETE" | "INCOMPLETE"; reviewStatus: "PENDING" | "CONFORMING" | "OBSERVED";
  coverages: Coverage[]; reviews: Review[]; grants?: Grant[];
}
export interface AuditEvent { id: number; action: string; actor: Actor; before: unknown; after: unknown; reason: string | null; createdAt: string }
export interface PartAlert { id: number; recordId: number; type: string; createdAt: string; acknowledgedAt: string | null }
export interface OperationalConfig {
  version: number; enabled: boolean; startsOn: string | null; endsOn: string | null;
  latenessToleranceMinutes: number | null; replacementWaitMinutes: number | null;
  alertThresholdMinutes: number | null; continuityGapMinutes: number | null;
  escalationDelayMinutes?: number | null;
}
export interface PartContext { accountId: string; process: string; serverNow: string }
export interface PartWorkspace {
  context: { accountId: string; process: string; role: string; serverNow: string; timeZone: string; operationalDate: string };
  selection: { date: string; classId: string | null; shiftId: number | null; blocks: number };
  options: {
    classes: { id: string; name: string; shiftId: number }[];
    courses: { id: number; name: string }[];
    shifts: { id: number; name: string }[];
  };
  policy: { canFollowMonitor: boolean; canGrant: boolean; configurationPending: boolean };
  summary: { pending: number; nextUpdateAt: string | null };
  monitorFollowup?: { observations: MonitorObservation[]; total: number; page: number; limit: number };
  rows: PartWorkspaceRow[];
}
export type PartWorkspaceRow = PartRecord & {
  policy: WorkspacePolicy;
  initialCapture: CaptureReference | null;
  finalCapture: CaptureReference | null;
};
/** Raw SQL from the private follow-up table; kept in snake_case by contract. */
export interface MonitorObservation {
  id: string; date: string; class_id: string; shift_id: number; monitor_id: string;
  monitor_snapshot: Person; text: string; author: Actor; updated_by: Actor;
  created_at: string; updated_at: string; version: number; deleted_at: string | null;
}
export interface ThumbnailResult {
  recordId: number; slot: Slot; fileId: string; generation: string;
  status: "AVAILABLE" | "STALE" | "UNAVAILABLE";
  contentType?: string; width?: number; height?: number; content?: string;
}
export interface PartFilters { from: string; to: string; page: number; limit: number; classId?: string; teacherId?: string; monitorId?: string; courseId?: number; shiftId?: number; pendingReview?: boolean; includeDeleted?: boolean }
export type JournalFilters = Pick<PartFilters, 'from' | 'to' | 'page' | 'limit'>;
export interface PartJournal {
  date: string; classId: string; shiftId: number; className: string | null; shift: string | null;
  scheduledStart: string; scheduledEnd: string; blocks: number;
}
export interface MonitorJournalsProps {
  journal: PartJournal | null; journals: Paginated<PartJournal> | null; journalFilters: JournalFilters;
  journalsLoading: boolean; onJournalFilters: (filters: JournalFilters) => void;
  onOpenJournal: (journal: PartJournal) => void; onCloseJournal: () => void;
}
export interface RecordDraft {
  structuredObservations: PartObservation[];
  classState: ClassState | '';
  actualStart: string; actualEnd: string; teachingStatus: PartRecord["teachingStatus"];
  titularOutcome: PartRecord["titularOutcome"]; effectiveTeacherId: string; effectiveMonitorId: string;
  replacementEmail: string; incidents: string; reason: string;
}
export interface ReviewDraft { result: "CONFORMING" | "OBSERVED"; comments: string; confirmed: boolean }
export interface UploadedCapture { id: string; originalName: string; uploadedAt: string; status: "AVAILABLE" }
export type Operation = "replacement" | "resolve" | "grant" | "revoke" | "cancel" | "restore" | "recovery" | "configuration";
export interface OperationDraft {
  operationId?: string;
  action: Operation; reason: string; kind: PersonKind; personId: string; mode: "PLANNED" | "EMERGENCY";
  coverageId: string; status: "AUTHORIZED" | "REJECTED" | "REVOKED"; grantId: string; accountId: string; expiresAt: string;
  date: string; classId: string; hourSessionId: string;
  enabled: boolean; startsOn: string; endsOn: string; latenessToleranceMinutes: string;
  replacementWaitMinutes: string; alertThresholdMinutes: string; continuityGapMinutes: string;
  escalationDelayMinutes?: string;
}
export type ReportRow = Record<string, string | number | boolean | null | object>;
export type ReportSummary = Record<string, number | null>;
export interface PartsViewProps {
  role: PartRole; process: string; filters: PartFilters; rows: PartRecord[]; total: number; loading: boolean;
  busy: boolean; error: string; notice: string; selected: PartRecord | null; base: PartRecord | null;
  editableRecordIds: number[];
  incompleteRecordIds: number[];
  draft: RecordDraft | null; dirty: boolean; conflict: boolean; unavailable: boolean; writable: boolean; writeLimit: string;
  requiresReason: boolean;
  sheet: PartWorkspace | null;
  thumbnails: Record<string, string>;
  serverNow: number;
  onVisibleCaptures: (references: string[]) => void;
  onRetryThumbnails: () => void;
  captureDrafts: Partial<Record<Slot, CaptureDraft>>;
  noteComposer: PartObservation | null;
  onNoteComposer: (entry: PartObservation | null) => void;
  followupDraft: { text: string; reason: string; editing: {id:string;version:number}|null };
  onFollowupDraft: (patch: Partial<PartsViewProps['followupDraft']>) => void;
  onPrepareCapture: (slot: Slot, file: File | null) => void;
  onSaveCapture: (slot: Slot) => Promise<boolean>;
  onDiscardCapture: (slot: Slot) => void;
  onDiscardEditor: (editor: PartEditor) => void;
  followup: MonitorObservation[]; followupTotal: number; followupLoading: boolean; followupOpen: boolean;
  followupPage: number;
  onFollowupPage: (page: number) => void;
  onFollowupUpdate: (id: string, version: number, text: string) => Promise<boolean>;
  showJournals: boolean;
  review: ReviewDraft; reviewDirty: boolean; pendingFiles: Partial<Record<Slot, UploadedCapture>>;
  images: Record<string, string>; history: AuditEvent[]; historyPage: number; historyLoading: boolean;
  alerts: PartAlert[]; alertsPage: number; config: OperationalConfig | null;
  operation: OperationDraft | null; operationOpen: boolean; selectedIds: number[];
  people: Person[]; peopleTotal: number; peoplePage: number; peopleSearch: string; peopleKind: PersonKind; peopleLoading: boolean;
  classrooms: Classroom[]; periods: HourSession[];
  report: Paginated<ReportRow> | null; summary: ReportSummary | null; reportOpen: boolean;
  onFilters: (filters: PartFilters) => void; onRefresh: () => void; onSelect: (id: number | null, detail?: boolean) => void;
  onSheet: (selection: { date: string; classId?: string; shiftId?: number }) => void;
  onShowJournals: (show: boolean) => void;
  onDraft: (patch: Partial<RecordDraft>) => void; onSave: (editor?: PartEditor) => Promise<boolean>; onDiscard: () => void;
  onReview: (patch: Partial<ReviewDraft>) => void; onSubmitReview: () => void; onDiscardReview: () => void;
  onUpload: (slot: Slot, file: File) => void; onAssociate: (slot: Slot) => void; onDiscardUpload: (slot: Slot) => void;
  onDetach: (slot: Slot) => void;
  onLoadImage: (id: string) => void; onHistory: (page: number) => void; onAlerts: (page: number) => void; onAcknowledge: (id: number) => void;
  onFollowup: (open: boolean) => void;
  onFollowupCreate: (text: string) => Promise<boolean>;
  onFollowupWithdraw: (id: string, version: number, reason: string) => Promise<boolean>;
  onOperation: (action: Operation) => void; onOperationDraft: (patch: Partial<OperationDraft>) => void;
  onCloseOperation: () => void; onDiscardOperation: () => void; onSubmitOperation: () => void;
  onToggleTarget: (id: number) => void; onPeople: (kind: PersonKind, search: string, page: number) => void;
  onReport: (page: number) => void; onCloseReport: () => void;
}
