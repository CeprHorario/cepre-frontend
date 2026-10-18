import { useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "react-toastify";
import { FiCheck, FiDownload, FiFileText, FiShield, FiUploadCloud, FiUsers } from "react-icons/fi";
import { apiErrorMessage, post } from "@/api/client";
import { SupervisorsApi } from "@/api/services";
import { useCourses, useShifts, useSupervisors, useTeachers } from "@/api/queries";
import type { Course, JobStatus, Shift } from "@/api/types";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/EmptyState";
import { Checkbox } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { normalizeKey, parseCsv, plain, toCsv } from "@/lib/csv";
import { downloadBlob } from "@/lib/format";
import { isDni, isEmail, isLoginEmail, isPeruMobile, splitPhones } from "@/lib/validators";

type Kind = "docentes" | "supervisores";

interface Row {
  line: number;
  values: Record<string, string>;
  errors: string[];
  payload?: Record<string, unknown>;
}

const TEMPLATES: Record<Kind, string[]> = {
  docentes: ["dni", "nombres", "apellidos", "correo", "correo_personal", "celular", "celulares_adicionales", "curso", "dedicacion", "horas_maximas"],
  supervisores: ["dni", "nombres", "apellidos", "correo", "correo_personal", "celular", "turno"],
};

const EXAMPLES: Record<Kind, string[]> = {
  docentes: ["41230098", "Pablo", "Arce Luna", "parce@cepr.unsa.pe", "pablo@gmail.com", "987654321", "", "Física", "Medio tiempo", "20"],
  supervisores: ["72118833", "Inés", "Bellido Rosas", "ibellido@cepr.unsa.pe", "", "951004732", "Turno 01"],
};

const JOB_ALIASES: Record<string, JobStatus> = {
  fulltime: "FullTime",
  "tiempo completo": "FullTime",
  parttime: "PartTime",
  "medio tiempo": "PartTime",
  freetime: "FreeTime",
  "tiempo libre": "FreeTime",
};

function pick(values: Record<string, string>, ...keys: string[]) {
  for (const key of keys) if (values[normalizeKey(key)]) return values[normalizeKey(key)];
  return "";
}

function findCourse(courses: Course[], name: string) {
  return courses.find((c) => plain(c.name) === plain(name));
}

function suggestCourse(courses: Course[], name: string) {
  const target = plain(name);
  return courses.find((c) => plain(c.name).startsWith(target.slice(0, 4)));
}

function validate(kind: Kind, raw: Record<string, string>[], courses: Course[], shifts: Shift[]): Row[] {
  const seenEmails = new Map<string, number>();
  const seenDni = new Map<string, number>();
  return raw.map((values, index) => {
    const line = index + 2;
    const errors: string[] = [];
    const dni = pick(values, "dni");
    const firstName = pick(values, "nombres", "firstName");
    const lastName = pick(values, "apellidos", "lastName");
    const email = pick(values, "correo", "email", "correo_institucional");
    const personalEmail = pick(values, "correo_personal", "personalEmail");
    const phone = pick(values, "celular", "phone", "telefono");
    const extraPhones = splitPhones(pick(values, "celulares_adicionales", "phonesAdditional"));

    if (!isDni(dni)) errors.push(`DNI con ${dni.length} dígitos`);
    if (!firstName || !lastName) errors.push("Faltan nombres o apellidos");
    if (!isLoginEmail(email)) errors.push("Correo no válido");
    if (personalEmail && !isEmail(personalEmail)) errors.push("Correo personal no válido");
    if (phone && !isPeruMobile(phone)) errors.push("Celular no válido");
    if (seenEmails.has(email.toLowerCase())) errors.push(`Correo repetido (fila ${seenEmails.get(email.toLowerCase())})`);
    if (seenDni.has(dni)) errors.push(`DNI repetido (fila ${seenDni.get(dni)})`);
    seenEmails.set(email.toLowerCase(), line);
    seenDni.set(dni, line);

    const base = { dni, firstName, lastName, email, personalEmail: personalEmail || undefined, phone: phone || undefined };

    if (kind === "docentes") {
      const courseName = pick(values, "curso", "course");
      const course = findCourse(courses, courseName);
      if (!course) {
        const suggestion = suggestCourse(courses, courseName);
        errors.push(courseName ? `Curso «${courseName}» no existe${suggestion ? ` · ¿${suggestion.name}?` : ""}` : "Falta el curso");
      }
      const jobRaw = pick(values, "dedicacion", "jobStatus");
      const jobStatus = JOB_ALIASES[plain(jobRaw)] ?? JOB_ALIASES[plain(jobRaw).replace(/\s/g, "")];
      if (!jobStatus) errors.push("Dedicación no válida");
      const maxHours = Number(pick(values, "horas_maximas", "maxHours")) || undefined;
      return {
        line,
        values,
        errors,
        payload: errors.length ? undefined : { ...base, phonesAdditional: extraPhones, courseId: course!.id, jobStatus, maxHours, isCoordinator: false },
      };
    }

    const shiftName = pick(values, "turno", "shift");
    const shift = shifts.find((s) => plain(s.name) === plain(shiftName));
    if (!shift) errors.push(shiftName ? `Turno «${shiftName}» no existe` : "Falta el turno");
    return { line, values, errors, payload: errors.length ? undefined : { ...base, phonesAdditional: extraPhones, shift_id: shift!.id } };
  });
}

export function ImportarPage() {
  const [kind, setKind] = useState<Kind>("docentes");
  const [fileName, setFileName] = useState<string | null>(null);
  const [raw, setRaw] = useState<Record<string, string>[]>([]);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const courses = useCourses();
  const shifts = useShifts();
  const teachers = useTeachers({ page: 1, limit: 1 });
  const supervisors = useSupervisors({ page: 1, limit: 1 });

  const rows = useMemo(() => validate(kind, raw, courses.data ?? [], shifts.data ?? []), [kind, raw, courses.data, shifts.data]);
  const valid = rows.filter((r) => r.payload);
  const invalid = rows.filter((r) => !r.payload);
  const visible = onlyErrors ? invalid : [...invalid, ...valid];

  const reset = () => {
    setFileName(null);
    setRaw([]);
    setResult(null);
    if (input.current) input.current.value = "";
  };

  const readFile = async (file: File) => {
    setResult(null);
    const text = await file.text();
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const data = JSON.parse(text) as Record<string, unknown>[];
        if (!Array.isArray(data)) throw new Error("El JSON debe ser una lista");
        setRaw(data.map((item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [normalizeKey(k), Array.isArray(v) ? v.join(",") : String(v ?? "")]))));
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        setRaw(parseCsv(text));
      } else {
        toast.error("Sube un archivo .csv o .json");
        return;
      }
      setFileName(file.name);
    } catch (error) {
      toast.error(error instanceof Error ? `No se pudo leer el archivo: ${error.message}` : "No se pudo leer el archivo");
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void readFile(file);
  };

  const downloadTemplate = () => {
    const csv = toCsv([TEMPLATES[kind], EXAMPLES[kind]]);
    downloadBlob(new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" }), `plantilla_${kind}.csv`);
  };

  const send = async () => {
    setSending(true);
    setProgress(0);
    try {
      if (kind === "docentes") {
        await post("/teachers/json", valid.map((r) => r.payload));
        setProgress(valid.length);
        setResult(`${valid.length} docentes importados`);
      } else {
        let ok = 0;
        for (const row of valid) {
          try {
            await SupervisorsApi.create(row.payload as never);
            ok += 1;
          } catch (error) {
            toast.error(`Fila ${row.line}: ${apiErrorMessage(error)}`);
          }
          setProgress((p) => p + 1);
        }
        setResult(`${ok} de ${valid.length} supervisores importados`);
      }
      toast.success("Importación terminada");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo importar el archivo"));
    } finally {
      setSending(false);
    }
  };

  const options: { value: Kind; label: string; count?: number; icon: React.ReactNode }[] = [
    { value: "docentes", label: "Docentes", count: teachers.data?.total, icon: <FiUsers /> },
    { value: "supervisores", label: "Supervisores", count: supervisors.data?.total, icon: <FiShield /> },
  ];
  const headers = TEMPLATES[kind];

  return (
    <SimpleLayout crumbs={[{ label: "Menú principal", to: "/admin" }, { label: "Importar archivos" }]}>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-7 sm:px-10">
        <PageHeader title="Importar archivos" description="Los registros se agregan al proceso actual. Revisa la vista previa antes de confirmar." />

        <div role="radiogroup" aria-label="Tipo de registro" className="flex flex-wrap gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={kind === option.value}
              onClick={() => {
                setKind(option.value);
                reset();
              }}
              className={cn(
                "flex min-w-[200px] flex-1 cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left",
                kind === option.value ? "border-2 border-guinda-700 bg-[#FCF7F8]" : "border-line hover:border-marino-300",
              )}
            >
              <span className={cn("flex size-10 items-center justify-center rounded-xl text-lg", kind === option.value ? "bg-guinda-700 text-white" : "bg-marino-50 text-marino-900")}>
                {option.icon}
              </span>
              <span className="flex flex-col">
                <strong className="text-[15px] text-marino-900">{option.label}</strong>
                <span className="text-xs text-ink-500">{option.count ?? "…"} registrados</span>
              </span>
            </button>
          ))}
        </div>
        <Alert tone="info">Los monitores no se importan: se crean automáticamente al generar el proceso, uno por salón.</Alert>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Card className="flex flex-col gap-5 p-5">
            <Step n={1} done={false} title="Descarga la plantilla">
              <span className="text-[13px] leading-6 text-ink-500">Columnas: {headers.join(", ")}.</span>
              <Button size="sm" variant="secondary" icon={<FiDownload />} onClick={downloadTemplate} className="w-fit">
                Plantilla CSV
              </Button>
            </Step>
            <Step n={2} done={Boolean(fileName)} title="Sube el archivo">
              {fileName ? (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
                  <FiFileText className="text-marino-900" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-[13px]">{fileName}</strong>
                    <span className="text-xs text-ink-500">{rows.length} filas</span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={reset}>
                    Cambiar
                  </Button>
                </div>
              ) : (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center",
                    dragging ? "border-guinda-700 bg-guinda-50" : "border-[#B9BCCB] bg-surface-2",
                  )}
                >
                  <FiUploadCloud className="text-3xl text-guinda-700" aria-hidden="true" />
                  <strong className="text-sm">Arrastra el archivo o haz clic</strong>
                  <span className="text-xs text-ink-500">CSV o JSON</span>
                  <input ref={input} type="file" accept=".csv,.json,application/json,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
                </label>
              )}
            </Step>
            <Step n={3} done={Boolean(result)} title="Revisa y confirma">
              <span className="text-[13px] leading-6 text-ink-500">Las filas con errores se omiten. Puedes corregir el archivo y volver a subirlo.</span>
            </Step>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-lg font-bold text-marino-900">Vista previa</h2>
              {rows.length > 0 && (
                <div className="flex gap-2">
                  <Badge tone="ok">{valid.length} válidas</Badge>
                  {invalid.length > 0 && <Badge tone="danger">{invalid.length} con errores</Badge>}
                </div>
              )}
            </div>
            {rows.length === 0 ? (
              <p className="px-5 py-14 text-center text-sm text-ink-500">Sube un archivo para ver aquí cada fila validada.</p>
            ) : (
              <div className="max-h-[460px] overflow-auto">
                <table className="w-full min-w-[640px] border-collapse text-[13px]">
                  <thead className="sticky top-0">
                    <tr>
                      {["Fila", "DNI", "Nombre", "Correo", kind === "docentes" ? "Curso" : "Turno", "Estado"].map((h) => (
                        <th key={h} className="border-b border-line bg-surface-2 px-3 py-2.5 text-left text-xs font-bold text-ink-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((row) => (
                      <tr key={row.line} className={row.payload ? "" : "bg-[#FFF8F7]"}>
                        <td className="border-b border-line-soft px-3 py-2.5">{row.line}</td>
                        <td className="border-b border-line-soft px-3 py-2.5">{pick(row.values, "dni")}</td>
                        <td className="border-b border-line-soft px-3 py-2.5">
                          {pick(row.values, "apellidos", "lastName")}, {pick(row.values, "nombres", "firstName")}
                        </td>
                        <td className="border-b border-line-soft px-3 py-2.5">{pick(row.values, "correo", "email")}</td>
                        <td className="border-b border-line-soft px-3 py-2.5">{pick(row.values, kind === "docentes" ? "curso" : "turno")}</td>
                        <td className={cn("border-b border-line-soft px-3 py-2.5 font-semibold", row.payload ? "text-ok-700" : "text-danger-700")}>
                          {row.payload ? "Lista" : row.errors.join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows.length > 0 && (
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-surface-2 px-5 py-4">
                <Checkbox label="Mostrar solo filas con errores" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} />
                {result ? (
                  <Badge tone="ok">
                    <FiCheck /> {result}
                  </Badge>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={reset} disabled={sending}>
                      Cancelar
                    </Button>
                    <Button onClick={send} loading={sending} disabled={!valid.length}>
                      {sending && kind === "supervisores" ? `${progress} / ${valid.length}` : `Importar ${valid.length} ${kind}`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </SimpleLayout>
  );
}

function Step({ n, done, title, children }: { n: number; done: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white", done ? "bg-ok-600" : "bg-marino-900")}>
        {done ? <FiCheck /> : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <strong className="text-[15px]">{title}</strong>
        {children}
      </div>
    </div>
  );
}
