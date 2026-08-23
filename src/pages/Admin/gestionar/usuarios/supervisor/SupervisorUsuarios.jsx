import React, { useState, useEffect, useMemo } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { Input } from "@/components/ui/Input";
import { AsignarSalonSup } from "./AsignarSalonSup";
import { useSupervisores } from "@/hooks/useSupervisores";
import { toast } from "react-toastify";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { FaSyncAlt, FaUserEdit, FaUserMinus } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { useTurnos } from "@/hooks/useTurnos";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const encabezado = ["N°", "Nombres", "Apellidos", "Correo", "Número", "Turno", "Acciones"];
const VISTA = {
  TABLA: "tabla",
  ASIGNAR_SALON: "asignarSalonSup",
}

export const SupervisorUsuarios = () => {
  const [vista, setVista] = useState(VISTA.TABLA);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    supervisores,
    totalPages,
    isLoading,
    isError,
    actualizarSupervisorMutation,
    eliminarSupervisorMutation,
    refetch,
  } = useSupervisores({ page, limit });
  const { turnos } = useTurnos();
  const [editingId, setEditingId] = useState(null);
  const [supervisorAEliminar, setSupervisorAEliminar] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    numero: "",
  });

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
  const handleLimitChange = (e) => setLimit(e.target.value);

  useEffect(() => {
    if (isError && (!supervisores || supervisores.length === 0)) {
      toast.error("Error al obtener los supervisores");
    }
  }, [isError, supervisores]);

  const handleModificar = (id) => {
    const supervisor = supervisores.find((supervisor) => supervisor.id === id);
    if (supervisor) {
      setEditingId(id);
      setEditFormData({
        nombres: supervisor.firstName || "-",
        apellidos: supervisor.lastName || "-",
        correo: supervisor.personalEmail || "-",
        numero: supervisor.phone || "-",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero") {
      const soloNumeros = value.replace(/[^0-9]/g, "");

      const primerDigito = soloNumeros.charAt(0);
      const numeroValido = primerDigito === "9" || primerDigito === ""
        ? soloNumeros.slice(0, 9)  // Corta a 9 dígitos
        : "9" + soloNumeros.slice(0, 8);  // Fuerza "9" al inicio

      setEditFormData({ ...editFormData, [name]: numeroValido });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleGuardar = async () => {
    try {
      const supervisor = {
        id: editingId,
        firstName: editFormData.nombres,
        lastName: editFormData.apellidos,
        personalEmail: editFormData.correo,
        phone: editFormData.numero,
      };

      const supervisorActualizado = await actualizarSupervisorMutation.mutateAsync(supervisor);
      if (supervisorActualizado) {
        toast.success("Supervisor actualizado correctamente");
        setEditingId(null);
        setEditFormData({
          nombres: "",
          apellidos: "",
          correo: "",
          numero: "",
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("El correo ya está en uso por otro usuario");
      } else if (error.response?.status === 400) {
        toast.error("Error en los datos proporcionados");
      } else if (error.response?.status === 404) {
        toast.error("Supervisor no encontrado");
      } else if (error.response?.status === 500) {
        toast.error("Error interno del servidor");
      } else {
        toast.error("Error al actualizar supervisor");
      }
      console.error("Error al actualizar supervisor:", error);
    }
  };

  const handleBorrar = async () => {
    if (!supervisorAEliminar?.id) return;
    try {
      const supervisorEliminado = await eliminarSupervisorMutation.mutateAsync(supervisorAEliminar.id);
      if (supervisorEliminado || supervisorEliminado === '') {
        toast.success("Supervisor eliminado correctamente");
        setSupervisorAEliminar(null);
      }
    }
    catch (error) {
      toast.error("Error al eliminar el supervisor");
      console.error("Error al eliminar el supervisor:", error);
    }
  };

  const handleAsignarSalonSup = (id) => {
    setEditingId(id);
    setVista(VISTA.ASIGNAR_SALON);
  }

  const handleRegresar = () => {
    setEditingId(null);
    setVista(VISTA.TABLA);
  }

  const getDatosSupervisores = () => {
    if (!supervisores || supervisores.length === 0) return [];

    return supervisores.map((supervisor, index) => {
      const esEdicion = editingId === supervisor.id;

      return [
        index + (page - 1) * limit + 1,
        esEdicion ? (
          <Input type="text" name="nombres" value={editFormData.nombres} onChange={handleEditChange} />
        ) : (
          supervisor.firstName || "-"
        ),
        esEdicion ? (
          <Input type="text" name="apellidos" value={editFormData.apellidos} onChange={handleEditChange} />
        ) : (
          supervisor.lastName || "-"
        ),
        esEdicion ? (
          <Input type="email" name="correo" value={editFormData.correo} onChange={handleEditChange} />
        ) : (
          supervisor.email || "-"
        ),
        esEdicion ? (
          <Input type="text" name="numero" value={editFormData.numero} onChange={handleEditChange} />
        ) : (
          supervisor.phone || "-"
        ),
        supervisor.shiftId ? getNombreTurno(supervisor.shiftId) : "-",
        esEdicion ? (
          <div className="flex gap-2 justify-center">
            <Button onClick={() => handleGuardar(supervisor.id)}>Guardar</Button>
            <ButtonNegative onClick={() => setEditingId(null)}>Cancelar</ButtonNegative>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <Button onClick={() => handleAsignarSalonSup(supervisor.id)} tittle="Asignar Salón"><MdAssignmentAdd size="20"/></Button>
            <Button onClick={() => handleModificar(supervisor.id)} tittle="Editar Supervisor" ><FaUserEdit size="20"/></Button>
            <ButtonNegative onClick={() => setSupervisorAEliminar(supervisor)} tittle="Borrar Supervisor"><FaUserMinus size="20"/></ButtonNegative>
          </div>
        )
      ];
    });
  }

  if (vista === VISTA.ASIGNAR_SALON) {
    return (
      <AsignarSalonSup
        regresar={handleRegresar}
        supervisor={supervisores.find((supervisor) => supervisor.id === editingId)}
      />
    )
  }
  
  return (
    <div className="overflow-x-auto w-full text-center">
      <div className="flex justify-between items-center mt-1 mb-6 px-4">
        <Button onClick={refetch}>
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold">GESTIÓN DE SUPERVISORES</h2>
        <p></p>
      </div>

      {isLoading ? <SkeletonTabla numRows={6} /> :
        <Tabla encabezado={encabezado} datos={getDatosSupervisores()} filtroDic={filtro} />
      }
      <ConfirmModal
        open={!!supervisorAEliminar}
        title="Eliminar supervisor"
        message={`Se eliminará el supervisor "${supervisorAEliminar?.firstName || ""} ${supervisorAEliminar?.lastName || ""}". Esta acción no se puede deshacer.`}
        confirmText="Eliminar supervisor"
        isLoading={eliminarSupervisorMutation.isPending}
        onCancel={() => setSupervisorAEliminar(null)}
        onConfirm={handleBorrar}
      />

      <div className="flex justify-between mt-4">
        <Button onClick={handlePrev} disabled={page === 1}>
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={page >= totalPages}>
          Siguiente
        </Button>
        <select value={limit} onChange={handleLimitChange} className="border border-gray-300 rounded p-2">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>
  )
};
