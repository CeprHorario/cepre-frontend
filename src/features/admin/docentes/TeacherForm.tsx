import { useState } from "react";
import { toast } from "react-toastify";
import { apiErrorMessage } from "@/api/client";
import { useCourses, useTeacherMutations } from "@/api/queries";
import type { JobStatus, TeacherSummary } from "@/api/types";
import { Checkbox, Field, Input, Select } from "@/components/ui/Field";
import { emptyPerson, PersonForm } from "@/features/admin/personas/PersonForm";
import { JOB_STATUS_LABEL } from "@/lib/format";
import { splitPhones } from "@/lib/validators";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Con docente: edición. Sin docente: creación */
  teacher?: TeacherSummary | null;
}

/** Datos personales con el formulario común; curso, dedicación y horas son propios del docente */
export function TeacherForm({ open, onClose, teacher }: Props) {
  const editing = Boolean(teacher);
  const courses = useCourses();
  const { create, update } = useTeacherMutations();
  const [courseId, setCourseId] = useState(teacher ? String(teacher.courseId) : "");
  const [jobStatus, setJobStatus] = useState<JobStatus>(teacher?.jobStatus ?? "PartTime");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [maxHours, setMaxHours] = useState(teacher?.maxHours ? String(teacher.maxHours) : "");

  const courseError = !editing && !courseId && "Selecciona el curso";
  const maxHoursError = editing && (!Number(maxHours) || Number(maxHours) < 1) && "Indica las horas máximas";

  return (
    <PersonForm
      open={open}
      title={editing ? "Editar docente" : "Agregar docente"}
      description={editing ? `${teacher?.lastName}, ${teacher?.firstName}` : undefined}
      initial={
        teacher
          ? { ...emptyPerson, email: teacher.email, firstName: teacher.firstName, lastName: teacher.lastName, phone: teacher.phone ?? "" }
          : emptyPerson
      }
      // La edición del backend solo acepta estos campos
      fields={editing ? ["email", "firstName", "lastName", "phone"] : ["email", "dni", "firstName", "lastName", "personalEmail", "phone", "phonesAdditional"]}
      required={editing ? ["email", "firstName", "lastName", "phone"] : ["email", "dni", "firstName", "lastName", "phone"]}
      submitLabel={editing ? "Guardar cambios" : "Crear docente"}
      saving={create.isPending || update.isPending}
      extraValid={!courseError && !maxHoursError}
      extra={(_, submitted) =>
        editing ? (
          <Field label="Horas máximas" required error={submitted && maxHoursError}>
            {(p) => <Input {...p} invalid={p.invalid} type="number" min={1} max={40} value={maxHours} onChange={(e) => setMaxHours(e.target.value)} />}
          </Field>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Curso" required error={submitted && courseError}>
                {(p) => (
                  <Select {...p} invalid={p.invalid} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Selecciona…</option>
                    {(courses.data ?? []).map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Dedicación" required>
                {(p) => (
                  <Select {...p} value={jobStatus} onChange={(e) => setJobStatus(e.target.value as JobStatus)}>
                    {(Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {JOB_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Checkbox
              checked={isCoordinator}
              onChange={(e) => setIsCoordinator(e.target.checked)}
              label="Marcar como coordinador de curso"
              description="Solo es una marca informativa. Para dar acceso de coordinador, créalo en Coordinadores."
            />
          </>
        )
      }
      onClose={onClose}
      onSubmit={async (v) => {
        try {
          if (teacher) {
            await update.mutateAsync({
              id: teacher.id,
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              email: v.email.trim(),
              phone: v.phone,
              maxHours: Number(maxHours),
            });
            toast.success("Docente actualizado");
          } else {
            await create.mutateAsync({
              dni: v.dni,
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              email: v.email.trim(),
              personalEmail: v.personalEmail.trim() || undefined,
              phone: v.phone,
              phonesAdditional: splitPhones(v.phonesAdditional),
              courseId: Number(courseId),
              jobStatus,
              isCoordinator,
            });
            toast.success("Docente creado");
          }
          onClose();
        } catch (error) {
          toast.error(apiErrorMessage(error, "No se pudo guardar el docente"));
        }
      }}
    />
  );
}
