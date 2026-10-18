import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { areaStyle } from "@/lib/areas";

export type Tone = "neutral" | "ok" | "warn" | "danger" | "info" | "guinda";

const TONE: Record<Tone, string> = {
  neutral: "bg-[#F1F2F5] text-ink-700",
  ok: "bg-ok-50 text-ok-700",
  warn: "bg-warn-50 text-warn-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-marino-50 text-marino-700",
  guinda: "bg-guinda-50 text-guinda-700",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap", TONE[tone], className)}>
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color: string; className?: string }) {
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", className)} style={{ background: color }} aria-hidden="true" />;
}

export function AreaBadge({ name }: { name: string | null | undefined }) {
  const style = areaStyle(name);
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: style.background, color: style.text }}
    >
      <Dot color={style.dot} />
      {name || "Sin área"}
    </span>
  );
}

export function CourseBadge({ name, color }: { name: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <Dot color={color || "#8C91B5"} className="size-2.5" />
      {name}
    </span>
  );
}
