import React, { useState, useEffect, useMemo } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { Input } from "@/components/ui/Input";
import { AgregarUsuarios } from "../AgregarUsuarios";
import { useMonitores } from "@/hooks/useMonitores";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { toast } from "react-toastify";
import { FaSyncAlt, FaUserEdit, FaUserMinus } from "react-icons/fa";
import { useTurnos } from "@/hooks/useTurnos";

const encabezado = [
  "N°",
  "Salón",
  "Nombres",
  "Apellidos",
  "Correo",
  "Número",
  "Turno",
  "Acciones",
];
const VISTA = {
  TABLA: "tabla",
  FORMULARIO: "formulario",
};

export const MonitorUsuarios = () => {
  const [vista, setVista] = useState(VISTA.TABLA);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [shift_id, setShiftId] = useState(null); // Estado para el ID del turno seleccionado
  const [selected, setSelected] = useState({});
  const {
    monitores,
    totalPages,
    isLoading,
    isError,
    actualizarMonitorMutation,
    eliminarMonitorMutation,
    refetch,
  } = useMonitores({ page, limit, shift_id });
  const { turnos } = useTurnos();
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    numero: "",
  });

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleLimitChange = (e) => setLimit(e.target.value);

  useEffect(() => {
    if (isError && (!monitores || monitores.length === 0)) {
      toast.error("Error al obtener los monitores");
    }
  }, [isError, monitores]);

  const filtro = useMemo(() => {
    if (!turnos?.length) return {};

    return {
      6: {
        options: turnos.map((a) => a.name),
        onChange: (turno_name) => {
          setTimeout(() => {
            const turno = turnos.find((c) => c.name === turno_name[0]);
            const index = turnos.indexOf(turno);
            setSelected({ 6: index });
            setShiftId(turno?.id || null);
          }, 0);
        },
      },
    };
  }, [turnos]);

  const handleModificar = (id) => {
    const monitor = monitores.find((monitor) => monitor.id === id);
    if (monitor) {
      setEditingId(id);
      setEditFormData({
        nombres: monitor.firstName || "-",
        apellidos: monitor.lastName || "-",
        correo: monitor.personalEmail || "-",
        numero: monitor.phone || "-",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero") {
      if (value && !/^9\d{0,8}$/.test(value)) {
        toast.error("El número debe empezar con 9 y ser de 9 dígitos.");
        return;
      }
    }

    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      const monitor = {
        userId: editingId,
        firstName: editFormData.nombres,
        lastName: editFormData.apellidos,
        personalEmail: editFormData.correo,
        phone: editFormData.numero,
      };

      const monitorActualizado =
        await actualizarMonitorMutation.mutateAsync(monitor);
      if (monitorActualizado) {
        toast.success("Monitor actualizado correctamente");
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
        toast.error("Monitor no encontrado");
      } else if (error.response?.status === 500) {
        toast.error("Error interno del servidor");
      } else {
        toast.error("Error al actualizar monitor");
      }
      console.error("Error al actualizar monitor:", error);
    }
  };

  const handleBorrar = async (id) => {
    try {
      const monitorEliminado = await eliminarMonitorMutation.mutateAsync(id);
      if (monitorEliminado || monitorEliminado === "") {
        toast.success("Monitor eliminado correctamente");
      }
    } catch (error) {
      toast.error("Error al eliminar el monitor");
      console.error("Error al eliminar el monitor:", error);
    }
  };

  const getDatosMonitores = () => {
    if (!monitores || monitores.length === 0) return [];

    return monitores.map((monitor, index) => {
      const esEdicion = editingId === monitor.id;

      return [
        index + (page - 1) * limit + 1,
        monitor.className || "-",
        esEdicion ? (
          <Input
            type="text"
            name="nombres"
            value={editFormData.nombres}
            onChange={handleEditChange}
          />
        ) : (
          monitor.firstName || "-"
        ),
        esEdicion ? (
          <Input
            type="text"
            name="apellidos"
            value={editFormData.apellidos}
            onChange={handleEditChange}
          />
        ) : (
          monitor.lastName || "-"
        ),
        esEdicion ? (
          <Input
            type="text"
            name="correo"
            value={editFormData.correo}
            onChange={handleEditChange}
          />
        ) : (
          monitor.email || "-"
        ),
        esEdicion ? (
          <Input
            type="text"
            name="numero"
            value={editFormData.numero}
            onChange={handleEditChange}
          />
        ) : (
          monitor.phone || "-"
        ),
        monitor?.shift,
        esEdicion ? (
          <div className="flex gap-2 justify-center">
            <Button onClick={() => handleGuardar(monitor.id)}>Guardar</Button>
            <ButtonNegative onClick={() => setEditingId(null)}>
              Cancelar
            </ButtonNegative>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => handleModificar(monitor.id)}
              tittle="Editar Monitor"
            >
              <FaUserEdit size="20" />
            </Button>
            <ButtonNegative
              onClick={() => handleBorrar(monitor.id)}
              tittle="Borrar Monitor"
            >
              <FaUserMinus size="20" />
            </ButtonNegative>
          </div>
        ),
      ];
    });
  };

  if (vista === VISTA.FORMULARIO) {
    return (
      <AgregarUsuarios
        rol="Monitor"
        formData={editFormData}
        handleChange={(e) =>
          setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
        }
        handleGuardarNuevoUsuario={() => {}}
        setVista={setVista}
      />
    );
  }

  return (
    <div className="overflow-x-auto w-full text-center mb-3">
      <div className="flex justify-between items-center mt-1 mb-6 px-4">
        <Button onClick={refetch}>
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold">GESTIÓN DE MONITORES</h2>
        <p></p>
      </div>
      {isLoading ? (
        <SkeletonTabla numRows={limit} numColums={encabezado.length} />
      ) : (
        <Tabla
          encabezado={encabezado}
          datos={getDatosMonitores()}
          filtroDic={filtro}
          selected={selected}
          filtrar={false}
        />
      )}
      <div className="flex justify-between mt-4">
        <Button onClick={handlePrev} disabled={page === 1}>
          {" "}
          {/* disabled cambiar estilos */}
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={page >= totalPages}>
          {" "}
          {/* disabled cambiar estilos */}
          Siguiente
        </Button>
        <select
          value={limit}
          onChange={handleLimitChange}
          className="border border-gray-300 rounded p-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>
  );
};
