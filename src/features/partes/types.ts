import type { Paginated, Role, Classroom, HourSession } from "@/api/types";

export type PartRole = Extract<Role, "administrador" | "monitor" | "supervisor">;
export type Slot = "initial" | "final";
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
export interface PartRecord {
  id: number; version: number; date: string; classId: string; hourSessionId: number; shiftId: number; courseId: number; areaId: number; period: number;
  pedagogicalMinutes: number; origin: "REGULAR" | "RECOVERY"; originalRecordId: number | null;
  snapshot: Snapshot; effectiveSnapshot: Partial<Record<PersonKind, Person | null>>;
  titularTeacherId: string | null; titularMonitorId: string | null; effectiveTeacherId: string | null; effectiveMonitorId: string | null;
  monitorAccountId: string | null; supervisorId: string | null;
  scheduledStart: string; scheduledEnd: string; shiftEnd: string; editDeadline: string;
  actualStart: string | null; actualEnd: string | null;
  teachingStatus: "UNCONFIRMED" | "TAUGHT" | "NOT_TAUGHT" | "INTERRUPTED";
  titularOutcome: "UNKNOWN" | "PRESENT" | "ABSENT" | "PLANNED_REPLACEMENT";
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
}
export interface PartContext { accountId: string; process: string; serverNow: string }
export interface PartFilters { from: string; to: string; page: number; limit: number; classId?: string; teacherId?: string; monitorId?: string; courseId?: number; shiftId?: number; pendingReview?: boolean; includeDeleted?: boolean }
export interface RecordDraft {
  actualStart: string; actualEnd: string; teachingStatus: PartRecord["teachingStatus"];
  titularOutcome: PartRecord["titularOutcome"]; effectiveTeacherId: string; effectiveMonitorId: string; incidents: string; reason: string;
}
export interface ReviewDraft { result: "CONFORMING" | "OBSERVED"; comments: string; confirmed: boolean }
export interface UploadedCapture { id: string; originalName: string; uploadedAt: string; status: "AVAILABLE" }
export type Operation = "replacement" | "resolve" | "grant" | "revoke" | "cancel" | "restore" | "recovery" | "configuration";
export interface OperationDraft {
  action: Operation; reason: string; kind: PersonKind; personId: string; mode: "PLANNED" | "EMERGENCY";
  coverageId: string; status: "AUTHORIZED" | "REJECTED" | "REVOKED"; grantId: string; accountId: string; expiresAt: string;
  date: string; classId: string; hourSessionId: string;
  enabled: boolean; startsOn: string; endsOn: string; latenessToleranceMinutes: string;
  replacementWaitMinutes: string; alertThresholdMinutes: string; continuityGapMinutes: string;
}
export type ReportRow = Record<string, string | number | boolean | null | object>;
export type ReportSummary = Record<string, number | null>;
export interface PartsViewProps {
  role: PartRole; process: string; filters: PartFilters; rows: PartRecord[]; total: number; loading: boolean;
  busy: boolean; error: string; notice: string; selected: PartRecord | null; base: PartRecord | null;
  draft: RecordDraft | null; dirty: boolean; conflict: boolean; unavailable: boolean; writable: boolean; writeLimit: string;
  review: ReviewDraft; reviewDirty: boolean; pendingFiles: Partial<Record<Slot, UploadedCapture>>;
  images: Record<string, string>; history: AuditEvent[]; historyPage: number; historyLoading: boolean;
  alerts: PartAlert[]; alertsPage: number; config: OperationalConfig | null;
  operation: OperationDraft | null; operationOpen: boolean; selectedIds: number[];
  people: Person[]; peopleTotal: number; peoplePage: number; peopleSearch: string; peopleKind: PersonKind; peopleLoading: boolean;
  classrooms: Classroom[]; periods: HourSession[];
  report: Paginated<ReportRow> | null; summary: ReportSummary | null; reportOpen: boolean;
  onFilters: (filters: PartFilters) => void; onRefresh: () => void; onSelect: (id: number | null) => void;
  onDraft: (patch: Partial<RecordDraft>) => void; onSave: () => void; onDiscard: () => void;
  onReview: (patch: Partial<ReviewDraft>) => void; onSubmitReview: () => void; onDiscardReview: () => void;
  onUpload: (slot: Slot, file: File) => void; onAssociate: (slot: Slot) => void; onDiscardUpload: (slot: Slot) => void;
  onLoadImage: (id: string) => void; onHistory: (page: number) => void; onAlerts: (page: number) => void; onAcknowledge: (id: number) => void;
  onOperation: (action: Operation) => void; onOperationDraft: (patch: Partial<OperationDraft>) => void;
  onCloseOperation: () => void; onDiscardOperation: () => void; onSubmitOperation: () => void;
  onToggleTarget: (id: number) => void; onPeople: (kind: PersonKind, search: string, page: number) => void;
  onReport: (page: number) => void; onCloseReport: () => void;
}
