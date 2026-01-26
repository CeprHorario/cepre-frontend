import React from "react";
import { Dia } from "./Dia";
import { Hora } from "./Hora";
import { Curso } from "./Curso";
import { useCursos } from "@/hooks/useCursos";
import { DIAS } from "@/constants/dias";
import { useHourSessions } from "@/hooks/useHourSessions";

const COLOR_SIN_ASIGNAR = "#393b3d"; // Color para asignaciones sin docente

const agruparHoras = (horas, horasIni, horasFin) => {
  const horasOrdenadas = [...horas].sort((a, b) => {
    if (a.dia !== b.dia) return DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia);
    return horasIni.indexOf(a.hora_ini) - horasIni.indexOf(b.hora_ini);
  });

  const grupos = [];
  let grupoActual = null;

  horasOrdenadas.forEach((hora) => {
    if (
      grupoActual &&
      grupoActual.dia === hora.dia &&
      grupoActual.curso === hora.curso &&
      horasFin.indexOf(grupoActual.hora_fin) + 1 === horasIni.indexOf(hora.hora_ini)
    ) {
      // Agrupar si es misma asignatura y hora consecutiva
      grupoActual.hora_fin = hora.hora_fin;
    } else {
      if (grupoActual) grupos.push(grupoActual);
      grupoActual = { ...hora };
    }
  });

  if (grupoActual) grupos.push(grupoActual);
  return grupos;
};

export const HorariosMonitor = ({ aula, cursosConDocente, horas = [], turno = "" }) => {
  const { horasIni, horasFin, hoursByShift, loading } = useHourSessions();
  
  if (loading) return <div>Cargando...</div>;

  const turnoSessions = hoursByShift[turno] || [];
  const horaInicio = turnoSessions[0]?.startTime || "07:00";
  const horaFin = turnoSessions[turnoSessions.length - 1]?.endTime || "12:10";

  const horasAgrupadas = agruparHoras(horas, horasIni, horasFin);

  const { cursos } = useCursos();
  const minIndex = horasIni.indexOf(horaInicio);
  const maxIndex = horasFin.indexOf(horaFin);

  const getRow = (horaIni) => horasIni.indexOf(horaIni) - minIndex + 2;
  const getRowSpan = (horaIni, horaFin) => horasFin.indexOf(horaFin) - horasIni.indexOf(horaIni) + 1;
  const getColumn = (dia) => DIAS.indexOf(dia) + 2;

  //Colores de curso
  const getColor = (curso = []) => {
    return cursos?.find(
      c => c.name.toUpperCase() === curso?.toUpperCase()
    )?.color || "#31A8E3";
  }

  return (
    <div className="mb-12">
      <div className="grid grid-cols-7 gap-1 bg-white shadow-md rounded-lg p-4 relative">
        <div></div>
        {/* Pintar los días de la semana en la parte superior */}
        {DIAS.map((dia, index) => (
          <Dia key={index} nombre={dia} />
        ))}

        {/* Pintar todas las horas */}
        {horasIni.slice(minIndex, maxIndex + 1).map((hora, index) => (
          <Hora key={index} hora={`${hora} - ${horasFin[minIndex + index]}`} />
        ))}

        {/* Pintar todas las celdas grises claras */}
        {DIAS.flatMap((_, i) =>
          horasIni.slice(minIndex, maxIndex + 1).map((_, k) => (
            <div
              key={`bg-${i}-${k}`}
              className="rounded-lg"
              style={{
                backgroundColor: "#f8fafc",
                gridColumn: i + 2,
                gridRow: k + 2,
              }}
            />
          ))
        )}

        {/* Pintar asignaciones de salones/monitores */}
        {horasAgrupadas?.map((hora) => {
          const tieneDocente = cursosConDocente?.some((curso) => {
            return curso?.toUpperCase() === hora.curso?.toUpperCase();
          });

          const colorFondo = tieneDocente ? getColor(hora?.curso) : COLOR_SIN_ASIGNAR;

          return (
            <Curso
              key={`${aula}-${hora.dia}-${hora.hora_ini}`}
              nombre={hora?.curso?.toUpperCase()}
              backgroundColor={colorFondo}
              gridColumn={getColumn(hora.dia)}
              gridRow={getRow(hora.hora_ini)}
              gridSpan={getRowSpan(hora.hora_ini, hora.hora_fin)}
              style={{ "fontSize": "0.8rem" }}
            />
          );
        })}
      </div>
    </div>
  );
};
