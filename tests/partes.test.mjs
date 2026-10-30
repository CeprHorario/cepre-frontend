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
  draft.incidents = "Observación";
  assert.equal(server.incidents, null);
  assert.deepEqual(updatePayload(server, draft, false), { expectedVersion: 3, incidents: "Observación" });
});
test("actualización envía solo cambios y conserva expectedVersion original", () => {
  const base = record(); const draft = { ...toDraft(base), actualStart: "07:03", effectiveTeacherId: "uuid" };
  assert.deepEqual(updatePayload(base, draft, false), { expectedVersion: 3, actualStart: "2026-10-29T07:03:00-05:00", effectiveTeacherId: "uuid" });
  const modified = record({ actualStart: "2026-10-29T12:03:00Z", effectiveTeacherId: "uuid" });
  assert.deepEqual(updatePayload(modified, { ...toDraft(modified), actualStart: "", effectiveTeacherId: "" }, false), { expectedVersion: 3, actualStart: null, effectiveTeacherId: null });
});
test("corrección administrativa exige motivo sin reabrir el cierre", () => {
  const base = record(); assert.throws(() => updatePayload(base, toDraft(base), true));
  assert.equal(updatePayload(base, { ...toDraft(base), reason: " Motivo válido " }, true).reason, "Motivo válido");
  assert.equal(base.editDeadline, "2026-10-29T19:30:00Z"); assert.throws(() => requireReason("  "));
});
test("cierre exclusivo; habilitación solo de cuenta y parte, vigente y no revocada", () => {
  const end = Date.parse(record().editDeadline);
  assert.equal(ordinaryWritable(record(), "account", Date.parse(record().scheduledStart) - 1), false);
  assert.equal(ordinaryWritable(record(), "account", end - 1), true);
  assert.equal(ordinaryWritable(record(), "account", end), false);
  const grant = { accountId: "account", revokedAt: null, expiresAt: "2026-10-29T20:00:00Z" };
  assert.equal(ordinaryWritable(record({ grants: [grant] }), "account", end), true);
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
