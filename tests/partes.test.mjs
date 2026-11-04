import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { academicDate, configPayload, limaDate, limaInstant, limaTime, operationDraft, ordinaryWritable, requireReason, toDraft, updatePayload, validateRange } from "../src/features/partes/model.ts";

const record = (patch = {}) => ({ id: 1, version: 3, date: "2026-10-29T00:00:00.000Z", actualStart: null, actualEnd: null, teachingStatus: "UNCONFIRMED", titularOutcome: "UNKNOWN", effectiveTeacherId: null, effectiveMonitorId: null, incidents: null, scheduledStart: "2026-10-29T12:00:00Z", editDeadline: "2026-10-29T19:30:00Z", deletedAt: null, monitorAccountId: "account", classId: "class", hourSessionId: 1, grants: [], ...patch });
test("fechas académicas no se desplazan a la víspera y horas son de Lima", () => {
  assert.equal(academicDate(record().date), "2026-10-29");
  assert.equal(limaDate(new Date("2026-10-30T04:59:59Z")), "2026-10-29");
  assert.equal(limaTime("2026-10-29T12:03:00Z"), "07:03");
  assert.equal(limaInstant(record().date, "07:03"), "2026-10-29T07:03:00-05:00");
  assert.equal(limaInstant(record().date, ""), null);
  assert.throws(() => limaInstant(record().date, "07:61"));
});
test("borrador nunca copia horario programado, no infiere falta y no muta servidor", () => {
  const server = record(); const draft = toDraft(server);
  assert.equal(draft.actualStart, ""); assert.equal(draft.actualEnd, "");
  assert.equal(draft.titularOutcome, "UNKNOWN"); assert.equal(draft.effectiveTeacherId, "");
  draft.structuredObservations = [{id:'00000000-0000-4000-8000-000000000001',target:'CLASSROOM',description:'Observación de aula'}];
  assert.equal(server.incidents, null);
  assert.deepEqual(updatePayload(server, draft, false), { expectedVersion: 3, structuredObservations: draft.structuredObservations });
});
test("actualización envía solo cambios y conserva expectedVersion original", () => {
  const base = record(); const draft = { ...toDraft(base), actualStart: "07:03", effectiveTeacherId: "uuid" };
  assert.deepEqual(updatePayload(base, draft, false), { expectedVersion: 3, actualStart: "2026-10-29T07:03:00-05:00" });
  const modified = record({ actualStart: "2026-10-29T12:03:00Z", effectiveTeacherId: "uuid" });
  assert.deepEqual(updatePayload(modified, { ...toDraft(modified), actualStart: "", effectiveTeacherId: "" }, false), { expectedVersion: 3, actualStart: null });
});
test("observaciones no reenvían autor ni fechas controlados por servidor", () => {
  const base = record({ structuredObservations: [{ id: 'note', target: 'CLASSROOM', description: 'Nota original', createdAt: '2026-11-03T15:00:00Z', author: { id: 'server-author' } }] });
  const draft = toDraft(base);
  draft.structuredObservations = draft.structuredObservations.map(note => ({ ...note, description: 'Nota corregida', author: { id: 'not-authoritative' } }));
  assert.deepEqual(updatePayload(base, draft, false), { expectedVersion: 3, structuredObservations: [{ id: 'note', target: 'CLASSROOM', description: 'Nota corregida' }] });
  assert.equal(base.structuredObservations[0].author.id, 'server-author');
});
test("corrección administrativa exige motivo sin reabrir el cierre", () => {
  const base = record(); assert.throws(() => updatePayload(base, toDraft(base), true));
  assert.equal(updatePayload(base, { ...toDraft(base), reason: " Motivo válido " }, true).reason, "Motivo válido");
  assert.equal(base.editDeadline, "2026-10-29T19:30:00Z"); assert.throws(() => requireReason("  "));
});
test("cierre exclusivo del monitor: ninguna habilitación histórica lo extiende", () => {
  const end = Date.parse(record().editDeadline);
  assert.equal(ordinaryWritable(record(), "account", Date.parse(record().scheduledStart) - 1), false);
  assert.equal(ordinaryWritable(record(), "account", end - 1), true);
  assert.equal(ordinaryWritable(record(), "account", end), false);
  const grant = { accountId: "account", revokedAt: null, expiresAt: "2026-10-29T20:00:00Z" };
  assert.equal(ordinaryWritable(record({ grants: [grant] }), "account", end), false);
  assert.equal(ordinaryWritable(record({ grants: [grant] }), "other", end), false);
  assert.equal(ordinaryWritable(record({ grants: [{ ...grant, revokedAt: "2026-10-29T19:00:00Z" }] }), "account", end), false);
  assert.equal(ordinaryWritable(record({ grants: [grant] }), "account", Date.parse(grant.expiresAt)), false);
  assert.equal(ordinaryWritable(record({ deletedAt: "2026-10-29T19:00:00Z", grants: [grant] }), "account", end), false);
});
test("configuración sin política no inventa cinco minutos y preserva versión", () => {
  const config = { version: 7, enabled: false, startsOn: null, endsOn: null, latenessToleranceMinutes: null, replacementWaitMinutes: null, alertThresholdMinutes: null, continuityGapMinutes: null };
  const op = { ...operationDraft("configuration", null, config), reason: "Definir política", alertThresholdMinutes: "0" };
  const payload = configPayload(config, op);
  assert.equal(payload.expectedVersion, 7); assert.equal(payload.latenessToleranceMinutes, null); assert.equal(payload.alertThresholdMinutes, 0);
  assert.throws(() => configPayload(config, { ...op, continuityGapMinutes: "1.5" }));
  assert.throws(() => configPayload(config, { ...op, continuityGapMinutes: "1441" }));
});
test("rangos como backend: máximo 93 días y orden válido", () => {
  validateRange("2026-01-01", "2026-04-04");
  assert.throws(() => validateRange("2026-01-01", "2026-04-05"));
  assert.throws(() => validateRange("2026-01-02", "2026-01-01"));
  assert.throws(() => validateRange("incorrecta", "2026-01-01"));
});
test("capa visual sin servicios, persistencia ni lógica de autorización", () => {
  const visual = readFileSync(new URL("../src/features/partes/PartsView.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(visual, /from ["'].*(?:service|useParts|AuthProvider|react-query|axios)|\bfetch\(|localStorage|sessionStorage/);
  const logic = readFileSync(new URL("../src/features/partes/useParts.ts", import.meta.url), "utf8");
  assert.doesNotMatch(logic, /\.css["']|className=|<Button|sessionStorage|localStorage/);
  const service = readFileSync(new URL("../src/features/partes/service.ts", import.meta.url), "utf8");
  assert.doesNotMatch(service, /from ["']react|sessionStorage|localStorage/);
  assert.match(service, /form\.append\("file"/);
  assert.match(service, /X-Class-Session-Account/); assert.match(service, /X-Class-Session-Context/);
});

test("primer bloque abre exactamente cinco minutos antes; los siguientes no se anticipan", () => {
  const start = Date.parse(record().scheduledStart);
  assert.equal(ordinaryWritable(record({period:1}), "account", start-300001), false);
  assert.equal(ordinaryWritable(record({period:1}), "account", start-300000), true);
  assert.equal(ordinaryWritable(record({period:1}), "otro", start-300000), false);
  assert.equal(ordinaryWritable(record({period:2}), "account", start-1), false);
  assert.equal(ordinaryWritable(record({period:2}), "account", start), true);
  assert.equal(ordinaryWritable(record({period:1}), "account", Date.parse(record().editDeadline)), false);
});

test("propuesta RN/RE usa correo, estado y clave idempotente; no arrastra horas ni notas", () => {
  const base = record();
  const draft = { ...toDraft(base), classState: "RE", replacementEmail: " Docente@Colegio.PE " };
  assert.deepEqual(updatePayload(base, draft, false, false, "op-1"), {
    expectedVersion: 3, classState: "RE", replacementEmail: "docente@colegio.pe", operationId: "op-1",
  });
  assert.throws(() => updatePayload(base, { ...draft, actualStart: "07:03" }, false, false, "op-1"));
  assert.throws(() => updatePayload(base, { ...toDraft(base), replacementEmail: "sin-arroba" }, false, false, "op-1"));
  assert.throws(() => updatePayload(base, { ...toDraft(base), replacementEmail: "d@test.invalid", classState: "N" }, false, false, "op-1"));
});
test("habilitación excepcional exige un motivo propio por guardado, sin ruta administrativa", () => {
  const base = record();
  const draft = { ...toDraft(base), actualStart: "07:03" };
  assert.throws(() => updatePayload(base, draft, false, true));
  assert.equal(updatePayload(base, { ...draft, reason: " Cambio concreto " }, false, true).reason, "Cambio concreto");
});
