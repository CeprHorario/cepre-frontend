import React, { useState } from "react";
import { AgregarCurso } from "./AgregarCurso";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { Input } from "@/components/ui/Input";
import { toast } from 'react-toastify';
import { useCursos } from "@/hooks/useCursos";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { FaSyncAlt } from "react-icons/fa";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const encabezadoCursos = ["N°", "Curso", "Color", "Acciones"];

export const Cursos = () => {
  const {
    cursos,
    isLoading,
    crearCursoMutation,
    actualizarCursoMutation,
    eliminarCursoMutation,
    refetch,
  } = useCursos();

  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ name: "", color: "" });
  const [vistaActual, setVistaActual] = useState("lista"); // "lista" o "agregar"
  const [cursoAEliminar, setCursoAEliminar] = useState(null);

  const handleModificar = (curso) => {
    setEditandoId(curso.id);
    setFormData({ name: curso.name, color: curso.color });
  };

  const handleGuardar = async (id) => {
    try {
      const cursoActualizado = await actualizarCursoMutation.mutateAsync({
        id,
        name: formData.name,
        color: formData.color,
      });

      if (cursoActualizado) {
        toast.success(`Curso "${cursoActualizado.name}" actualizado correctamente`);
        setEditandoId(null);
        setFormData({ name: "", color: "" });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Curso no encontrado");
      } else {
        toast.error("Error al actualizar el curso");
      }
      console.error("Error al actualizar el curso:", error);
    }
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ name: "", color: "" });
  };

  const handleBorrar = async () => {
    if (!cursoAEliminar?.id) return;
    try {
      const cursoEliminado = await eliminarCursoMutation.mutateAsync(cursoAEliminar.id);
      if (cursoEliminado) {
        toast.success(`Curso eliminado correctamente`);
        setCursoAEliminar(null);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Curso no encontrado");
      } else {
        toast.error("Error al eliminar el curso");
      }
      console.error("Error al eliminar el curso:", error);
    }
  };

  const handleAgregarCurso = async (nuevoCurso) => {
    try {
      const cursoCreado = await crearCursoMutation.mutateAsync(nuevoCurso);

      if (cursoCreado) {
        toast.success(`Curso "${cursoCreado.name}" creado correctamente`);
        setVistaActual("lista");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Datos inválidos. Por favor, verifica el nombre y el color del curso.");
      } else {
        toast.error("Error al crear el curso");
      }
      console.error("Error al agregar el curso:", error);
    }
  };

  // Generar los datos de la tabla
  const getDatosCursos = () => {
    const data = cursos?.map((curso) => [
      curso.id,
      editandoId === curso.id ? (
        <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      ) : (
        curso.name
      ),
      editandoId === curso.id ? (
        <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-10 h-6" />
      ) : (
        <div className="w-6 h-6 mx-auto rounded-full" style={{ backgroundColor: curso.color }}></div>
      ),
      getAcciones(curso),
    ]);

    return data;
  };

  // Generar las acciones para cada fila
  const getAcciones = (curso) => {
    return editandoId === curso.id ? (
      <div className="inline-flex gap-10">
        <Button onClick={() => handleGuardar(curso.id)} disabled={actualizarCursoMutation.isPending}>
          {actualizarCursoMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
        <ButtonNegative onClick={handleCancelar}>Cancelar</ButtonNegative>
      </div>
    ) : (
      <div className="inline-flex gap-10">
        <Button onClick={() => handleModificar(curso)}> Modificar </Button>
        <ButtonNegative onClick={() => setCursoAEliminar(curso)}>Borrar</ButtonNegative>
      </div>
    );
  };

  if (vistaActual === "agregar") {
    return <AgregarCurso onAgregarCurso={handleAgregarCurso} setVistaActual={setVistaActual} />;
  }

  return (
    <div className="overflow-x-auto w-full text-center text-xs sm:text-sm">
      {/* Contenedor del título y el botón */}
      <div className="flex justify-between items-center mt-1 mb-6 px-4">
        <Button onClick={refetch}>
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold text-center flex-1">GESTIÓN DE CURSOS</h2>
        <Button onClick={() => setVistaActual("agregar")}>Agregar Curso</Button>
      </div>
      {isLoading ? <SkeletonTabla /> : (
        <Tabla encabezado={encabezadoCursos} datos={getDatosCursos()} />
      )}
      <ConfirmModal
        open={!!cursoAEliminar}
        title="Eliminar curso"
        message={`Se eliminará el curso "${cursoAEliminar?.name || ""}". Esta acción no se puede deshacer.`}
        confirmText="Eliminar curso"
        isLoading={eliminarCursoMutation.isPending}
        onCancel={() => setCursoAEliminar(null)}
        onConfirm={handleBorrar}
      />
      <div className="mb-4"></div>
    </div>
  );
};
