import React from "react";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { HorarioDocenteCompleto } from "@/components/Horarios/HorarioDocenteCompleto";
import { useHorarioAsignadoDocente } from "@/hooks/useHorarioAsignadoDocente";
import { Button } from "@/components/ui/Button";
import { useHourSessions } from "@/hooks/useHourSessions";

export const HorarioCompleto = ({ setMostrarHorarioCompleto, docente }) => {
  const { horario, loading, desasignarClaseMutation, refetch } =
    useHorarioAsignadoDocente({ idDocente: docente?.id });
  const [estadoEliminar, setEstadoEliminar] = React.useState(false);
  const { horasIni, horasFin } = useHourSessions();

  const handleClaseSeleccionada = async (clase) => {
    if (!estadoEliminar) return;
    // preguntar si desea eliminar la clase
    if (!clase) return;
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar la clase ${clase?.clase}?`,
      )
    ) {
      await desasignarClaseMutation({
        teacherId: clase?.idDocente,
        classId: clase?.idClase,
      });
      refetch();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Horario Docente {docente?.firstName} {docente?.lastName}
      </h1>

      {loading ? (
        <p>Cargando horario...</p>
      ) : (
        <HorarioDocenteCompleto
          horarios={horario || []}
          setClaseSeleccionada={handleClaseSeleccionada}
          idDocente={docente?.id}
          estadoEliminar={estadoEliminar}
          horasIni={horasIni}
          horasFin={horasFin}
        />
      )}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <ButtonNegative onClick={() => setMostrarHorarioCompleto(false)}>
          Atrás
        </ButtonNegative>
        <Button
          onClick={() => {
            setEstadoEliminar(!estadoEliminar);
          }}
        >
          {estadoEliminar ? "Eliminando Clase" : "Eliminar Clase"}
        </Button>
      </div>
    </div>
  );
};
