import test from "node:test";
import assert from "node:assert/strict";
import { changeIntervals, isCovered, toggleAvailability } from "../src/features/admin/docentes/availability.ts";

const interval = (start, end, weekday = "Lunes") => ({ weekday, start, end });

test("pulsar el día completa todos los turnos y volver a pulsarlo los desmarca", () => {
  const allShifts = [interval("07:00", "07:40"), interval("12:15", "12:55"), interval("16:00", "16:40"), interval("16:00", "16:40"), interval("20:30", "21:10")];
  const otherDay = interval("07:00", "07:40", "Martes");
  const marked = toggleAvailability([otherDay, allShifts[0]], allShifts);
  for (const block of allShifts) assert.equal(isCovered(marked, block), true);
  assert.equal(marked.filter((block) => block.start === "16:00").length, 1);
  assert.deepEqual(toggleAvailability(marked, allShifts), [otherDay]);
});

test("los turnos comparten intervalos y los solapamientos parciales requieren cobertura completa", () => {
  const saved = [interval("07:00", "07:40")];
  assert.equal(isCovered(saved, interval("07:00", "07:40")), true);
  assert.equal(isCovered(saved, interval("07:20", "08:00")), false);
  const updated = changeIntervals(saved, [interval("07:20", "08:00")], true);
  assert.deepEqual(updated, [interval("07:00", "08:00")]);
  assert.deepEqual(saved, [interval("07:00", "07:40")]);
});

test("desmarcar un bloque recorta el intervalo compartido y conserva los extremos", () => {
  const updated = changeIntervals([interval("07:00", "09:00")], [interval("07:40", "08:20")], false);
  assert.deepEqual(updated, [interval("07:00", "07:40"), interval("08:20", "09:00")]);
  assert.equal(isCovered(updated, interval("07:20", "08:00")), false);
});

test("no se rellenan descansos ni se mezclan días", () => {
  const updated = changeIntervals([interval("07:00", "07:40")], [interval("07:45", "08:25"), interval("07:00", "07:40", "Martes")], true);
  assert.equal(updated.length, 3);
  assert.equal(isCovered(updated, interval("07:20", "08:00")), false);
  assert.equal(isCovered(updated, interval("07:00", "07:40", "Martes")), true);
});
