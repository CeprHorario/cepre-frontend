import { useState } from "react";
import { FiChevronRight, FiCopy, FiMail } from "react-icons/fi";
import type { ClassTeacher } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmailLink, PhoneCopy } from "@/components/ui/Contact";
import { Drawer } from "@/components/ui/Overlay";
import { Skeleton } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { copyPhone } from "@/lib/contact";
import { formatPhone, fullName } from "@/lib/format";
import { WEEKDAYS, type ScheduleEntry } from "@/lib/schedule";

interface Props {
  teachers: ClassTeacher[];
  loading?: boolean;
  colorByCourse: Map<string, string | undefined>;
  /** Bloques ya combinados del salón, para listar las clases de cada docente */
  entries: ScheduleEntry[];
  className?: string;
  /** Nombre del salón para el subtítulo del detalle */
  classroom?: string;
}

/** Directorio de docentes de un salón con panel de detalle (monitor y supervisor) */
export function TeacherDirectory({ teachers, loading, colorByCourse, entries, className, classroom }: Props) {
  const [open, setOpen] = useState<ClassTeacher | null>(null);
  const sorted = [...teachers].sort((a, b) => a.courseName.localeCompare(b.courseName));
  const classes = open
    ? entries
        .filter((e) => e.title === open.courseName && !e.pending)
        .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.start.localeCompare(b.start))
    : [];

  return (
    <>
      <Card className={cn("flex flex-col p-4", className)}>
        <CardHeader title="Docentes del salón" description={loading ? undefined : `${teachers.length} ${teachers.length === 1 ? "docente" : "docentes"}`} />
        {loading ? (
          <Skeleton className="mt-2 h-48" />
        ) : (
          <ul className="mt-2 flex flex-col">
            {sorted.map((t) => (
              <li key={t.teacherId} className="border-b border-line-soft last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(t)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2.5 text-left hover:bg-surface-2"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorByCourse.get(t.courseName) }} aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[13px] font-bold">{t.courseName}</span>
                    <span className="truncate text-xs text-ink-700">{fullName(t)}</span>
                    <span className="truncate text-xs text-ink-500">
                      {t.email}
                      {t.phone ? ` · ${formatPhone(t.phone)}` : ""}
                    </span>
                  </span>
                  <FiChevronRight className="shrink-0 text-ink-500" aria-hidden="true" />
                </button>
              </li>
            ))}
            {!sorted.length && <li className="py-4 text-sm text-ink-500">Sin docentes asignados.</li>}
          </ul>
        )}
      </Card>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open ? fullName(open) : ""}
        description={open ? [open.courseName, classroom].filter(Boolean).join(" · ") : undefined}
      >
        {open && (
          <div className="flex flex-col gap-5">
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-500">Curso</dt>
                <dd className="flex items-center gap-2 font-semibold">
                  <span className="size-2.5 rounded-full" style={{ background: colorByCourse.get(open.courseName) }} aria-hidden="true" />
                  {open.courseName}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-500">Correo</dt>
                <dd>
                  <EmailLink email={open.email} />
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-ink-500">Celular</dt>
                <dd>
                  {open.phone ? (
                    <PhoneCopy phone={open.phone} className="text-marino-900" />
                  ) : (
                    <span className="text-ink-500">No registrado</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">Clases en este salón</h3>
              {classes.length ? (
                <ul className="flex flex-col gap-1.5">
                  {classes.map((e) => (
                    <li key={`${e.day}-${e.start}`} className="flex justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                      <span className="font-semibold">{e.day}</span>
                      <span className="tabular text-ink-700">
                        {e.start} – {e.end}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">Sin clases asignadas en este salón.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {open.phone && (
                <Button variant="navy" icon={<FiCopy />} onClick={() => copyPhone(open.phone!)}>
                  Copiar número
                </Button>
              )}
              <EmailLink email={open.email} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-field px-4 text-sm text-ink-900 hover:bg-surface-2">
                <FiMail aria-hidden="true" /> Redactar en Gmail
              </EmailLink>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
