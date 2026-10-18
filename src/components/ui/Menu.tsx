import type { ReactNode } from "react";
import { IconButton } from "./Button";

export interface MenuItem {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  tone?: "danger";
  hidden?: boolean;
}

/** Acciones de una fila como botones de icono siempre visibles (sin menú desplegable que la tabla pueda recortar) */
export function RowActions({ label, items }: { label: string; items: MenuItem[] }) {
  const visible = items.filter((item) => !item.hidden);
  if (!visible.length) return null;

  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1.5">
      {visible.map((item) => (
        <IconButton
          key={item.label}
          label={item.label}
          size="sm"
          tone={item.tone ?? "default"}
          onClick={item.onSelect}
        >
          {item.icon}
        </IconButton>
      ))}
    </div>
  );
}
