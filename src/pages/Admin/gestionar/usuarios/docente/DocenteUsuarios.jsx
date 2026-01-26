import React, { useState, useEffect, useMemo } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { Input } from "@/components/ui/Input";
import { AgregarUsuarios } from "../AgregarUsuarios";
import { useProfesores } from "@/hooks/useProfesores";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { AsignarSalonDoc } from "./AsignarSalonDoc";
import { toast } from "react-toastify";
import { FaSyncAlt, FaUserEdit, FaUserMinus } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { useCursos } from "@/hooks/useCursos";

const encabezado = [
  "N°",
  "Curso",
  "Apellidos",
  "Nombres",
  "Correo",
  "Número",
  "Horas Máximas",
  "Horas Totales",
  "Acciones",
];
const VISTA = {
  TABLA: "tabla",
  FORMULARIO: "formulario",
  ASIGNAR_SALON: "asignarSalonDoc",
};

export const DocenteUsuarios = ({ setMostrarCabecera }) => {
  const [vista, setVista] = useState(VISTA.TABLA);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [curso_id, setCursoId] = useState(null);
  const [selected, setSelected] = useState({});
  const {
    profesores,
    totalPages,
    isLoading,
    isError,
    crearProfesorMutation,
    actualizarProfesorMutation,
    eliminarProfesorMutation,
    refetch,
  } = useProfesores({ page, limit, curso_id });
  const { cursos } = useCursos();

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    numero: "",
    horas: "",
    extra: "",
  });

  useEffect(() => {
    if (isError && (!profesores || profesores.length === 0)) {
      toast.error("Error al obtener los docentes");
    }
  }, [isError, profesores]);

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleLimitChange = (e) => setLimit(e.target.value);

  const esNumeroValido = (numero) => {
    const regex = /^9\d{8}$/; // Empieza en 9 y luego 8 dígitos (total 9 dígitos)
    return regex.test(numero);
  };

  const filtro = useMemo(() => {
    if (!cursos?.length) return {};

    return {
      1: {
        options: cursos.map((a) => a.name),
        onChange: (curso_name) => {
          setTimeout(() => {
            const curso = cursos.find((c) => c.name === curso_name[0]);
            const index = cursos.indexOf(curso);
            setSelected({ 1: index });
            setCursoId(curso?.id || null);
          }, 0);
        },
      },
    };
  }, [cursos]);

  const handleModificar = (id) => {
    const profesor = profesores.find((profesor) => profesor.id === id);
    if (profesor) {
      setEditingId(id);
      setEditFormData({
        nombres: profesor.firstName || "-",
        apellidos: profesor.lastName || "-",
        correo: profesor.email || "-",
        numero: profesor.phone || "-",
        horas: profesor.maxHours || "-",
        extra: profesor.courseName || "-",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      if (!/^\d*$/.test(value)) {
        return;
      }
      if (value.length > 9) {
        return;
      }
      if (value.length === 1 && value !== "9") {
        return;
      }
    }
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      if (!esNumeroValido(editFormData.numero)) {
        toast.error(
          "El número debe comenzar con 9 y tener exactamente 9 dígitos.",
        );
        return;
      }

      const profesor = {
        userId: editingId,
        firstName: editFormData.nombres,
        lastName: editFormData.apellidos,
        email: editFormData.correo,
        phone: editFormData.numero,
        maxHours: parseInt(editFormData.horas, 10),
      };

      const profeActualizado =
        await actualizarProfesorMutation.mutateAsync(profesor);

      if (profeActualizado) {
        toast.success(
          `Profesor "${profeActualizado.firstName}" actualizado correctamente`,
        );
        setEditingId(null);
        setEditFormData({
          nombres: "",
          apellidos: "",
          correo: "",
          numero: "",
          horas: "",
          extra: "",
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("El correo ya está en uso por otro usuario");
      } else if (error.response?.status === 400) {
        toast.error("Error en los datos proporcionados");
      } else if (error.response?.status === 404) {
        toast.error("Docente no encontrado");
      } else if (error.response?.status === 500) {
        toast.error("Error interno del servidor");
      } else {
        toast.error("Error al actualizar el docente");
      }
      console.error("Error al actualizar el docente:", error);
    }
  };

  const handleBorrar = async (id) => {
    try {
      const profesorEliminado = await eliminarProfesorMutation.mutateAsync(id);
      if (profesorEliminado || profesorEliminado === "") {
        toast.success(`Profesor eliminado correctamente`);
      }
    } catch (error) {
      toast.error("Error al eliminar el docente");
      console.error("Error al eliminar el docente:", error);
    }
  };

  const handleAgregar = () => {
    setEditFormData({
      nombres: "",
      apellidos: "",
      correo: "",
      numero: "",
      extra: "",
    });
    setVista(VISTA.FORMULARIO);
    setMostrarCabecera(false); // OCULTAR
  };

  const handleNuevoUsuario = async (formData) => {
    setMostrarCabecera(true);
    try {
      const nuevoProfesor = {
        email: formData.correo,
        personalEmail: formData.correo_personal,
        jobStatus: formData.disponibilidad,
        courseId: parseInt(formData.curso),
        dni: formData.dni,
        firstName: formData.docente,
        lastName: formData.apellidos,
        phone: formData.numero,
        phonesAdditional: formData.celular_adicional?.split(",") || [],
        isCoordinator: formData.coordinador || false,
      };

      const profesorCreado =
        await crearProfesorMutation.mutateAsync(nuevoProfesor);

      toast.success(
        `Profesor "${profesorCreado?.userProfile?.firstName || ""}" creado correctamente`,
      );
      setEditFormData({
        nombres: "",
        apellidos: "",
        correo: "",
        numero: "",
        extra: "",
      });
    } catch (error) {
      toast.error("Error al crear el profesor");
      console.error("Error al agregar el profesor:", error);
    }
  };

  const handleAsignarSalon = (id) => {
    setEditingId(id);
    setVista(VISTA.ASIGNAR_SALON);
    setMostrarCabecera(false); // OCULTAR
  };

  const handleRegresar = () => {
    setEditingId(null);
    setVista(VISTA.TABLA);
    setMostrarCabecera(true); // MOSTRAR
  };

  const getDatosProfesor = () => {
    if (!profesores || profesores.length === 0) return [];

    console.log(profesores);

    return profesores.map((profesor, index) => {
      const esEdicion = editingId === profesor.id;

      return [
        index + (page - 1) * limit + 1,
        profesor.courseName || "-",
        esEdicion ? (
          <Input
            type="text"
            name="apellidos"
            value={editFormData.apellidos}
            onChange={handleEditChange}
          />
        ) : (
          profesor.lastName || "-"
        ),
        esEdicion ? (
          <Input
            type="text"
            name="nombres"
            value={editFormData.nombres}
            onChange={handleEditChange}
          />
        ) : (
          profesor.firstName || "-"
        ),
        esEdicion ? (
          <Input
            type="email"
            name="correo"
            value={editFormData.correo}
            onChange={handleEditChange}
          />
        ) : (
          profesor.email || "-"
        ),
        esEdicion ? (
          <Input
            type="text"
            name="numero"
            value={editFormData.numero}
            onChange={handleEditChange}
          />
        ) : (
          profesor.phone || "-"
        ),
        esEdicion ? (
          <Input
            type="number"
            name="horas"
            value={editFormData.horas}
            onChange={handleEditChange}
          />
        ) : (
          profesor.maxHours || "-"
        ),
        profesor.scheduledHours || 0,
        esEdicion ? (
          <div className="flex gap-2 justify-center min-w-[190px]">
            <Button onClick={() => handleGuardar(profesor.id)}>Guardar</Button>
            <ButtonNegative onClick={() => setEditingId(null)}>
              Cancelar
            </ButtonNegative>
          </div>
        ) : (
          <div className="flex gap-2 justify-center min-w-[190px]">
            <Button
              onClick={() => handleAsignarSalon(profesor.id)}
              tittle="Asignar Salón"
            >
              <MdAssignmentAdd size="20" />
            </Button>
            <Button
              onClick={() => handleModificar(profesor.id)}
              tittle="Editar Docente"
            >
              <FaUserEdit size="20" />
            </Button>
            <ButtonNegative
              onClick={() => handleBorrar(profesor.id)}
              tittle="Borrar Docented"
            >
              <FaUserMinus size="20" />
            </ButtonNegative>
          </div>
        ),
      ];
    });
  };

  if (vista === VISTA.ASIGNAR_SALON) {
    return (
      <AsignarSalonDoc
        docente={profesores.find((profesor) => profesor.id === editingId)}
        regresar={handleRegresar}
      />
    );
  }

  if (vista === VISTA.FORMULARIO) {
    return (
      <AgregarUsuarios
        rol="Docente"
        formData={editFormData}
        handleChange={(e) =>
          setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
        }
        handleGuardarNuevoUsuario={handleNuevoUsuario}
        regresar={handleRegresar}
      />
    );
  }

  return (
    <div className="overflow-x-auto w-full text-center mb-3">
      <div className="flex justify-between items-center mt-1 mb-6 px-4">
        <Button onClick={refetch}>
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold text-center flex-1">
          GESTIÓN DE DOCENTES
        </h2>
        <Button onClick={handleAgregar}>Agregar Docente</Button>
      </div>
      {isLoading ? (
        <SkeletonTabla numRows={limit} numColumns={encabezado.length} />
      ) : (
        <Tabla
          encabezado={encabezado}
          datos={getDatosProfesor()}
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
