import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiTool } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useAdmissions, useConfigHistory, useRuntimeConfig, useSchemas, useSystemMutations } from "@/api/queries";
import type { RuntimeConfig } from "@/api/types";
import { SimpleLayout } from "@/components/layout/ModuleLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, PageHeader, SectionLabel } from "@/components/ui/Card";
import { Alert } from "@/components/ui/EmptyState";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { LoadingScreen } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/format";

const toLocalInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export function ConfiguracionPage() {
  const config = useRuntimeConfig();
  const schemas = useSchemas();
  const admissions = useAdmissions();
  const history = useConfigHistory();
  const { update, rollback } = useSystemMutations();
  const [form, setForm] = useState<{ enabled: boolean; message: string; endsAt: string; adminSchema: string; userSchema: string; reason: string } | null>(null);
  const [toRestore, setToRestore] = useState<RuntimeConfig | null>(null);

  const reset = (data: RuntimeConfig) =>
    setForm({
      enabled: data.maintenance.enabled,
      message: data.maintenance.message,
      endsAt: toLocalInput(data.maintenance.endsAt),
      adminSchema: data.schemaRouting.adminSchema,
      userSchema: data.schemaRouting.userSchema,
      reason: "",
    });

  useEffect(() => {
    if (config.data) reset(config.data);
  }, [config.data]);

  if (config.isLoading || !form) return <SimpleLayout crumbs={[{ label: "Menú principal", to: "/admin" }, { label: "Configurar sistema" }]}><LoadingScreen /></SimpleLayout>;

  const label = (schema: string) => {
    const admission = admissions.data?.find((a) => a.name === schema);
    if (admission) return `${admission.description ?? admission.name}${admission.isCurrent ? " (actual)" : ""}`;
    return schema === "core_schema" ? "Base (sin proceso)" : schema;
  };
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));
  const dirty =
    config.data &&
    (form.enabled !== config.data.maintenance.enabled ||
      form.message !== config.data.maintenance.message ||
      form.endsAt !== toLocalInput(config.data.maintenance.endsAt) ||
      form.adminSchema !== config.data.schemaRouting.adminSchema ||
      form.userSchema !== config.data.schemaRouting.userSchema);
  const messageMissing = form.enabled && !form.message.trim();

  const save = async () => {
    if (!config.data) return;
    try {
      await update.mutateAsync({
        expectedVersion: config.data.version,
        maintenance: { enabled: form.enabled, message: form.message.trim(), endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null },
        schemaRouting: { adminSchema: form.adminSchema, userSchema: form.userSchema },
        changeReason: form.reason.trim(),
      });
      toast.success("Configuración guardada");
    } catch (error) {
      toast.error(apiErrorMessage(error, "No se pudo guardar la configuración"));
    }
  };

  return (
    <SimpleLayout crumbs={[{ label: "Menú principal", to: "/admin" }, { label: "Configurar sistema" }]}>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-7 sm:px-10">
        <PageHeader title="Configurar sistema" description={`Versión activa ${config.data?.version}. Los cambios aplican a todos los usuarios en unos segundos.`} />

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="flex flex-col gap-4 p-6">
            <CardHeader
              title="Modo mantenimiento"
              description="Bloquea el acceso a todos menos a los administradores."
              actions={<Switch checked={form.enabled} onChange={(v) => set("enabled", v)} label="Activar mantenimiento" />}
            />
            <Field label="Mensaje para los usuarios" required={form.enabled} error={messageMissing ? "Escribe el mensaje que verán los usuarios" : null} hint={`${form.message.length} / 255`}>
              {(p) => <Textarea {...p} invalid={p.invalid} maxLength={255} rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} />}
            </Field>
            <Field label="Finalización estimada" optional>
              {(p) => <Input {...p} type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />}
            </Field>
            {form.enabled && (
              <div className="flex flex-col gap-2">
                <SectionLabel>Así lo verán</SectionLabel>
                <div className="overflow-hidden rounded-2xl border border-line">
                  <div className="app-header h-1.5" />
                  <div className="flex items-start gap-3.5 bg-[#FCF7F8] p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-guinda-700 text-white">
                      <FiTool aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <strong className="font-display text-sm text-marino-900">Estamos mejorando el sistema</strong>
                      <span className="text-[13px] leading-5 text-ink-700">{form.message || "Escribe un mensaje…"}</span>
                      {form.endsAt && <span className="text-xs font-semibold text-warn-700">Finaliza: {formatDateTime(new Date(form.endsAt).toISOString())}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <CardHeader title="Proceso visible" description="Qué proceso de admisión ve cada tipo de usuario." />
            <Field label="Administradores">
              {(p) => (
                <Select {...p} value={form.adminSchema} onChange={(e) => set("adminSchema", e.target.value)}>
                  {(schemas.data ?? []).map((s) => (
                    <option key={s.name} value={s.name}>
                      {label(s.name)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Docentes, monitores, supervisores y coordinadores">
              {(p) => (
                <Select {...p} value={form.userSchema} onChange={(e) => set("userSchema", e.target.value)}>
                  {(schemas.data ?? []).map((s) => (
                    <option key={s.name} value={s.name}>
                      {label(s.name)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Alert tone="info">Útil para preparar un proceso nuevo como administrador mientras los demás siguen en el actual.</Alert>
            <Field label="Motivo del cambio" required hint="Queda registrado en el historial.">
              {(p) => <Input {...p} maxLength={255} placeholder="Ej.: carga de horarios del proceso 2028-I" value={form.reason} onChange={(e) => set("reason", e.target.value)} />}
            </Field>
            <div className="mt-auto flex justify-end gap-2">
              <Button variant="ghost" disabled={!dirty} onClick={() => config.data && reset(config.data)}>
                Descartar
              </Button>
              <Button onClick={save} loading={update.isPending} disabled={!dirty || !form.reason.trim() || messageMissing}>
                Guardar configuración
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader title="Historial de cambios" description="Últimas 20 versiones" />
          <ol className="mt-3 flex flex-col">
            {config.data && (
              <HistoryItem item={config.data} current label={label} />
            )}
            {(history.data ?? []).map((item) => (
              <HistoryItem key={item.version} item={item} label={label} onRestore={() => setToRestore(item)} />
            ))}
          </ol>
          {!history.isLoading && !history.data?.length && (
            <p className="pt-4 text-center text-[13px] text-ink-500">Cuando guardes un cambio, las versiones anteriores aparecerán aquí con la opción Restaurar.</p>
          )}
        </Card>
      </main>

      <ConfirmDialog
        open={Boolean(toRestore)}
        tone="primary"
        title={`¿Restaurar la versión ${toRestore?.version}?`}
        message="Se creará una nueva versión con esa configuración."
        confirmText="Restaurar"
        loading={rollback.isPending}
        onCancel={() => setToRestore(null)}
        onConfirm={async () => {
          try {
            await rollback.mutateAsync(toRestore!.version);
            toast.success("Configuración restaurada");
          } catch (error) {
            toast.error(apiErrorMessage(error, "No se pudo restaurar"));
          } finally {
            setToRestore(null);
          }
        }}
      />
    </SimpleLayout>
  );
}

function HistoryItem({ item, current, label, onRestore }: { item: RuntimeConfig; current?: boolean; label: (s: string) => string; onRestore?: () => void }) {
  return (
    <li className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3.5 border-b border-line-soft py-3 last:border-b-0">
      <span className={current ? "mt-1 size-3.5 rounded-full bg-guinda-700 shadow-[0_0_0_4px_#F7ECEE]" : "mt-1 size-3.5 rounded-full border-2 border-[#B9BCCB] bg-white"} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <strong className="text-sm">
          Versión {item.version}
          {current ? " · actual" : ""}
        </strong>
        <span className="text-[13px] text-ink-500">
          {item.changeReason || "Sin motivo"} · mantenimiento {item.maintenance.enabled ? "activo" : "inactivo"} · {label(item.schemaRouting.userSchema)}
        </span>
        <span className="text-xs text-ink-500">
          {formatDateTime(item.updatedAt)} · {item.updatedBy.email}
        </span>
      </div>
      {current ? (
        <span className="text-xs font-bold text-ok-700">Activa</span>
      ) : (
        <Button size="sm" variant="secondary" onClick={onRestore}>
          Restaurar
        </Button>
      )}
    </li>
  );
}
