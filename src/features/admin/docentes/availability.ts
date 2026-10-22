import type { AvailabilityInterval } from "@/api/types";

/** Intervalos del docente independientes del turno, en formato HH:mm. */
export function isCovered(intervals: AvailabilityInterval[], target: AvailabilityInterval): boolean {
  let cursor = target.start;
  for (const interval of intervals.filter((i) => i.weekday === target.weekday).sort((a, b) => a.start.localeCompare(b.start))) {
    if (interval.start > cursor) break;
    if (interval.end > cursor) cursor = interval.end;
    if (cursor >= target.end) return true;
  }
  return false;
}

export function overlaps(a: AvailabilityInterval, b: AvailabilityInterval): boolean {
  return a.weekday === b.weekday && a.start < b.end && b.start < a.end;
}

export function toggleAvailability(intervals: AvailabilityInterval[], targets: AvailabilityInterval[]): AvailabilityInterval[] {
  return changeIntervals(intervals, targets, !targets.every((target) => isCovered(intervals, target)));
}

export function changeIntervals(intervals: AvailabilityInterval[], targets: AvailabilityInterval[], add: boolean): AvailabilityInterval[] {
  let result = [...intervals];
  for (const target of targets) {
    if (add) result.push(target);
    else result = result.flatMap((interval) => {
      if (!overlaps(interval, target)) return [interval];
      const fragments: AvailabilityInterval[] = [];
      if (interval.start < target.start) fragments.push({ ...interval, end: target.start });
      if (interval.end > target.end) fragments.push({ ...interval, start: target.end });
      return fragments;
    });
  }
  const merged: AvailabilityInterval[] = [];
  for (const interval of result.sort((a, b) => a.weekday.localeCompare(b.weekday) || a.start.localeCompare(b.start))) {
    const previous = merged.at(-1);
    if (previous && previous.weekday === interval.weekday && interval.start <= previous.end) {
      previous.end = previous.end > interval.end ? previous.end : interval.end;
    } else merged.push({ ...interval });
  }
  return merged;
}
