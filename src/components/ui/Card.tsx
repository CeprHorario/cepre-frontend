import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-white", className)} {...props} />;
}

export function CardHeader({ title, description, actions, className }: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-display text-lg font-bold text-marino-900">{title}</h2>
        {description && <p className="text-[13px] text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500", className)}>{children}</span>
  );
}

export function PageHeader({ title, description, actions, back }: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {back}
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-marino-900 sm:text-[26px]">{title}</h1>
          {description && <p className="text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "danger" }) {
  return (
    <Card className="flex flex-col gap-1.5 p-5">
      <SectionLabel>{label}</SectionLabel>
      <strong className={cn("tabular font-display text-3xl font-extrabold", tone === "danger" ? "text-danger-700" : "text-marino-900")}>
        {value}
      </strong>
      {hint && <span className="text-[13px] text-ink-500">{hint}</span>}
    </Card>
  );
}

export function ProgressBar({ value, max, projected = 0, tone = "guinda", className, label }: {
  value: number;
  max: number;
  projected?: number;
  tone?: "guinda" | "marino" | "ok";
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const extra = max > 0 ? Math.min(100 - pct, (projected / max) * 100) : 0;
  const full = max > 0 && value >= max;
  const color = full ? "bg-ok-600" : tone === "marino" ? "bg-marino-900" : tone === "ok" ? "bg-ok-600" : "bg-guinda-700";
  return (
    <div
      className={cn("flex h-2 overflow-hidden rounded-full bg-line-soft", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className={color} style={{ width: `${pct}%` }} />
      {extra > 0 && (
        <div style={{ width: `${extra}%`, background: "repeating-linear-gradient(135deg,#D2AE6D 0 6px,#E6CC97 6px 12px)" }} />
      )}
    </div>
  );
}

export function Avatar({ text, tone = "marino", size = "md" }: { text: string; tone?: "marino" | "guinda"; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        tone === "marino" ? "bg-marino-50 text-marino-900" : "bg-guinda-50 text-guinda-700",
        size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-12 text-base" : "size-10 text-sm",
      )}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
