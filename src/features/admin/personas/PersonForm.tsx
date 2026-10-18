import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { isDni, isEmail, isLoginEmail, isPeruMobile, LOGIN_EMAIL_HINT, LOGIN_EMAIL_LABEL, onlyDigits, onlyLetters, splitPhones } from "@/lib/validators";

export interface PersonValues {
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  phonesAdditional: string;
  personalEmail: string;
}

export const emptyPerson: PersonValues = {
  email: "",
  dni: "",
  firstName: "",
  lastName: "",
  phone: "",
  phonesAdditional: "",
  personalEmail: "",
};

type FieldName = keyof PersonValues;

interface Props {
  open: boolean;
  title: string;
  description?: string;
  initial: PersonValues;
  /** Campos visibles y obligatorios */
  fields: FieldName[];
  required: FieldName[];
  saving?: boolean;
  submitLabel: string;
  /** Campos propios de cada rol; `submitted` permite mostrar sus errores igual que los comunes */
  extra?: (values: PersonValues, submitted: boolean) => ReactNode;
  extraValid?: boolean;
  onClose: () => void;
  onSubmit: (values: PersonValues) => void;
}

/** Formulario de datos personales compartido por supervisores, coordinadores y monitores */
export function PersonForm({ open, title, description, initial, fields, required, saving, submitLabel, extra, extraValid = true, onClose, onSubmit }: Props) {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const set = (key: FieldName, value: string) => setValues((prev) => ({ ...prev, [key]: value }));
  const has = (key: FieldName) => fields.includes(key);
  const req = (key: FieldName) => required.includes(key);

  const errors: Partial<Record<FieldName, string | false>> = {
    email: has("email") && (req("email") || values.email) && !isLoginEmail(values.email) && "Ingresa un correo válido",
    dni: has("dni") && (req("dni") || values.dni) && !isDni(values.dni) && "El DNI debe tener 8 dígitos",
    firstName: has("firstName") && req("firstName") && !values.firstName.trim() && "Ingresa los nombres",
    lastName: has("lastName") && req("lastName") && !values.lastName.trim() && "Ingresa los apellidos",
    phone: has("phone") && (req("phone") || values.phone) && !isPeruMobile(values.phone) && "Debe tener 9 dígitos y empezar con 9",
    phonesAdditional: has("phonesAdditional") && splitPhones(values.phonesAdditional).some((p) => !isPeruMobile(p)) && "Cada celular debe tener 9 dígitos",
    personalEmail: has("personalEmail") && values.personalEmail && !isEmail(values.personalEmail) && "Correo no válido",
  };
  const invalid = Object.values(errors).some(Boolean) || !extraValid;
  const show = (key: FieldName) => (submitted ? errors[key] : false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!invalid) onSubmit(values);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={description ?? "Los campos con * son obligatorios."}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="person-form" loading={saving}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="person-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
        {submitted && invalid && <Alert tone="danger">Revisa los campos marcados.</Alert>}
        {has("email") && (
          <Field
            label={LOGIN_EMAIL_LABEL}
            required={req("email")}
            error={show("email")}
            hint={LOGIN_EMAIL_HINT}
          >
            {(p) => <Input {...p} invalid={p.invalid} type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
        )}
        {has("dni") && (
          <Field label="DNI" required={req("dni")} optional={!req("dni")} error={show("dni")}>
            {(p) => <Input {...p} invalid={p.invalid} inputMode="numeric" value={values.dni} onChange={(e) => set("dni", onlyDigits(e.target.value, 8))} />}
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {has("firstName") && (
            <Field label="Nombres" required={req("firstName")} error={show("firstName")}>
              {(p) => <Input {...p} invalid={p.invalid} value={values.firstName} onChange={(e) => set("firstName", onlyLetters(e.target.value))} />}
            </Field>
          )}
          {has("lastName") && (
            <Field label="Apellidos" required={req("lastName")} error={show("lastName")}>
              {(p) => <Input {...p} invalid={p.invalid} value={values.lastName} onChange={(e) => set("lastName", onlyLetters(e.target.value))} />}
            </Field>
          )}
        </div>
        {has("personalEmail") && (
          <Field label="Correo personal" optional error={show("personalEmail")}>
            {(p) => <Input {...p} invalid={p.invalid} type="email" value={values.personalEmail} onChange={(e) => set("personalEmail", e.target.value)} />}
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {has("phone") && (
            <Field label="Celular" required={req("phone")} optional={!req("phone")} error={show("phone")}>
              {(p) => <Input {...p} invalid={p.invalid} inputMode="numeric" value={values.phone} onChange={(e) => set("phone", onlyDigits(e.target.value, 9))} />}
            </Field>
          )}
          {has("phonesAdditional") && (
            <Field label="Otros celulares" optional error={show("phonesAdditional")} hint="Separados por coma">
              {(p) => <Input {...p} invalid={p.invalid} value={values.phonesAdditional} onChange={(e) => set("phonesAdditional", e.target.value)} />}
            </Field>
          )}
        </div>
        {extra?.(values, submitted)}
      </form>
    </Drawer>
  );
}
