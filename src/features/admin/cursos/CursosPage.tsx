import { useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiErrorMessage } from "@/api/client";
import { useCourseMutations, useCourses } from "@/api/queries";
import type { Course } from "@/api/types";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Field";
import { ConfirmDialog, Dialog } from "@/components/ui/Overlay";
import { courseTint } from "@/lib/schedule";

export function CursosPage() {
  const courses = useCourses();
  const { create, update, remove } = useCourseMutations();
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const columns: Column<Course>[] = [
    {
      key: "name",
      header: "Curso",
      cell: (c) => (
        <span className="flex items-center gap-3">
          <span className="size-6 rounded-lg border border-black/5" style={{ background: c.color }} aria-hidden="true" />
          <strong className="font-semibold">{c.name}</strong>
        </span>
      ),
    },
    {
      key: "preview",
      header: "Así se ve en el horario",
      cell: (c) => {
        const tint = courseTint(c.color);
        return (
          <span className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-bold" style={{ background: tint.background, borderColor: tint.border, color: tint.text }}>
            {c.name}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      align: "right",
      cell: (c) => (
        <div className="inline-flex gap-1.5">
          <IconButton label={`Editar ${c.name}`} size="sm" onClick={() => setEditing(c)}>
            <FiEdit2 />
          </IconButton>
          <IconButton label={`Eliminar ${c.name}`} size="sm" onClick={() => setToDelete(c)}>
            <FiTrash2 />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Cursos"
        description={courses.data ? `${courses.data.length} cursos` : "Cargando…"}
        actions={
          <Button icon={<FiPlus />} onClick={() => setEditing("new")}>
            Agregar curso
          </Button>
        }
      />
      <Card>
        <DataTable columns={columns} rows={courses.data ?? []} rowKey={(c) => String(c.id)} loading={courses.isLoading} minWidth={520} />
      </Card>

      {editing && (
        <CourseDialog
          course={editing === "new" ? null : editing}
          saving={create.isPending || update.isPending}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            try {
              if (editing === "new") await create.mutateAsync(data);
              else await update.mutateAsync({ id: editing.id, ...data });
              toast.success(editing === "new" ? "Curso creado" : "Curso actualizado");
              setEditing(null);
            } catch (error) {
              toast.error(apiErrorMessage(error, "No se pudo guardar el curso"));
            }
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`¿Eliminar ${toDelete?.name ?? ""}?`}
        message="Solo es posible si el curso no tiene horarios ni docentes asociados."
        confirmText="Eliminar curso"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(toDelete!.id);
            toast.success("Curso eliminado");
          } catch (error) {
            toast.error(apiErrorMessage(error, "No se pudo eliminar el curso"));
          } finally {
            setToDelete(null);
          }
        }}
      />
    </>
  );
}

function CourseDialog({ course, saving, onClose, onSave }: {
  course: Course | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string }) => void;
}) {
  const [name, setName] = useState(course?.name ?? "");
  const [color, setColor] = useState(course?.color ?? "#3F51B5");
  const tint = courseTint(color);
  return (
    <Dialog
      open
      onClose={onClose}
      title={course ? "Editar curso" : "Agregar curso"}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={saving} disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), color })}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre del curso" required>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Color">
          {(p) => (
            <div className="flex items-center gap-3">
              <input {...p} type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-field bg-white p-1" />
              <span className="tabular text-sm text-ink-500">{color.toUpperCase()}</span>
            </div>
          )}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink-700">Vista previa</span>
          <div className="flex h-20 flex-col gap-1 rounded-lg border px-3 py-2" style={{ background: tint.background, borderColor: tint.border, color: tint.text }}>
            <strong className="text-sm">{name || "Nombre del curso"}</strong>
            <span className="text-xs">Docente asignado</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
