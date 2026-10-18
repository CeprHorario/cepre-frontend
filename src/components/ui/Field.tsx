import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { FiSearch } from "react-icons/fi";
import { cn } from "@/lib/cn";

const control =
  "rounded-[10px] border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-500/70 transition-colors focus:border-guinda-600 focus:outline-none focus:ring-3 focus:ring-guinda-600/15 disabled:bg-surface-2 disabled:text-ink-500";

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | false | null;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode;
}

/** Etiqueta + control + ayuda/error con los atributos de accesibilidad conectados */
export function Field({ label, hint, error, required, optional, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const invalid = Boolean(error);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-700">
        {label}
        {required && <span className="text-guinda-700" aria-hidden="true">*</span>}
        {optional && <span className="text-xs font-normal text-ink-500">(opcional)</span>}
      </label>
      {children({ id, invalid, describedBy: error || hint ? messageId : undefined })}
      {error ? (
        <span id={messageId} className="text-xs font-medium text-danger-700">
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="text-xs text-ink-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Ancho completo salvo que el llamador indique uno (w-…) */
const widthOf = (className?: string) => (/(^|\s)(sm:|md:|lg:)?w-/.test(className ?? "") ? "" : "w-full");

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, widthOf(className), "h-10", invalid ? "border-danger-600" : "border-field", className)}
      {...props}
    />
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, widthOf(className), "h-10 cursor-pointer pr-8", invalid ? "border-danger-600" : "border-field", className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, "w-full min-h-24 py-2.5", invalid ? "border-danger-600" : "border-field", className)}
      {...props}
    />
  );
});

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("relative flex", className)}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      <input type="search" className={cn(control, "h-10 w-full border-field pl-9")} {...props} />
    </label>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  if (!label) {
    return <input type="checkbox" className={cn("size-4 cursor-pointer accent-guinda-700", className)} {...props} />;
  }
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input type="checkbox" className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-guinda-700" {...props} />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink-900">{label}</span>
        {description && <span className="text-[13px] text-ink-500">{description}</span>}
      </span>
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-guinda-700" : "bg-[#C9CBD6]",
      )}
    >
      <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-all", checked ? "left-7" : "left-1")} />
    </button>
  );
}
