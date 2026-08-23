import React, { useState, useEffect, useMemo } from "react";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { useProfesoresDisponibles } from "@/hooks/useListaProfesDisponibles";
import { useHorasABloques } from "@/hooks/useHorasABloques";
import { toast } from "react-toastify";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const encabezado = ["N°", "Docente", "Correo", "Teléfono", "Acciones"];

export const BuscarProfesor = ({ curso: { id: courseId, name }, profesor, horario, idSalon, setAsignar, setDesasignar }) => {
  const [profesorAsignado, setProfesorAsignado] = useState(profesor);
  const [wasAssigned, setWasAssigned] = useState(false);
  const [confirmarDesasignacion, setConfirmarDesasignacion] = useState(false);
  const { mapearABloques } = useHorasABloques();
  const horarioApi = useMemo(() => mapearABloques(horario).map((bloque) => ({
    hourSessionId: bloque.id_hour_session, weekday: bloque.weekday
  })), [horario, mapearABloques]);
  const {
    data,
    profesores,
    isLoading,
    isError,
    error,
    asignarClaseMutation,
    desasignarClaseMutation,
    refetch
  } = useProfesoresDisponibles({
    courseId,
    hourSessions: horarioApi
  });

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los profesores disponibles");
      console.error("Error al cargar profesores:", error);
      return;
    }

    if (!isLoading && data !== undefined && profesores.length === 0 && !wasAssigned) {
      toast.error("No hay profesores disponibles para este horario");
    }
  }, [isLoading, profesores, isError, error, data, wasAssigned]);


  const handleAsignar = async (idProfesor, idSalon) => {
    try {
      const profesor = profesores.find((prof) => prof.id === idProfesor);
      const response = await asignarClaseMutation.mutateAsync({
        teacherId: idProfesor,
        classId: idSalon
      });
      if (response) {
        setProfesorAsignado(profesor);
        toast.success("Profesor asignado correctamente");
        setWasAssigned(true);
        setAsignar(name);
      }
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error(error.response?.data?.message || error.message || "Error al asignar el profesor");
      } else if (error?.response?.status === 500) {
        toast.error("Error interno del servidor. Por favor, inténtelo más tarde.");
      } else {
        toast.error("Error desconocido. Por favor, inténtelo más tarde.");
      }
      console.error("Asignación fallida:", error);
    }
  }

  const handleEliminarAsignacion = async (idProfesor) => {
    console.log({ idProfesor, idSalon });
    try {
      const response = await desasignarClaseMutation.mutateAsync({
        teacherId: idProfesor,
        classId: idSalon
      });
      if (response) {
        setProfesorAsignado(null);
        toast.success("Profesor desasignado correctamente");
        setWasAssigned(false);
        setDesasignar(name);
        refetch();
      }
    } catch (error) {
      toast.error("Error al eliminar la asignación del profesor");
      console.error("Desasignación fallida:", error);
    }
  }

  const getNombreCompleto = (p) => `${p?.firstName || ''} ${p?.lastName || ''}`.trim();

  const mapProfesoresToTabla = () => {
    return profesores.map((profesor, i) =>
      [
        i + 1,
        getNombreCompleto(profesor),
        profesor?.email || "No disponible",
        profesor?.phone || "No disponible",
        <Button onClick={() => { handleAsignar(profesor.id, idSalon) }}>
          Asignar
        </Button>,
      ]
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-center mb-4">
          <h2 className="text-center text-lg font-bold mb-0">Docente Asignado - {name}</h2>

          <p>{getNombreCompleto(profesorAsignado)}</p>
          <p>{profesorAsignado?.email}</p>
        </div>

        {profesorAsignado && (
          <>



            <Button onClick={() => setConfirmarDesasignacion(true)} >
              Eliminar Docente
            </Button>

          </>
        )}
      </div>
      {isLoading || data === undefined ? (<SkeletonTabla />) :
        (< Tabla encabezado={encabezado} datos={mapProfesoresToTabla()} />)
      }
      <ConfirmModal
        open={confirmarDesasignacion}
        title="Eliminar docente asignado"
        message={`Se quitará a "${getNombreCompleto(profesorAsignado)}" del salón seleccionado. Esta acción no se puede deshacer.`}
        confirmText="Eliminar docente"
        isLoading={desasignarClaseMutation.isPending}
        onCancel={() => setConfirmarDesasignacion(false)}
        onConfirm={async () => {
          await handleEliminarAsignacion(profesorAsignado.id);
          setConfirmarDesasignacion(false);
        }}
      />
    </div>
  )
}
