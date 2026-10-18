import type { ReactNode } from "react";
import { FiAlertTriangle, FiCheckCircle, FiInbox, FiInfo, FiXCircle } from "react-icons/fi";
import { cn } from "@/lib/cn";

export function EmptyState({ title, description, action, icon }: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-guinda-50 text-2xl text-guinda-700">
        {icon ?? <FiInbox />}
      </span>
      <strong className="text-base text-ink-900">{title}</strong>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}

type AlertTone = "info" | "warn" | "danger" | "ok";

const ALERT: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: "bg-marino-50 text-marino-700", icon: <FiInfo /> },
  warn: { box: "bg-warn-50 text-warn-700", icon: <FiAlertTriangle /> },
  danger: { box: "bg-danger-50 text-danger-700", icon: <FiXCircle /> },
  ok: { box: "bg-ok-50 text-ok-700", icon: <FiCheckCircle /> },
};

export function Alert({ tone = "info", title, children, action, className }: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-xl px-4 py-3 text-[13px] leading-5", ALERT[tone].box, className)}>
      <span className="mt-0.5 shrink-0 text-base">{ALERT[tone].icon}</span>
      <div className="flex flex-1 flex-col gap-0.5">
        {title && <strong className="text-sm">{title}</strong>}
        {/* Contenedor de flujo normal: el texto con <strong> o enlaces debe seguir en la misma línea */}
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  );
}
