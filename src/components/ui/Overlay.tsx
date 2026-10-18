import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "./Button";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
}

function useInitialFocus(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const focusable = ref.current.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])");
    (focusable ?? ref.current).focus();
  }, [open]);
  return ref;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  useEscape(open, onClose);
  const ref = useInitialFocus(open);
  const titleId = useId();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-marino-900/45 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-pop outline-none sm:rounded-2xl",
          size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-display text-lg font-bold text-marino-900">
              {title}
            </h2>
            {description && <p className="text-sm text-ink-500">{description}</p>}
          </div>
          <IconButton label="Cerrar" size="sm" data-close onClick={onClose}>
            <FiX />
          </IconButton>
        </div>
        {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft bg-surface-2 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmText = "Confirmar", tone = "danger", loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onCancel()}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={tone === "danger" ? "danger-solid" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-6 text-ink-700">{message}</div>
    </Dialog>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
}

/** Panel lateral para formularios y detalles sin perder el contexto de la lista */
export function Drawer({ open, onClose, title, description, children, footer, width = "md" }: DrawerProps) {
  useEscape(open, onClose);
  const ref = useInitialFocus(open);
  const titleId = useId();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end bg-marino-900/35" onMouseDown={onClose}>
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn("flex h-full w-full flex-col bg-white shadow-pop outline-none", width === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-display text-lg font-bold text-marino-900">
              {title}
            </h2>
            {description && <p className="text-sm text-ink-500">{description}</p>}
          </div>
          <IconButton label="Cerrar" size="sm" data-close onClick={onClose}>
            <FiX />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft bg-surface-2 px-6 py-4">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
