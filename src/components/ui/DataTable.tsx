import type { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Checkbox, Select } from "./Field";
import { Skeleton } from "./Spinner";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** Ocultar en pantallas pequeñas */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: ReactNode;
  selectedKey?: string | null;
  onRowClick?: (row: T) => void;
  selection?: { selected: Set<string>; onChange: (next: Set<string>) => void };
  minWidth?: number;
}

export function DataTable<T>({ columns, rows, rowKey, loading, empty, selectedKey, onRowClick, selection, minWidth = 720 }: DataTableProps<T>) {
  const allSelected = selection && rows.length > 0 && rows.every((row) => selection.selected.has(rowKey(row)));

  const toggleAll = () => {
    if (!selection) return;
    const next = new Set(selection.selected);
    rows.forEach((row) => (allSelected ? next.delete(rowKey(row)) : next.add(rowKey(row))));
    selection.onChange(next);
  };

  const toggle = (key: string) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  const alignClass = (align?: Column<T>["align"]) => (align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr>
            {selection && (
              <th className="w-10 border-b border-line bg-surface-2 px-4 py-3">
                <Checkbox aria-label="Seleccionar todos" checked={Boolean(allSelected)} onChange={toggleAll} />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "whitespace-nowrap border-b border-line bg-surface-2 px-4 py-3 text-xs font-bold text-ink-500",
                  alignClass(col.align),
                  col.hideOnMobile && "hidden md:table-cell",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {selection && <td className="border-b border-line-soft px-4 py-4" />}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("border-b border-line-soft px-4 py-4", col.hideOnMobile && "hidden md:table-cell")}>
                      <Skeleton className="h-3.5 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const key = rowKey(row);
                const active = selectedKey === key || selection?.selected.has(key);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(active ? "bg-marino-50" : "hover:bg-surface-2", onRowClick && "cursor-pointer")}
                  >
                    {selection && (
                      <td className="border-b border-line-soft px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox aria-label="Seleccionar fila" checked={selection.selected.has(key)} onChange={() => toggle(key)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "border-b border-line-soft px-4 py-3 text-sm text-ink-900",
                          alignClass(col.align),
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className,
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (empty ?? <EmptyState title="Sin resultados" description="Prueba con otros filtros." />)}
    </div>
  );
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
  onLimit?: (limit: number) => void;
  noun?: string;
}

export function Pagination({ page, limit, total, onPage, onLimit, noun = "registros" }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const numbers = Array.from(new Set([1, page - 1, page, page + 1, pages])).filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px] text-ink-500">
      <div className="flex items-center gap-3">
        <span className="tabular">
          {from}–{to} de {total} {noun}
        </span>
        {onLimit && (
          <label className="hidden items-center gap-2 sm:flex">
            <span>Filas</span>
            <Select value={limit} onChange={(e) => onLimit(Number(e.target.value))} className="h-8 w-20" aria-label="Filas por página">
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
        )}
      </div>
      <nav className="flex items-center gap-1" aria-label="Paginación">
        <PageButton label="Página anterior" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <FiChevronLeft />
        </PageButton>
        {numbers.map((n, i) => (
          <span key={n} className="flex items-center gap-1">
            {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1">…</span>}
            <PageButton label={`Página ${n}`} current={n === page} onClick={() => onPage(n)}>
              {n}
            </PageButton>
          </span>
        ))}
        <PageButton label="Página siguiente" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <FiChevronRight />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({ label, current, disabled, onClick, children }: {
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tabular inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40",
        current ? "border-guinda-700 bg-guinda-700 text-white" : "border-field bg-white text-ink-900 hover:border-marino-300",
      )}
    >
      {children}
    </button>
  );
}
