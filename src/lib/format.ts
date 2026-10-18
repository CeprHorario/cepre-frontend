import type { JobStatus } from "@/api/types";

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  FullTime: "Tiempo completo",
  PartTime: "Medio tiempo",
  FreeTime: "Tiempo libre",
};

export function fullName(person?: { firstName?: string | null; lastName?: string | null } | null): string {
  if (!person) return "";
  const first = person.firstName?.trim();
  const last = person.lastName?.trim();
  if (!first && !last) return "";
  if (first?.toLowerCase() === "no asignado") return "";
  return [last, first].filter(Boolean).join(", ");
}

export function initials(person?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  const first = person?.firstName?.trim()?.[0] ?? "";
  const last = person?.lastName?.trim()?.[0] ?? "";
  return (first + last).toUpperCase() || person?.email?.slice(0, 2).toUpperCase() || "?";
}

export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-PE", { timeZone: "UTC", ...options }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : phone;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value);
}

/** "B-101 Biomédicas" → "B-101" */
export function shortClassName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function daysUntil(dateIso: string, from = new Date()): number {
  const target = new Date(dateIso);
  return Math.ceil((target.getTime() - from.getTime()) / 86_400_000);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
