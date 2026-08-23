import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/Input";
import { LabelForm } from "@/components/ui/LabelForm";
import { Select } from "@/components/ui/Select";
import { useTurnos } from "@/hooks/useTurnos";
import { toast } from "react-toastify";

const valorInicial = {
  email: "",
  dni: "",
  firstName: "",
  lastName: "",
  phone: "",
  phonesAdditional: "",
  personalEmail: "",
  shift_id: "",
};

const limpiarTelefonos = (value) =>
  value
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean);

const normalizarTelefono = (value) => value.replace(/[^0-9]/g, "").slice(0, 9);

const FieldLabel = ({ text, required = false }) => (
  <div className="flex items-center gap-2">
    <LabelForm text={text} />
    {required ? (
      <span className="mt-5 text-sm font-bold text-[#78211E]">*</span>
    ) : (
      <span className="mt-5 text-xs font-medium text-gray-500">opcional</span>
    )}
  </div>
);

export const SupervisorForm = ({
  modo = "crear",
  supervisor = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { turnos } = useTurnos();
  const esEdicion = modo === "editar";
  const [confirmarEdicion, setConfirmarEdicion] = useState(false);
  const [formData, setFormData] = useState(() => ({
    ...valorInicial,
    email: supervisor?.email || "",
    dni: supervisor?.dni || "",
    firstName: supervisor?.firstName || "",
    lastName: supervisor?.lastName || "",
    phone: supervisor?.phone || "",
    phonesAdditional: (supervisor?.phonesAdditional || []).join(", "),
    personalEmail: supervisor?.personalEmail || "",
    shift_id: supervisor?.shift_id || supervisor?.shiftId || "",
  }));

  const titulo = esEdicion ? "Editar supervisor" : "Crear supervisor";
  const turnosOptions = useMemo(
    () => turnos.map((turno) => ({ id: turno.id, name: turno.name })),
    [turnos]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "dni") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "").slice(0, 8) }));
      return;
    }

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: normalizarTelefono(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const construirPayload = () => {
    const payload = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      personalEmail: formData.personalEmail.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      shift_id: formData.shift_id ? Number(formData.shift_id) : undefined,
    };

    if (!esEdicion) {
      payload.dni = formData.dni.trim();
      payload.phonesAdditional = limpiarTelefonos(formData.phonesAdditional);
    }

    if (esEdicion) {
      payload.id = supervisor.id;
    }

    return payload;
  };

  const validar = () => {
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Complete los campos obligatorios");
      return false;
    }

    if (!esEdicion && formData.dni.length !== 8) {
      toast.error("El DNI debe tener 8 digitos");
      return false;
    }

    if (formData.phone && !/^9\d{8}$/.test(formData.phone)) {
      toast.error("El celular debe tener 9 digitos y empezar con 9");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validar()) return;

    if (esEdicion) {
      setConfirmarEdicion(true);
      return;
    }

    await onSubmit(construirPayload());
  };

  const confirmarGuardar = async () => {
    await onSubmit(construirPayload());
    setConfirmarEdicion(false);
  };

  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-lg bg-white p-6 text-left shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold text-[#78211E]">{titulo}</h2>
        <p className="mb-2 text-center text-sm text-gray-600">
          Los campos marcados con <span className="font-bold text-[#78211E]">*</span> son obligatorios.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel text="Correo institucional:" required />
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />

            {!esEdicion && (
              <>
                <FieldLabel text="DNI:" required />
                <Input type="text" name="dni" value={formData.dni} onChange={handleChange} required />
              </>
            )}

            <FieldLabel text="Nombres:" required />
            <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

            <FieldLabel text="Apellidos:" required />
            <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          <div>
            <FieldLabel text="Correo personal:" />
            <Input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />

            <FieldLabel text="Celular:" />
            <Input type="text" name="phone" value={formData.phone} onChange={handleChange} />

            {!esEdicion && (
              <>
                <FieldLabel text="Celulares adicionales:" />
                <Input
                  type="text"
                  name="phonesAdditional"
                  value={formData.phonesAdditional}
                  onChange={handleChange}
                  placeholder="Separados por coma"
                />
              </>
            )}

            <FieldLabel text="Turno:" />
            <Select name="shift_id" value={formData.shift_id} onChange={handleChange} options={turnosOptions} />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <ButtonNegative type="button" onClick={onCancel} disabled={isLoading}>
            Atras
          </ButtonNegative>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={confirmarEdicion}
        title="Confirmar edicion"
        message={`Se actualizaran los datos de ${formData.firstName} ${formData.lastName}.`}
        confirmText="Guardar cambios"
        isLoading={isLoading}
        onCancel={() => setConfirmarEdicion(false)}
        onConfirm={confirmarGuardar}
      />
    </div>
  );
};
