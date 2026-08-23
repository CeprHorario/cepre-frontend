import React, { useEffect, useMemo, useState } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { useCoordinadores } from "@/hooks/useCoordinadores";
import { useCursos } from "@/hooks/useCursos";
import { toast } from "react-toastify";
import { FaSyncAlt, FaUserEdit, FaUserMinus, FaUserPlus } from "react-icons/fa";
import { CoordinadorForm } from "./CoordinadorForm";

const encabezado = ["N°", "Nombres", "Apellidos", "Correo", "DNI", "Curso", "Numero", "Acciones"];
const VISTA = {
  TABLA: "tabla",
  CREAR: "crear",
  EDITAR: "editar",
};

export const CoordinadorUsuarios = () => {
  const [vista, setVista] = useState(VISTA.TABLA);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [coordinadorSeleccionado, setCoordinadorSeleccionado] = useState(null);
  const [coordinadorAEliminar, setCoordinadorAEliminar] = useState(null);
  const {
    coordinadores,
    totalPages,
    isLoading,
    isError,
    refetch,
    crearCoordinadorMutation,
    actualizarCoordinadorMutation,
    eliminarCoordinadorMutation,
  } = useCoordinadores({ page, limit });
  const { cursos } = useCursos();

  const cursosPorId = useMemo(
    () => new Map(cursos.map((curso) => [curso.id, curso.name])),
    [cursos]
  );

  useEffect(() => {
    if (isError && (!coordinadores || coordinadores.length === 0)) {
      toast.error("Error al obtener los coordinadores");
    }
  }, [isError, coordinadores]);

  const regresarATabla = () => {
    setCoordinadorSeleccionado(null);
    setVista(VISTA.TABLA);
  };

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleLimitChange = (e) => {
    setPage(1);
    setLimit(Number(e.target.value));
  };

  const getNombreCurso = (coordinador) => {
    const courseId = coordinador.courseId ?? coordinador.coordinatorCourseId ?? coordinador.course?.id;
    if (courseId == null) return "General";
    return coordinador.course?.name || cursosPorId.get(courseId) || "-";
  };

  const handleCrear = async (payload) => {
    try {
      await crearCoordinadorMutation.mutateAsync(payload);
      toast.success("Coordinador creado correctamente");
      regresarATabla();
    } catch (error) {
      toast.error(error.response?.status === 409 ? "El correo ya esta en uso" : "Error al crear coordinador");
      console.error("Error al crear coordinador:", error);
    }
  };

  const handleEditar = async (payload) => {
    try {
      await actualizarCoordinadorMutation.mutateAsync(payload);
      toast.success("Coordinador actualizado correctamente");
      regresarATabla();
    } catch (error) {
      toast.error(error.response?.status === 409 ? "El correo ya esta en uso" : "Error al actualizar coordinador");
      console.error("Error al actualizar coordinador:", error);
    }
  };

  const handleBorrar = async () => {
    if (!coordinadorAEliminar?.id) return;
    try {
      await eliminarCoordinadorMutation.mutateAsync(coordinadorAEliminar.id);
      toast.success("Coordinador eliminado correctamente");
      setCoordinadorAEliminar(null);
    } catch (error) {
      toast.error("Error al eliminar el coordinador");
      console.error("Error al eliminar el coordinador:", error);
    }
  };

  const getDatosCoordinadores = () => {
    if (!coordinadores || coordinadores.length === 0) return [];

    return coordinadores.map((coordinador, index) => [
      index + (page - 1) * limit + 1,
      coordinador.firstName || "-",
      coordinador.lastName || "-",
      coordinador.email || "-",
      coordinador.dni || "-",
      getNombreCurso(coordinador),
      coordinador.phone || "-",
      <div className="flex justify-center gap-2" key={coordinador.id}>
        <Button
          onClick={() => {
            setCoordinadorSeleccionado(coordinador);
            setVista(VISTA.EDITAR);
          }}
          title="Editar coordinador"
        >
          <FaUserEdit size="20" />
        </Button>
        <ButtonNegative onClick={() => setCoordinadorAEliminar(coordinador)} title="Borrar coordinador">
          <FaUserMinus size="20" />
        </ButtonNegative>
      </div>,
    ]);
  };

  if (vista === VISTA.CREAR) {
    return (
      <CoordinadorForm
        modo="crear"
        onSubmit={handleCrear}
        onCancel={regresarATabla}
        isLoading={crearCoordinadorMutation.isPending}
      />
    );
  }

  if (vista === VISTA.EDITAR) {
    return (
      <CoordinadorForm
        modo="editar"
        coordinador={coordinadorSeleccionado}
        onSubmit={handleEditar}
        onCancel={regresarATabla}
        isLoading={actualizarCoordinadorMutation.isPending}
      />
    );
  }

  return (
    <div className="mb-3 w-full overflow-x-auto text-center">
      <div className="mt-1 mb-6 flex items-center justify-between px-4">
        <Button onClick={refetch} title="Actualizar">
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold">GESTION DE COORDINADORES</h2>
        <Button onClick={() => setVista(VISTA.CREAR)} title="Crear coordinador">
          <FaUserPlus />
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTabla numRows={limit} numColums={encabezado.length} />
      ) : (
        <Tabla encabezado={encabezado} datos={getDatosCoordinadores()} />
      )}

      <ConfirmModal
        open={!!coordinadorAEliminar}
        title="Eliminar coordinador"
        message={`Se desactivara el coordinador "${coordinadorAEliminar?.firstName || ""} ${coordinadorAEliminar?.lastName || ""}".`}
        confirmText="Eliminar coordinador"
        isLoading={eliminarCoordinadorMutation.isPending}
        onCancel={() => setCoordinadorAEliminar(null)}
        onConfirm={handleBorrar}
      />

      <div className="mt-4 flex justify-between">
        <Button onClick={handlePrev} disabled={page === 1}>
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={page >= totalPages}>
          Siguiente
        </Button>
        <select value={limit} onChange={handleLimitChange} className="rounded border border-gray-300 p-2">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>
  );
};
