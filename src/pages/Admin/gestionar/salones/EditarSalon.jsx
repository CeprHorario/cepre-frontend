import React, { useEffect, useState } from "react";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { useClases } from "@/hooks/useClases";
import { useInfoClases } from "@/hooks/useInfoClases";
import { HorariosMonitor } from "@/components/Horarios/HorariosMonitor";
import { TablaCursos } from "./TablaCursos";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { DIAS_DIC } from "@/constants/dias";
import { BuscarProfesor } from "./BuscarProfesor";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { useHourSessions } from "@/hooks/useHourSessions";

const VISTAS = {
  EDITAR: "editar",
  BUSCAR: "buscar",
}

export const EditarSalon = ({ idSalon, regresar }) => {
  // obtener el nombreSalon de la url
  



  const { clases } = useClases();
  const { schedules: infoClases, teachers, loading, refetch } = useInfoClases(idSalon);

  const { hoursByShift, loading: loadingHours } = useHourSessions();

  const salon = clases ? clases.find((a) => a.id === idSalon) : null;
  const turno = salon?.shift;

  const turnoSessions = turno?.name && hoursByShift[turno.name] ? hoursByShift[turno.name] : [];
  const rango = turnoSessions.length > 0 ? {
    inicio: turnoSessions[0].startTime,
    fin: turnoSessions[turnoSessions.length - 1].endTime
  } : null;
  const [horariosSalon, setHorariosSalon] = useState([]);
  const [vistaActual, setVistaActual] = useState(VISTAS.EDITAR);
  const [cursosConDocente, setCursosConDocente] = useState([]);
  const [curso, setCurso] = useState(null);
  const [profesor, setProfesor] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (infoClases) {
        const data = infoClases.map((clase) => {
          return {
            hora_ini: formatTimeToHHMM(clase.startTime),
            hora_fin: formatTimeToHHMM(clase.endTime),
            dia: DIAS_DIC[clase.weekDay] || "Día desconocido",
            curso: clase.courseName || "Curso desconocido",
          }
        })
        setHorariosSalon(data);
        setCursosConDocente(teachers.map((docente) => { return docente.courseName }));
      }
    }
  }, [infoClases, teachers, loading]);

  const handleBuscarProfesor = (curso, profesor) => {
    setVistaActual(VISTAS.BUSCAR);
    setCurso(curso);
    setProfesor(profesor);
  }

  const handleRegresar = () => {
    setVistaActual(VISTAS.EDITAR);
    setCurso(null);
    refetch();
  }

  const handleAsignar = (name) => {
    setCursosConDocente((prev) => {
      if (prev.includes(name)) {
        return prev;
      } else {
        return [...prev, name];
      }
    });
  }

  const handleDesasignar = (name) => {
    setCursosConDocente((prev) => {
      if (prev.includes(name)) {
        return prev.filter((curso) => curso !== name);
      } else {
        return prev;
      }
    });
  }

  return (
    <div className="p-2 space-y-2 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Modificación de Aula: {salon?.name}</h2>
        <h3 className="text-xl font-semibold mb-1">Turno del Aula: {turno?.name}</h3>
        {rango && <p>Horario: {rango.inicio} - {rango.fin}</p>}
      </div>

      {rango ? (
        <HorariosMonitor
          aula={salon?.name}
          horas={horariosSalon}
          cursosConDocente={cursosConDocente}
          turno={turno?.name}
        />
      ) : (
        <p className="text-center text-red-500">Turno inválido o no definido.</p>
      )}

      {/* Tabla de cursos*/}
      <div className="overflow-x-auto w-full">
        {vistaActual == VISTAS.EDITAR ? (
          loading ? <SkeletonTabla numRows={15} numColums={4} /> : (
            <TablaCursos docentes={teachers} buscarProfesor={handleBuscarProfesor} />
          )
        ) : (
          <BuscarProfesor idSalon={idSalon} curso={curso} profesor={profesor} setAsignar={handleAsignar} setDesasignar={handleDesasignar} horario={horariosSalon.filter((hora) => {
            return hora.curso == curso.name
          })} />
        )
        }
      </div>

      <div className="mt-4 mb-2 flex justify-center">
        <ButtonNegative onClick={vistaActual == VISTAS.BUSCAR ? handleRegresar : regresar}>Atrás</ButtonNegative>
      </div>
    </div>
  );
};