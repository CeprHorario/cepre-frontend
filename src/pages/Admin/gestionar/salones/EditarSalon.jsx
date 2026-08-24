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
};

const esLinkMeetValido = (url) => {
  if (!url?.trim()) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol.startsWith("http") && parsedUrl.hostname === "meet.google.com";
  } catch {
    return false;
  }
};

const esLinkClassroomValido = (url) => {
  if (!url?.trim()) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol.startsWith("http") && parsedUrl.hostname === "classroom.google.com";
  } catch {
    return false;
  }
};

const ValorLinkValidado = ({ url, validar }) => {
  if (!url?.trim()) return <span className="font-semibold text-amber-700">Faltante</span>;

  if (!validar(url)) {
    return <span className="font-semibold text-red-700">Link invalido</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-700 hover:underline break-all"
    >
      {url}
    </a>
  );
};

export const EditarSalon = ({ idSalon, regresar, soloLectura = false }) => {
  const { clases } = useClases();
  const { schedules: infoClases, teachers, loading, refetch } = useInfoClases(idSalon);
  const { hoursByShift } = useHourSessions();

  const salon = clases ? clases.find((a) => a.id === idSalon) : null;
  const turno = salon?.shift;
  const turnoSessions = turno?.name && hoursByShift[turno.name] ? hoursByShift[turno.name] : [];
  const rango = turnoSessions.length > 0 ? {
    inicio: turnoSessions[0].startTime,
    fin: turnoSessions[turnoSessions.length - 1].endTime,
  } : null;

  const [horariosSalon, setHorariosSalon] = useState([]);
  const [vistaActual, setVistaActual] = useState(VISTAS.EDITAR);
  const [cursosConDocente, setCursosConDocente] = useState([]);
  const [curso, setCurso] = useState(null);
  const [profesor, setProfesor] = useState(null);

  useEffect(() => {
    if (!loading && infoClases) {
      const data = infoClases.map((clase) => ({
        hora_ini: formatTimeToHHMM(clase.startTime),
        hora_fin: formatTimeToHHMM(clase.endTime),
        dia: DIAS_DIC[clase.weekDay] || "Dia desconocido",
        curso: clase.courseName || "Curso desconocido",
      }));

      setHorariosSalon(data);
      setCursosConDocente(teachers.map((docente) => docente.courseName));
    }
  }, [infoClases, teachers, loading]);

  const handleBuscarProfesor = (cursoSeleccionado, profesorSeleccionado) => {
    if (soloLectura) return;
    setVistaActual(VISTAS.BUSCAR);
    setCurso(cursoSeleccionado);
    setProfesor(profesorSeleccionado);
  };

  const handleRegresar = () => {
    setVistaActual(VISTAS.EDITAR);
    setCurso(null);
    refetch();
  };

  const handleAsignar = (name) => {
    setCursosConDocente((prev) => {
      if (prev.includes(name)) {
        return prev;
      }
      return [...prev, name];
    });
  };

  const handleDesasignar = (name) => {
    setCursosConDocente((prev) => {
      if (prev.includes(name)) {
        return prev.filter((cursoItem) => cursoItem !== name);
      }
      return prev;
    });
  };

  return (
    <div className="p-2 space-y-2 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold mb-1">
          {soloLectura ? "Detalle de Aula" : "Modificacion de Aula"}: {salon?.name}
        </h2>
        <h3 className="text-xl font-semibold mb-1">Turno del Aula: {turno?.name}</h3>
        {rango && <p>Horario: {rango.inicio} - {rango.fin}</p>}
        <div className="mx-auto mt-2 flex max-w-2xl flex-col items-center gap-1 px-2">
          <p className="text-sm sm:text-base">
            <strong>Meet:</strong> <ValorLinkValidado url={salon?.urlMeet} validar={esLinkMeetValido} />
          </p>
          <p className="text-sm sm:text-base">
            <strong>Classroom:</strong> <ValorLinkValidado url={salon?.urlClassroom} validar={esLinkClassroomValido} />
          </p>
        </div>
      </div>

      {rango ? (
        <HorariosMonitor
          aula={salon?.name}
          horas={horariosSalon}
          cursosConDocente={cursosConDocente}
          turno={turno?.name}
        />
      ) : (
        <p className="text-center text-red-500">Turno invalido o no definido.</p>
      )}

      <div className="overflow-x-auto w-full">
        {vistaActual === VISTAS.EDITAR ? (
          loading ? <SkeletonTabla numRows={15} numColums={4} /> : (
            <TablaCursos docentes={teachers} buscarProfesor={handleBuscarProfesor} soloLectura={soloLectura} />
          )
        ) : (
          <BuscarProfesor
            idSalon={idSalon}
            curso={curso}
            profesor={profesor}
            setAsignar={handleAsignar}
            setDesasignar={handleDesasignar}
            horario={horariosSalon.filter((hora) => hora.curso === curso.name)}
          />
        )}
      </div>

      <div className="mt-4 mb-2 flex justify-center">
        <ButtonNegative onClick={vistaActual === VISTAS.BUSCAR ? handleRegresar : regresar}>Atras</ButtonNegative>
      </div>
    </div>
  );
};
