import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  tone?: "light" | "navy";
  className?: string;
}

/** Selector de opciones excluyentes (vista semana/día, turno, área…) */
export function Segmented<T extends string | number>({ value, onChange, options, label, tone = "light", className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex flex-wrap rounded-[10px] bg-[#EBECF1] p-[3px]", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={event => {
                const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
                if (!direction && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const index = options.findIndex(item => item.value === option.value);
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + direction + options.length) % options.length;
                onChange(options[next].value);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role=radio]')[next]?.focus();
              }}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors",
              active
                ? tone === "navy"
                  ? "bg-marino-900 text-white"
                  : "bg-white text-marino-900 shadow-[0_1px_2px_rgba(26,28,43,0.12)]"
                : "text-ink-500 hover:text-marino-900",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
