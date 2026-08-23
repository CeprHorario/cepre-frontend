import React, { useEffect, useMemo, useState } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { AsignarSalonSup } from "./AsignarSalonSup";
import { SupervisorForm } from "./SupervisorForm";
import { useSupervisores } from "@/hooks/useSupervisores";
import { toast } from "react-toastify";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { FaSyncAlt, FaUserEdit, FaUserMinus, FaUserPlus } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { useTurnos } from "@/hooks/useTurnos";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const encabezado = ["N°", "Nombres", "Apellidos", "Correo", "Numero", "Turno", "Acciones"];
const VISTA = {
  TABLA: "tabla",
  CREAR: "crear",
  EDITAR: "editar",
  ASIGNAR_SALON: "asignarSalonSup",
};

export const SupervisorUsuarios = () => {
  const [vista, setVista] = useState(VISTA.TABLA);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
  const [supervisorAEliminar, setSupervisorAEliminar] = useState(null);
  const {
    supervisores,
    totalPages,
    isLoading,
    isError,
    crearSupervisorMutation,
    actualizarSupervisorMutation,
    eliminarSupervisorMutation,
    refetch,
  } = useSupervisores({ page, limit });
  const { turnos } = useTurnos();

  const getNombreTurno = (shiftId) => {
    const turno = turnos.find((t) => t.id === shiftId);
    return turno ? turno.name : "-";
  };

  const filtro = useMemo(() => {
    if (!turnos?.length) return {};
    return {
      5: { options: turnos.map((t) => t.name) },
    };
  }, [turnos]);

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleLimitChange = (e) => {
    setPage(1);
    setLimit(Number(e.target.value));
  };

  useEffect(() => {
    if (isError && (!supervisores || supervisores.length === 0)) {
      toast.error("Error al obtener los supervisores");
    }
  }, [isError, supervisores]);

  const regresarATabla = () => {
    setSupervisorSeleccionado(null);
    setVista(VISTA.TABLA);
  };

  const handleCrear = async (payload) => {
    try {
      await crearSupervisorMutation.mutateAsync(payload);
      toast.success("Supervisor creado correctamente");
      regresarATabla();
    } catch (error) {
      toast.error(error.response?.status === 409 ? "El correo ya esta en uso" : "Error al crear supervisor");
      console.error("Error al crear supervisor:", error);
    }
  };

  const handleEditar = async (payload) => {
    try {
      await actualizarSupervisorMutation.mutateAsync(payload);
      toast.success("Supervisor actualizado correctamente");
      regresarATabla();
    } catch (error) {
      toast.error(error.response?.status === 409 ? "El correo ya esta en uso" : "Error al actualizar supervisor");
      console.error("Error al actualizar supervisor:", error);
    }
  };

  const handleBorrar = async () => {
    if (!supervisorAEliminar?.id) return;
    try {
      await eliminarSupervisorMutation.mutateAsync(supervisorAEliminar.id);
      toast.success("Supervisor eliminado correctamente");
      setSupervisorAEliminar(null);
    } catch (error) {
      toast.error("Error al eliminar el supervisor");
      console.error("Error al eliminar el supervisor:", error);
    }
  };

  const getDatosSupervisores = () => {
    if (!supervisores || supervisores.length === 0) return [];

    return supervisores.map((supervisor, index) => [
      index + (page - 1) * limit + 1,
      supervisor.firstName || "-",
      supervisor.lastName || "-",
      supervisor.email || "-",
      supervisor.phone || "-",
      supervisor.shiftId || supervisor.shift_id ? getNombreTurno(supervisor.shiftId || supervisor.shift_id) : "-",
      <div className="flex justify-center gap-2" key={supervisor.id}>
        <Button
          onClick={() => {
            setSupervisorSeleccionado(supervisor);
            setVista(VISTA.ASIGNAR_SALON);
          }}
          title="Asignar salon"
        >
          <MdAssignmentAdd size="20" />
        </Button>
        <Button
          onClick={() => {
            setSupervisorSeleccionado(supervisor);
            setVista(VISTA.EDITAR);
          }}
          title="Editar supervisor"
        >
          <FaUserEdit size="20" />
        </Button>
        <ButtonNegative onClick={() => setSupervisorAEliminar(supervisor)} title="Borrar supervisor">
          <FaUserMinus size="20" />
        </ButtonNegative>
      </div>,
    ]);
  };

  if (vista === VISTA.CREAR) {
    return (
      <SupervisorForm
        modo="crear"
        onSubmit={handleCrear}
        onCancel={regresarATabla}
        isLoading={crearSupervisorMutation.isPending}
      />
    );
  }

  if (vista === VISTA.EDITAR) {
    return (
      <SupervisorForm
        modo="editar"
        supervisor={supervisorSeleccionado}
        onSubmit={handleEditar}
        onCancel={regresarATabla}
        isLoading={actualizarSupervisorMutation.isPending}
      />
    );
  }

  if (vista === VISTA.ASIGNAR_SALON) {
    return <AsignarSalonSup regresar={regresarATabla} supervisor={supervisorSeleccionado} />;
  }

  return (
    <div className="mb-3 w-full overflow-x-auto text-center">
      <div className="mt-1 mb-6 flex items-center justify-between px-4">
        <Button onClick={refetch} title="Actualizar">
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold">GESTION DE SUPERVISORES</h2>
        <Button onClick={() => setVista(VISTA.CREAR)} title="Crear supervisor">
          <FaUserPlus />
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTabla numRows={limit} numColums={encabezado.length} />
      ) : (
        <Tabla encabezado={encabezado} datos={getDatosSupervisores()} filtroDic={filtro} />
      )}

      <ConfirmModal
        open={!!supervisorAEliminar}
        title="Eliminar supervisor"
        message={`Se desactivara el supervisor "${supervisorAEliminar?.firstName || ""} ${supervisorAEliminar?.lastName || ""}".`}
        confirmText="Eliminar supervisor"
        isLoading={eliminarSupervisorMutation.isPending}
        onCancel={() => setSupervisorAEliminar(null)}
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
