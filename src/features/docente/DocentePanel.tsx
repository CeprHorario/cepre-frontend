import { useMemo } from "react";
import { useOwnClasses, usePeriods } from "@/api/queries";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { LinkButtons } from "@/components/schedule/LinkButtons";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { AreaBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { areaStyle } from "@/lib/areas";
import { fullName, shortClassName } from "@/lib/format";
import { layoutEntries, todayWeekday, toHHMM, trimRows, uniqueRows, WEEKDAY_LABEL, type ScheduleEntry } from "@/lib/schedule";

export function DocentePanel() {
  const classes = useOwnClasses();
  const { periods } = usePeriods();

  const areaOf = (name: string) => name.split(" ").slice(1).join(" ");

  const entries: ScheduleEntry[] = useMemo(
    () =>
      (classes.data ?? []).flatMap((cls) =>
        cls.schedules.map((s) => ({
          day: s.weekday,
          start: toHHMM(s.hourSession.startTime),
          end: toHHMM(s.hourSession.endTime),
          title: cls.name,
          subtitle: cls.monitor?.user ? `Monitor: ${fullName(cls.monitor.user)}` : areaOf(cls.name),
          color: areaStyle(areaOf(cls.name)).dot,
          groupKey: cls.name,
          meta: { meet: cls.urlMeet, classroom: cls.urlClassroom },
        })),
      ),
    [classes.data],
  );

  const rows = useMemo(() => {
    // Turnos reales de sus salones (no se deducen por la hora); se recortan las filas vacías
    const shiftIds = new Set((classes.data ?? []).map((c) => c.shiftId));
    return trimRows(uniqueRows(periods.filter((p) => shiftIds.has(p.shiftId))), entries);
  }, [classes.data, entries, periods]);

  const merged = layoutEntries(entries, rows.length ? rows : uniqueRows(entries));

  return (
    <SimpleLayout greeting subtitle="Docente">
      <section className="bg-marino-900 px-4 py-6 text-white sm:px-10">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-white/80">Mi horario</span>
            <strong className="font-display text-2xl font-extrabold">
              {WEEKDAY_LABEL[todayWeekday()]}, {new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long" }).format(new Date())}
            </strong>
          </div>
          <div className="flex gap-2.5">
            <Stat value={entries.length} label="horas semanales" />
            <Stat value={classes.data?.length ?? 0} label="salones" />
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-5 sm:px-10">
        <ScheduleView
          tone="navy"
          entries={merged}
          rows={rows}
          loading={classes.isLoading}
          error={classes.isError}
          onRetry={() => classes.refetch()}
          empty={{ title: "Aún no tienes clases asignadas", description: "Cuando la coordinación te asigne salones, aparecerán aquí con sus enlaces de Meet y Classroom." }}
          weekEntries={(list) => list.map((e) => ({ ...e, title: shortClassName(e.title), subtitle: undefined }))}
          renderActions={(entry) => <LinkButtons meet={entry.meta?.meet as string | null} classroom={entry.meta?.classroom as string | null} size="sm" />}
          extraViews={[
            {
              value: "salones",
              label: "Mis salones",
              render: () => (
                <ul className="grid gap-3 md:grid-cols-2">
                  {(classes.data ?? []).map((cls) => (
                    <li key={cls.name}>
                      <Card className="flex flex-col gap-3 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="font-display text-lg text-marino-900">{shortClassName(cls.name)}</strong>
                          <AreaBadge name={areaOf(cls.name)} />
                        </div>
                        <span className="text-[13px] text-ink-500">
                          {cls.schedules.length} horas · {[...new Set(cls.schedules.map((s) => WEEKDAY_LABEL[s.weekday]))].join(", ")}
                        </span>
                        <span className="text-[13px]">Monitor: {cls.monitor?.user ? fullName(cls.monitor.user) : <span className="text-ink-500">sin datos</span>}</span>
                        <LinkButtons meet={cls.urlMeet} classroom={cls.urlClassroom} />
                      </Card>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </main>
    </SimpleLayout>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-28 flex-col rounded-xl bg-white/12 px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
      <strong className="tabular text-xl">{value}</strong>
      <span className="text-xs text-white/80">{label}</span>
    </div>
  );
}
