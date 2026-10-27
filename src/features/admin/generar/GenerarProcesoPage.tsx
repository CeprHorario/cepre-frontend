import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiAlertTriangle, FiCheck, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useCreateAdmission, useSedes, useShifts, useSystemMutations } from "@/api/queries";
import { SystemApi, type CreateAdmissionPayload } from "@/api/services";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Alert } from "@/components/ui/EmptyState";
import { Checkbox, Field, Input, Select } from "@/components/ui/Field";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { areaStyle } from "@/lib/areas";
import { cn } from "@/lib/cn";
import { addMinutes, minutesOf, toHHMM } from "@/lib/schedule";

const PROCESSES = ["Ordinario I Fase", "Ciclo Quintos", "Ordinario II Fase", "Extraordinario"];
const DOMAINS = ["@cepr.unsa.pe", "@unsa.edu.pe"];
const REGULAR_AREAS = ["Biomédicas", "Ingenierías", "Sociales"];
const DRAFT_KEY = "ceprunsa:borrador-proceso";
const SHIFT_COLORS = ["#1C2140", "#661124", "#B58B3E", "#2E3566", "#8A1C33"];

interface Draft {
  process: string;
  year: number;
  sede: string;
  started: string;
  finished: string;
  domain: string;
  createSchedules: boolean;
  sessionMinutes: number;
  breakMinutes: number;
  shifts: { start: string; classes: Record<string, number> }[];
}

const initialDraft: Draft = {
  process: "",
  year: new Date().getFullYear() + 1,
  sede: "",
  started: "",
  finished: "",
  domain: "@cepr.unsa.pe",
  createSchedules: true,
  sessionMinutes: 40,
  breakMinutes: 5,
  shifts: [{ start: "07:00", classes: {} }],
};

const STEPS = ["Datos del proceso", "Turnos", "Salones por área", "Revisar y crear"];

/** 7 bloques (6 en Extraordinario), con duración configurable y sin descanso final. */
const endTime = (start: string, hours: number, session: number, rest: number) => (start ? addMinutes(start, hours * session + (hours - 1) * rest) : "");
const shiftName = (index: number) => `Turno ${String(index + 1).padStart(2, "0")}`;

export function GenerarProcesoPage() {
  const navigate = useNavigate();
  const sedes = useSedes();
  const currentShifts = useShifts();
  const create = useCreateAdmission();
  const { update } = useSystemMutations();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...initialDraft, ...JSON.parse(saved) } : initialDraft;
    } catch {
      return initialDraft;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // sin almacenamiento: el borrador no se conserva
    }
  }, [draft]);

  useEffect(() => {
    if (!draft.sede && sedes.data?.[0]) setDraft((d) => ({ ...d, sede: sedes.data![0].name }));
  }, [sedes.data, draft.sede]);

  const extraordinary = draft.process === "Extraordinario";
  const hours = extraordinary ? 6 : 7;
  const areas = extraordinary ? ["Extraordinario"] : REGULAR_AREAS;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setShift = (index: number, patch: Partial<Draft["shifts"][number]>) =>
    setDraft((d) => ({ ...d, shifts: d.shifts.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));

  const shifts = draft.shifts.map((s, i) => ({ ...s, name: shiftName(i), end: endTime(s.start, hours, draft.sessionMinutes, draft.breakMinutes) }));
  const overlaps = useMemo(() => {
    const result = new Set<number>();
    shifts.forEach((a, i) =>
      shifts.forEach((b, j) => {
        if (i < j && a.start && b.start && minutesOf(a.start) < minutesOf(b.end) && minutesOf(b.start) < minutesOf(a.end)) result.add(j);
      }),
    );
    return result;
  }, [shifts]);
  const totalClasses = shifts.reduce((sum, s) => sum + areas.reduce((acc, area) => acc + (s.classes[area] ?? 0), 0), 0);

  const stepErrors: string[][] = [
    [
      !draft.process && "Selecciona el proceso",
      !draft.sede && "Selecciona la sede",
      (!draft.started || !draft.finished) && "Indica las fechas de inicio y fin",
      draft.started && draft.finished && draft.started >= draft.finished && "La fecha de inicio debe ser anterior a la de fin",
    ].filter(Boolean) as string[],
    [!shifts.length && "Agrega al menos un turno", shifts.some((s) => !s.start) && "Todos los turnos necesitan hora de inicio", (!Number.isInteger(draft.sessionMinutes) || draft.sessionMinutes < 1 || draft.sessionMinutes > 180) && "La hora pedagógica debe tener entre 1 y 180 minutos", (!Number.isInteger(draft.breakMinutes) || draft.breakMinutes < 0 || draft.breakMinutes > 120) && "El descanso debe tener entre 0 y 120 minutos", shifts.some((s) => minutesOf(s.end) >= 24 * 60) && "Los turnos deben terminar antes de medianoche"].filter(Boolean) as string[],
    [totalClasses === 0 && "Indica al menos un salón", shifts.some((s) => areas.every((area) => !(s.classes[area] > 0))) && "Cada turno debe tener al menos un salón"].filter(Boolean) as string[],
    [],
  ];

  const next = () => {
    setTried(true);
    if (stepErrors[step].length) return;
    setTried(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    if (submitting) return;
    const invalidStep = stepErrors.findIndex((errors) => errors.length > 0);
    if (invalidStep >= 0) { setStep(invalidStep); setTried(true); return; }
    const payload: CreateAdmissionPayload = {
      name: draft.process,
      year: draft.year,
      sede: draft.sede,
      started: draft.started,
      finished: draft.finished,
      configuration: {
        emailDomain: draft.domain,
        createSchedules: draft.createSchedules,
        sessionMinutes: draft.sessionMinutes,
        breakMinutes: draft.breakMinutes,
        shifts: shifts.map((s) => ({
          name: s.name,
          startTime: s.start,
          endTime: s.end,
          classesToAreas: areas.filter((area) => (s.classes[area] ?? 0) > 0).map((area) => ({ area, quantityClasses: s.classes[area] ?? 0 })),
        })),
      },
    };
    setSubmitting(true);
    try {
      const created = await create.mutateAsync(payload);
      localStorage.removeItem(DRAFT_KEY);
      try {
        const config = await SystemApi.config();
        await update.mutateAsync({
          expectedVersion: config.version,
          maintenance: config.maintenance,
          schemaRouting: { ...config.schemaRouting, adminSchema: created.data.name },
          changeReason: `Preparar proceso ${draft.process} ${draft.year}`,
        });
      } catch (error) {
        toast.warning(`Proceso creado; falta seleccionarlo para administradores en Configurar sistema. ${apiErrorMessage(error, "No se pudo actualizar la configuración.")}`);
        navigate("/admin/configuracion");
        return;
      }
      toast.success("Proceso de admisión creado");
      navigate("/admin");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo crear el proceso"));
    } finally {
      setSubmitting(false);
    }
  };

  const copyCurrent = () => {
    const list = (currentShifts.data ?? []).map((s) => ({ start: toHHMM(s.startTime), classes: {} }));
    if (list.length) set("shifts", list);
  };

  return (
    <SimpleLayout crumbs={[{ label: "Menú principal", to: "/admin" }, { label: "Generar proceso" }]}>
      <section className="bg-marino-900 px-4 py-5 sm:px-10">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3" aria-label="Pasos">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-3" aria-current={i === step ? "step" : undefined}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className={cn("flex items-center gap-3 text-left text-[13px] disabled:cursor-default", i <= step ? "cursor-pointer text-white" : "text-white/60")}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-bold",
                    i < step ? "border-ok-600 bg-ok-600" : i === step ? "border-oro-500 bg-oro-500 text-marino-900" : "border-white/35",
                  )}
                >
                  {i < step ? <FiCheck /> : i + 1}
                </span>
                <strong className="hidden sm:inline">{label}</strong>
              </button>
              {i < STEPS.length - 1 && <span className={cn("hidden h-0.5 min-w-6 flex-1 md:block", i < step ? "bg-ok-600" : "bg-white/20")} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-start gap-6 px-4 py-7 sm:px-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <h1 className="font-display text-2xl font-extrabold text-marino-900">{STEPS[step]}</h1>
          {tried && stepErrors[step].length > 0 && (
            <Alert tone="danger" title="Falta completar">
              {stepErrors[step].join(". ")}.
            </Alert>
          )}

          {step === 0 && (
            <Card className="grid gap-4 p-6 sm:grid-cols-2">
              <Field label="Proceso" required className="sm:col-span-2">
                {(p) => (
                  <Select {...p} value={draft.process} onChange={(e) => set("process", e.target.value)}>
                    <option value="">Selecciona…</option>
                    {PROCESSES.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Año" required>
                {(p) => (
                  <Select {...p} value={draft.year} onChange={(e) => set("year", Number(e.target.value))}>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Sede" required>
                {(p) => (
                  <Select {...p} value={draft.sede} onChange={(e) => set("sede", e.target.value)}>
                    {(sedes.data ?? []).map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Fecha de inicio" required>
                {(p) => <Input {...p} type="date" value={draft.started} onChange={(e) => set("started", e.target.value)} />}
              </Field>
              <Field label="Fecha de fin" required>
                {(p) => <Input {...p} type="date" value={draft.finished} min={draft.started} onChange={(e) => set("finished", e.target.value)} />}
              </Field>
              <Field label="Dominio de correo" required hint="Dominio de los correos que se generan para los monitores.">
                {(p) => (
                  <Select {...p} value={draft.domain} onChange={(e) => set("domain", e.target.value)}>
                    {DOMAINS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </Card>
          )}

          {step === 1 && (
            <>
              <Card className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Hora pedagógica (minutos)" hint="Duración de cada bloque de clase.">{(p) => <Input {...p} type="number" min={1} max={180} step={1} value={draft.sessionMinutes} onChange={(e) => set("sessionMinutes", Number(e.target.value))} />}</Field>
                <Field label="Descanso entre bloques (minutos)" hint="No se agrega descanso después del último bloque.">{(p) => <Input {...p} type="number" min={0} max={120} step={1} value={draft.breakMinutes} onChange={(e) => set("breakMinutes", Number(e.target.value))} />}</Field>
              </Card>
              <p className="text-sm leading-6 text-ink-500">
                Indica la hora de inicio. El fin se calcula con {hours} bloques de {draft.sessionMinutes} minutos y descansos de {draft.breakMinutes} minutos.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-ink-700">Plantilla:</span>
                <Button size="sm" variant="secondary" onClick={copyCurrent} disabled={!currentShifts.data?.length}>
                  Igual al proceso actual ({currentShifts.data?.length ?? 0} turnos)
                </Button>
              </div>
              {shifts.map((s, i) => (
                <Card key={i} className={cn("flex flex-col gap-3 p-5", overlaps.has(i) && "border-oro-300 bg-[#FFFCF5]")}>
                  <div className="grid items-end gap-4 sm:grid-cols-[120px_1fr_1fr_44px]">
                    <div className="flex flex-col gap-1">
                      <SectionLabel>Turno</SectionLabel>
                      <strong className="font-display text-lg text-marino-900">{String(i + 1).padStart(2, "0")}</strong>
                    </div>
                    <Field label="Hora de inicio" required>
                      {(p) => <Input {...p} type="time" value={s.start} onChange={(e) => setShift(i, { start: e.target.value })} />}
                    </Field>
                    <Field label="Hora de fin">
                      {(p) => <Input {...p} readOnly value={s.end ? `${s.end} (calculada)` : "—"} className="bg-surface-2 text-ink-500" />}
                    </Field>
                    <IconButton label={`Quitar ${s.name}`} disabled={shifts.length === 1} onClick={() => set("shifts", draft.shifts.filter((_, j) => j !== i))}>
                      <FiTrash2 />
                    </IconButton>
                  </div>
                  {overlaps.has(i) && (
                    <span className="flex items-center gap-2 text-[13px] text-[#6B4E14]">
                      <FiAlertTriangle aria-hidden="true" /> Se superpone con otro turno. Es válido si los docentes son distintos.
                    </span>
                  )}
                </Card>
              ))}
              <button
                type="button"
                disabled={shifts.length >= 5}
                onClick={() => set("shifts", [...draft.shifts, { start: "", classes: {} }])}
                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#B9BCCB] bg-white text-sm font-semibold text-marino-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPlus /> Agregar turno (máximo 5)
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {shifts.map((s, i) => (
                <Card key={i} className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <strong className="font-display text-base text-marino-900">{s.name}</strong>
                    <span className="tabular text-[13px] text-ink-500">
                      {s.start} – {s.end}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {areas.map((area) => (
                      <Field key={area} label={area}>
                        {(p) => (
                          <div className="flex items-center gap-2">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: areaStyle(area).dot }} aria-hidden="true" />
                            <Input
                              {...p}
                              type="number"
                              min={0}
                              value={s.classes[area] ?? ""}
                              onChange={(e) => setShift(i, { classes: { ...s.classes, [area]: Math.max(0, Number(e.target.value) || 0) } })}
                            />
                          </div>
                        )}
                      </Field>
                    ))}
                  </div>
                </Card>
              ))}
            </>
          )}

          {step === 3 && (
            <Card className="flex flex-col gap-4 p-6">
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[180px_1fr]">
                <dt className="text-ink-500">Proceso</dt>
                <dd className="font-semibold">
                  {draft.process} {draft.year}
                </dd>
                <dt className="text-ink-500">Fechas</dt>
                <dd className="font-semibold">
                  {draft.started} → {draft.finished}
                </dd>
                <dt className="text-ink-500">Sede y dominio</dt>
                <dd className="font-semibold">
                  {draft.sede} · {draft.domain}
                </dd>
                <dt className="text-ink-500">Turnos</dt>
                <dd className="font-semibold">{draft.sessionMinutes} min de clase · {draft.breakMinutes} min de descanso</dd>
                <dt className="text-ink-500">Horarios</dt>
                <dd className="font-semibold">{shifts.map((s) => `${s.name} (${s.start}–${s.end})`).join(", ")}</dd>
                <dt className="text-ink-500">Salones y monitores</dt>
                <dd className="font-semibold">{totalClasses} salones, un monitor por salón</dd>
              </dl>
              <Checkbox
                checked={draft.createSchedules}
                onChange={(e) => set("createSchedules", e.target.checked)}
                label="Generar horarios automáticamente"
                description="Usa las plantillas de cada área. Recomendado."
              />
              <Alert tone="info">Al crear el proceso, los administradores pasarán a trabajar en él. Los demás usuarios conservarán su proceso hasta que lo cambies en Configurar sistema.</Alert>
            </Card>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button variant="secondary" icon={<FiChevronLeft />} onClick={() => (step === 0 ? navigate("/admin") : setStep(step - 1))}>
              {step === 0 ? "Cancelar" : "Atrás"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Continuar <FiChevronRight />
              </Button>
            ) : (
              <Button onClick={submit} loading={submitting}>
                Crear proceso
              </Button>
            )}
          </div>
        </div>

        <aside className="flex flex-[1_1_320px] flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <SectionLabel>Vista previa del día</SectionLabel>
            {shifts.map((s, i) => {
              const dayStart = 7 * 60;
              const dayEnd = 21.5 * 60;
              const left = s.start ? ((minutesOf(s.start) - dayStart) / (dayEnd - dayStart)) * 100 : 0;
              const width = s.start ? ((minutesOf(s.end) - minutesOf(s.start)) / (dayEnd - dayStart)) * 100 : 0;
              return (
                <div key={i} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5">
                  <strong className="text-xs">T{String(i + 1).padStart(2, "0")}</strong>
                  <div className="relative h-5 rounded-md bg-[#F1F2F6]">
                    {s.start && (
                      <div
                        className={cn("absolute inset-y-0 rounded-md", overlaps.has(i) && "outline-2 outline-offset-1 outline-dashed outline-danger-600")}
                        style={{ left: `${Math.max(0, left)}%`, width: `${width}%`, background: SHIFT_COLORS[i % SHIFT_COLORS.length] }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div className="tabular ml-[50px] flex justify-between text-[11px] text-ink-500">
              <span>07:00</span>
              <span>11:00</span>
              <span>15:00</span>
              <span>19:00</span>
              <span>21:30</span>
            </div>
          </Card>
          <Card className="flex flex-col gap-2 p-5 text-sm">
            <SectionLabel>Resumen</SectionLabel>
            <strong className="font-display text-lg text-marino-900">{draft.process ? `${draft.process} ${draft.year}` : "Nuevo proceso"}</strong>
            <div className="flex justify-between">
              <span className="text-ink-500">Turnos</span>
              <strong>{shifts.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Horas pedagógicas</span>
              <strong>{hours} por turno</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Salones</span>
              <strong className="tabular">{totalClasses}</strong>
            </div>
            <span className="pt-1 text-xs text-ink-500">El borrador se guarda en este navegador.</span>
          </Card>
        </aside>
      </div>
    </SimpleLayout>
  );
}
