import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiCheck, FiDownload, FiUploadCloud } from "react-icons/fi";
import { ImportsApi, type ImportKind, type ImportPreview } from "@/api/services";
import { apiErrorMessage } from "@/api/client";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/EmptyState";
import { downloadBlob } from "@/lib/format";

const OPTIONS: { value: ImportKind; label: string; description: string }[] = [
  { value: "docentes", label: "Registrar docentes", description: "Registra docentes nuevos con su curso, datos personales y horas máximas." },
  { value: "monitores", label: "Datos de monitores por salón", description: "Completa los datos personales del monitor identificando su salón y turno. Conserva el correo y la cuenta creados con el salón." },
  { value: "supervisores", label: "Supervisores y sus salones", description: "Registra o actualiza supervisores por correo y los vincula a los monitores de los salones indicados. Repite los mismos datos para varios salones del mismo turno." },
  { value: "disponibilidad", label: "Agregar disponibilidad docente", description: "Por docente y día, elige Rango con horas, Turno completo o Todo el día. Los alcances completos usan los horarios del proceso seleccionado. Conserva la disponibilidad anterior y no asigna salones." },
];

export function ImportarPage() {
  const client = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [kind, setKind] = useState<ImportKind>("docentes");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const option = OPTIONS.find((o) => o.value === kind)!;
  const schema = useQuery({ queryKey: ["imports", "columns", kind], queryFn: () => ImportsApi.columns(kind), staleTime: 5 * 60_000 });
  const rows = preview?.rows.filter((row) => !onlyErrors || row.errors.length > 0) ?? [];
  const visible = rows.slice(page * 50, page * 50 + 50);
  const columns = Object.keys(preview?.rows[0]?.values ?? {});

  const reset = () => {
    setPreview(null); setFile(null); setResult(null); setPage(0); setOnlyErrors(false);
    setUploadError(null); setDragging(false); dragDepth.current = 0;
    if (input.current) input.current.value = "";
  };

  const validate = async (selected: File) => {
    if (busy) return;
    setUploadError(null); setPreview(null); setResult(null); setFile(selected); setPage(0); setOnlyErrors(false);
    if (!/\.(xlsx|csv|json)$/i.test(selected.name)) {
      setUploadError("Formato no admitido. Usa Excel (.xlsx), CSV o JSON."); return;
    }
    if (!selected.size || selected.size > 8 * 1024 * 1024) {
      setUploadError("El archivo debe tener contenido y pesar como máximo 8 MB."); return;
    }
    setBusy(true);
    try { setPreview(await ImportsApi.preview(kind, selected)); }
    catch (error) { setUploadError(apiErrorMessage(error, "No se pudo validar el archivo")); }
    finally { setBusy(false); }
  };

  const chooseFiles = (files: FileList | null) => {
    if (busy || !files?.length) return;
    if (files.length !== 1) {
      setPreview(null); setFile(null); setResult(null);
      setUploadError("Arrastra un solo archivo para revisar el lote."); return;
    }
    void validate(files[0]);
  };

  const download = async () => {
    setBusy(true);
    try { downloadBlob(await ImportsApi.template(kind), `plantilla_${kind}.xlsx`); }
    catch (error) { toast.error(apiErrorMessage(error, "No se pudo descargar la plantilla")); }
    finally { setBusy(false); }
  };

  const apply = async () => {
    if (!file || !preview || preview.valid !== preview.total) return;
    setBusy(true);
    try {
      const applied = await ImportsApi.apply(kind, file, preview.schema);
      reset();
      setResult(`Lote completado: ${applied.processed} filas${applied.people !== undefined ? ` · ${applied.people} personas` : ""}${applied.teachers !== undefined ? ` · ${applied.teachers} docentes` : ""}${applied.blocks !== undefined ? ` · ${applied.blocks} bloques desasignados` : ""}.`);
      await Promise.all(["teachers", "classes", "monitors", "supervisors"].map((key) => client.invalidateQueries({ queryKey: [key] })));
      toast.success("Lote aplicado correctamente");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se aplicó el lote"));
      // Refresh errors if another administrator changed records after the preview.
      try { setPreview(await ImportsApi.preview(kind, file)); } catch { setPreview(null); }
    } finally { setBusy(false); }
  };

  return (
    <SimpleLayout crumbs={[{ label: "Menú principal", to: "/admin" }, { label: "Importar archivos" }]}>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-8">
        <div className="flex justify-center text-center"><PageHeader title="Importar archivos" description="Prepara tus datos, revisa el resultado y confirma la importación." /></div>
        <nav aria-label="Tipo de importación" className="flex justify-center">
          <div className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-line bg-white p-1.5 shadow-sm">
            {OPTIONS.map((item) => <button key={item.value} type="button" aria-pressed={kind === item.value} disabled={busy} onClick={() => { setKind(item.value); reset(); }} className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${kind === item.value ? "bg-marino-900 text-white shadow-sm" : "text-ink-500 hover:bg-surface-2 hover:text-marino-900"}`}>
              {{ docentes: "Docentes", monitores: "Monitores", supervisores: "Supervisores", disponibilidad: "Disponibilidad" }[item.value]}
            </button>)}
          </div>
        </nav>
        <ol aria-label="Pasos de importación" className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 text-xs sm:gap-8 sm:text-sm">
          {["Preparar archivo", "Revisar datos", "Confirmar lote"].map((label, index) => {
            const current = preview ? 1 : 0;
            return <li key={label} aria-current={current === index ? "step" : undefined} className={`flex items-center gap-2 ${index <= current ? "text-marino-900" : "text-ink-500"}`}><span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index <= current ? "bg-marino-900 text-white" : "bg-surface-2"}`}>{index < current ? <FiCheck aria-hidden="true" /> : index + 1}</span><span>{label}</span></li>;
          })}
        </ol>
        <Card className="mx-auto flex w-full max-w-[960px] flex-col gap-5 p-5 sm:p-8">
          {!file && <div className="mx-auto max-w-2xl text-center"><h2 className="text-xl font-bold text-marino-900">{option.label}</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">{option.description}</p></div>}
          {!file && <details className="rounded-xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-semibold text-marino-900">Cabeceras y formato del archivo</summary>
            <p className="my-3 text-xs text-ink-500">Usa los nombres de cabecera indicados. Conserva las columnas obligatorias; los valores opcionales pueden quedar vacíos. La plantilla Excel incluye esta guía, formatos y una fila de ejemplo.</p>
            {schema.isPending && <p role="status" className="text-sm text-ink-500">Cargando cabeceras…</p>}
            {schema.isError && <div className="flex items-center gap-3 text-sm text-danger-700">No se pudo cargar la guía.<Button variant="ghost" onClick={() => schema.refetch()}>Reintentar</Button></div>}
            {schema.data && <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead><tr>{["Cabecera exacta", "Valor", "Formato", "Ejemplo", "Descripción"].map((title) => <th key={title} className="border-b border-line bg-surface-2 px-3 py-2">{title}</th>)}</tr></thead>
              <tbody>{schema.data.map((column) => <tr key={column.key}>
                <td className="whitespace-nowrap border-b border-line-soft px-3 py-2">{column.label}{!column.headerRequired && <span className="block text-xs text-ink-500">Cabecera opcional</span>}</td>
                <td className="border-b border-line-soft px-3 py-2">{column.required ? "Obligatorio" : "Opcional"}</td>
                <td className="min-w-40 border-b border-line-soft px-3 py-2">{column.format}</td>
                <td className="border-b border-line-soft px-3 py-2">{column.example}</td>
                <td className="min-w-64 border-b border-line-soft px-3 py-2 text-ink-500">{column.description}</td>
              </tr>)}</tbody>
            </table></div>}
          </details>}
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" icon={<FiDownload />} disabled={busy} onClick={download}>Descargar plantilla Excel</Button>
            {!file && <Button icon={<FiUploadCloud />} disabled={busy} onClick={() => input.current?.click()}>Seleccionar archivo</Button>}
            <input ref={input} type="file" className="hidden" accept=".xlsx,.csv,.json" disabled={busy} onChange={(event) => { chooseFiles(event.target.files); event.target.value = ""; }} />
            {file && <Button variant="ghost" disabled={busy} onClick={() => validate(file)}>Volver a validar</Button>}
          </div>
          {!file ? <button
            type="button"
            disabled={busy}
            aria-label="Arrastrar o seleccionar archivo para importar"
            onClick={() => input.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); if (!busy) { dragDepth.current++; setDragging(true); } }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? "none" : "copy"; }}
            onDragLeave={(event) => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }}
            onDrop={(event) => { event.preventDefault(); dragDepth.current = 0; setDragging(false); chooseFiles(event.dataTransfer.files); }}
            className={`flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marino-900 disabled:cursor-wait ${dragging ? "border-marino-900 bg-marino-900/10" : "border-line bg-surface-2 hover:border-marino-900"}`}
          >
            <FiUploadCloud className="size-9 text-marino-900" aria-hidden="true" />
            <strong className="text-marino-900">{busy ? "Validando archivo…" : dragging ? "Suelta el archivo para previsualizarlo" : "Arrastra tu archivo aquí"}</strong>
            <span className="text-sm text-ink-500">o haz clic para seleccionarlo · Excel, CSV o JSON</span>
            <span className="text-xs text-ink-500">Se revisará antes de guardar. Todavía no se importará ningún registro.</span>
          </button> : <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 p-4">
            <div className="min-w-0 flex-1"><p className="text-xs text-ink-500">{option.label} · {(file.size / 1024).toFixed(1)} KB</p><strong className="block break-all text-sm text-marino-900">{file.name}</strong><p role="status" className="mt-1 text-xs text-ink-500">{busy ? "Procesando archivo…" : result ? "Importación completada" : preview ? "Revisa las filas antes de confirmar" : "Revisa el archivo y vuelve a validarlo"}</p></div>
            <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Cambiar archivo</Button>
            <Button variant="ghost" disabled={busy} onClick={reset}>Cancelar</Button>
          </div>}
          {uploadError && <Alert tone="danger">{uploadError}</Alert>}
          {!file && <p className="text-center text-xs text-ink-500">Excel (.xlsx), CSV o JSON · Máximo 10000 filas y 8 MB. La plantilla incluye cabeceras, formatos, guía, horarios, salones y cursos del proceso.</p>}
          {busy && <p role="status" className="text-sm text-ink-500">Procesando el lote…</p>}
        </Card>
        {result && <Alert tone="info">{result}</Alert>}
        {preview && <>
          <Alert tone={preview.valid === preview.total ? "info" : "danger"}>
            Proceso: <strong>{preview.schema}</strong> · {preview.valid} de {preview.total} filas válidas.
            {preview.valid !== preview.total ? " Corrige los errores y vuelve a validar. No se guardará ninguna fila mientras haya errores." : " La confirmación aplicará el archivo completo. El servidor volverá a validar los datos."}
          </Alert>
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
              <strong>Vista previa</strong>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyErrors} onChange={(event) => { setOnlyErrors(event.target.checked); setPage(0); }} />Solo errores</label>
            </div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
              <thead><tr>{["Fila", ...columns, "Resultado"].map((column) => <th key={column} className="whitespace-nowrap border-b border-line bg-surface-2 px-3 py-3 text-left">{schema.data?.find((item) => item.key === column)?.label ?? column}</th>)}</tr></thead>
              <tbody>{visible.map((row) => <tr key={row.line} className={row.errors.length ? "bg-red-50" : undefined}>
                <td className="border-b border-line-soft px-3 py-2">{row.line}</td>
                {columns.map((column) => <td key={column} className="max-w-72 border-b border-line-soft px-3 py-2">{row.values[column]}</td>)}
                <td className={`min-w-56 border-b border-line-soft px-3 py-2 ${row.errors.length ? "text-danger-700" : "text-ok-700"}`}>{row.errors.join(". ") || "Válido"}</td>
              </tr>)}</tbody>
            </table></div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="text-xs text-ink-500">{rows.length ? `${page * 50 + 1}–${Math.min((page + 1) * 50, rows.length)} de ${rows.length} filas` : "Sin filas para mostrar"}</span>
              <div className="flex gap-2"><Button variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button><Button variant="ghost" disabled={(page + 1) * 50 >= rows.length} onClick={() => setPage(page + 1)}>Siguiente</Button></div>
            </div>
          </Card>
          <div className="flex justify-end gap-3"><Button variant="ghost" disabled={busy} onClick={reset}>Cancelar</Button><Button loading={busy} disabled={preview.valid !== preview.total || busy} onClick={apply}>Confirmar lote</Button></div>
        </>}
      </main>
    </SimpleLayout>
  );
}
