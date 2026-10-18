import { useState, type ReactNode } from "react";
import type { Weekday } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Spinner";
import { todayWeekday, WEEKDAYS, type MergedEntry } from "@/lib/schedule";
import { DayAgenda, DayPicker } from "./DayAgenda";
import { WeekGrid } from "./WeekGrid";

/** Vista inicial de todos los horarios del sistema (ver docs/ROLES.md) */
export const DEFAULT_SCHEDULE_VIEW = "semana";

interface ExtraView {
  value: string;
  label: string;
  render: () => ReactNode;
}

interface Props {
  /** Bloques ya combinados con layoutEntries */
  entries: MergedEntry[];
  rows: { start: string; end: string }[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  empty: { title: string; description?: string };
  /** Con título: todo va dentro de una tarjeta con el selector en la cabecera (paneles con columnas) */
  title?: string;
  /** Selector oscuro sobre el fondo de la página (paneles móviles de docente y monitor) */
  tone?: "light" | "navy";
  /** Transforma los bloques solo en la grilla semanal (p. ej. títulos cortos) */
  weekEntries?: (entries: MergedEntry[]) => MergedEntry[];
  renderActions?: (entry: MergedEntry) => ReactNode;
  compact?: boolean;
  footer?: ReactNode;
  /** Vistas adicionales propias del rol, después de Semana y Por día */
  extraViews?: ExtraView[];
}

/** Horario con el mismo comportamiento en todos los roles: Semana por defecto, Por día y estados de carga/error/vacío */
export function ScheduleView({ entries, rows, loading, error, onRetry, empty, title, tone = "light", weekEntries, renderActions, compact, footer, extraViews = [] }: Props) {
  const [view, setView] = useState<string>(DEFAULT_SCHEDULE_VIEW);
  const [day, setDay] = useState<Weekday>(todayWeekday());
  const counts = Object.fromEntries(WEEKDAYS.map((d) => [d, entries.filter((e) => e.day === d).length]));
  const extra = extraViews.find((v) => v.value === view);

  const selector = (
    <Segmented
      label="Vista"
      tone={tone}
      value={view}
      onChange={setView}
      className={title ? undefined : "self-start"}
      options={[{ value: "semana", label: "Semana" }, { value: "dia", label: "Por día" }, ...extraViews.map(({ value, label }) => ({ value, label }))]}
    />
  );

  const body = extra ? (
    extra.render()
  ) : loading ? (
    <Skeleton className="h-80" />
  ) : error ? (
    <EmptyState
      title="No se pudo cargar el horario"
      description="Revisa tu conexión e inténtalo de nuevo."
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    />
  ) : !entries.length ? (
    <EmptyState title={empty.title} description={empty.description} />
  ) : view === "dia" ? (
    <div className="flex flex-col gap-3">
      <DayPicker value={day} onChange={setDay} counts={counts} />
      <DayAgenda entries={entries} day={day} renderActions={renderActions} />
    </div>
  ) : (
    <WeekGrid rows={rows} entries={weekEntries ? weekEntries(entries) : entries} compact={compact} highlightDay={todayWeekday()} />
  );

  if (title) {
    return (
      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <CardHeader title={title} actions={selector} />
        {body}
        {footer}
      </Card>
    );
  }

  // Sin título: el selector va sobre el fondo; la grilla y los estados, en tarjeta; la agenda y las vistas extra, sueltas
  const boxed = !extra && (view === "semana" || loading || error || !entries.length);
  return (
    <div className="flex flex-col gap-4">
      {selector}
      {boxed ? <Card className="p-4">{body}</Card> : body}
      {footer}
    </div>
  );
}
