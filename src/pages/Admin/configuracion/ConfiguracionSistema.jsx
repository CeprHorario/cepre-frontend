import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SystemServices } from "@/services/SystemServices";

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const ConfiguracionSistema = () => {
  const queryClient = useQueryClient();
  const configQuery = useQuery({
    queryKey: ["runtimeConfig"],
    queryFn: SystemServices.getRuntimeConfig,
  });
  const schemasQuery = useQuery({
    queryKey: ["availableSchemas"],
    queryFn: SystemServices.getSchemas,
  });
  const historyQuery = useQuery({
    queryKey: ["runtimeConfigHistory"],
    queryFn: () => SystemServices.getHistory(20),
  });
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!configQuery.data) return;
    setForm({
      enabled: configQuery.data.maintenance.enabled,
      message: configQuery.data.maintenance.message,
      endsAt: toLocalDateTime(configQuery.data.maintenance.endsAt),
      adminSchema: configQuery.data.schemaRouting.adminSchema,
      userSchema: configQuery.data.schemaRouting.userSchema,
      changeReason: "",
    });
  }, [configQuery.data]);

  const refreshConfiguration = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["runtimeConfig"] }),
      queryClient.invalidateQueries({ queryKey: ["runtimeConfigHistory"] }),
      queryClient.invalidateQueries({ queryKey: ["systemStatus"] }),
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
    ]);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      SystemServices.updateRuntimeConfig({
        expectedVersion: configQuery.data.version,
        maintenance: {
          enabled: form.enabled,
          message: form.message.trim(),
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        },
        schemaRouting: {
          adminSchema: form.adminSchema,
          userSchema: form.userSchema,
        },
        changeReason: form.changeReason.trim(),
      }),
    onSuccess: async () => {
      toast.success("Configuración actualizada");
      await refreshConfiguration();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "No se pudo guardar la configuración"),
  });

  const rollbackMutation = useMutation({
    mutationFn: SystemServices.rollback,
    onSuccess: async () => {
      toast.success("Configuración restaurada");
      await refreshConfiguration();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "No se pudo restaurar la versión"),
  });

  if (configQuery.isLoading || schemasQuery.isLoading || !form) {
    return <div className="p-8 text-slate-600">Cargando configuración…</div>;
  }
  if (configQuery.isError || schemasQuery.isError) {
    return <div className="p-8 text-red-700">No se pudo cargar la configuración del sistema.</div>;
  }

  const schemas = schemasQuery.data || [];
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const canSave =
    form.message.trim() &&
    form.changeReason.trim() &&
    form.adminSchema &&
    form.userSchema &&
    !updateMutation.isPending;

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#78211E]">Configuración del sistema</h1>
        <p className="mt-1 text-sm text-slate-600">
          Versión activa {configQuery.data.version}. Los cambios se guardan en Firestore y no modifican Cloud SQL.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Modo mantenimiento</h2>
          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setField("enabled", event.target.checked)}
              className="h-5 w-5 accent-[#78211E]"
            />
            <span>Bloquear el acceso de usuarios no administradores</span>
          </label>
          <label className="mt-5 block text-sm font-medium">
            Mensaje para los usuarios
            <textarea
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              maxLength={255}
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Finalización estimada (opcional)
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => setField("endsAt", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Enrutamiento de schemas</h2>
          <p className="mt-1 text-sm text-slate-500">El backend decide el schema usando el rol del token.</p>
          <label className="mt-5 block text-sm font-medium">
            Schema de administradores
            <select
              value={form.adminSchema}
              onChange={(event) => setField("adminSchema", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            >
              {schemas.map((schema) => (
                <option key={schema.name} value={schema.name}>{schema.name}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-medium">
            Schema de los demás usuarios
            <select
              value={form.userSchema}
              onChange={(event) => setField("userSchema", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            >
              {schemas.map((schema) => (
                <option key={schema.name} value={schema.name}>{schema.name}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-medium">
            Motivo del cambio
            <input
              value={form.changeReason}
              onChange={(event) => setField("changeReason", event.target.value)}
              maxLength={255}
              placeholder="Ej.: mantenimiento del proceso 2026-I"
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            />
          </label>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => updateMutation.mutate()}
            className="mt-6 w-full rounded-lg bg-[#78211E] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? "Guardando…" : "Guardar configuración"}
          </button>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Historial y restauración</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr><th className="py-3">Versión</th><th>Motivo</th><th>Mantenimiento</th><th>Schemas</th><th></th></tr>
            </thead>
            <tbody>
              {(historyQuery.data || []).map((item) => (
                <tr key={item.version} className="border-b border-slate-100">
                  <td className="py-3 font-medium">{item.version}</td>
                  <td>{item.changeReason || "Sin motivo"}</td>
                  <td>{item.maintenance.enabled ? "Activo" : "Inactivo"}</td>
                  <td>{item.schemaRouting.adminSchema} / {item.schemaRouting.userSchema}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      disabled={rollbackMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`¿Restaurar la versión ${item.version}?`)) {
                          rollbackMutation.mutate(item.version);
                        }
                      }}
                      className="font-semibold text-[#78211E] disabled:opacity-50 cursor-pointer"
                    >
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!historyQuery.isLoading && !historyQuery.data?.length && (
            <p className="py-6 text-center text-slate-500">Aún no existen versiones anteriores.</p>
          )}
        </div>
      </section>
    </div>
  );
};
