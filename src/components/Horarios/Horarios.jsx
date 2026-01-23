import React from "react";
import { Dia } from "./Dia";
import { Hora } from "./Hora";
import { Curso } from "./Curso";
import { AREA_COLORS } from "@/constants/areaColors";
import { DIAS } from "@/constants/dias";
import { useHourSessions } from "@/hooks/useHourSessions";

const COLORS_CELDAS = {
  "PERTENECE": "#b5e6b5",
  "NO_PERTENECE": "#f4f4f4",
}

// Función para verificar cruce de horas entre clase y turno
const hayCruceDeHoras = (horaIniClase, horaFinClase, horaIniTurno, horaFinTurno, horasIni, horasFin) => {
  if (!horasIni || !horasFin) return false;
  
  const iniClase = horasIni.indexOf(horaIniClase);
  const finClase = horasFin.indexOf(horaFinClase);
  const iniTurno = horasIni.indexOf(horaIniTurno);
  const finTurno = horasFin.indexOf(horaFinTurno);
  
  // Si alguna hora no está en el turno actual, no hay cruce
  if (iniClase === -1 || finClase === -1 || iniTurno === -1 || finTurno === -1) return false;
  
  return finClase >= iniTurno && iniClase <= finTurno;
};

function esHora2AntesQueHora1(hora1, hora2) {
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);

  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;

  return minutos2 < minutos1;
}

function compararTurnoYSalon(turno, salon) {
  const turnoDigito = turno.substring(turno.length - 1); // último carácter
  const salonDigito = salon.substring(2, 3); // primer dígito después de "I-"

  return turnoDigito === salonDigito;
}

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
      grupoActual.clase === hora.clase &&
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


const TablaTurno = ({
  nombreTurno,
  horarioAsignado = [],
  horaInicio,
  horaFin,
  disponibilidad = [],
  handleCeldaClick,
  handleClickDia,
  handleClickHora,
  horasIni,
  horasFin,
}) => {
  const minIndex = horasIni.indexOf(horaInicio);
  const maxIndex = horasFin.indexOf(horaFin);

  const horasTurno = horarioAsignado.filter(
    (hora) => esHora2AntesQueHora1(horaFin, hora.hora_ini) &&
      esHora2AntesQueHora1(hora.hora_fin, horaInicio) && compararTurnoYSalon(nombreTurno, hora.clase));

  const horasAgrupadas = agruparHoras(horasTurno, horasIni, horasFin);

  const getRow = (horaIni) => horasIni.indexOf(horaIni) - minIndex + 2;
  const getRowSpan = (horaIni, horaFin) =>
    horasFin.indexOf(horaFin) - horasIni.indexOf(horaIni) + 1;
  const getColumn = (dia) => DIAS.indexOf(dia) + 2;

  return (
    <div className="grid grid-cols-7 gap-1 bg-white shadow-md rounded-lg p-4 relative w-full">
      <div></div>
      {DIAS.map((dia, index) => (
        <Dia key={index} nombre={dia} onClick={handleClickDia ? () => handleClickDia(dia) : null} clickable={handleClickDia ? true : false} />
      ))}

      {horasIni.slice(minIndex, maxIndex + 1).map((hora, index) => (
        <Hora
          key={index}
          hora={`${hora} - ${horasFin[minIndex + index]}`}
          onClick={handleClickHora ? () =>
            handleClickHora?.(hora, horasFin[minIndex + index]) : null
          }
        />
      ))}

      {DIAS.flatMap((dia, i) =>
        horasIni.slice(minIndex, maxIndex + 1).map((hora, k) => {
          const horaIndex = horasIni.indexOf(hora);
          const horaFin = horasFin[horaIndex];

          const estaDisponible = disponibilidad.some(
            (d) => d.dia === dia && d.hora_ini === hora && d.hora_fin === horaFin
          );

          return (
            <div
              key={`bg-${dia}-${hora}`}
              className={`rounded-lg ${handleCeldaClick ? 'cursor-pointer' : ''}`}
              onClick={() => {
                handleCeldaClick?.({
                  dia,
                  hora_ini: hora,
                  hora_fin: horaFin,
                });
              }}
              style={{
                backgroundColor: estaDisponible ? COLORS_CELDAS.PERTENECE : COLORS_CELDAS.NO_PERTENECE,
                gridColumn: i + 2,
                gridRow: k + 2,
              }}
            />
          );
        })
      )}

      {horasAgrupadas?.map((hora) => {
        return (
          <Curso
            key={`${hora.dia}-${hora.hora_ini}-${hora.hora_fin}`}
            nombre={hora.clase}
            backgroundColor={AREA_COLORS[hora.area] || "#f4351c"} // Asegúrate de que `area` es el correcto
            gridColumn={getColumn(hora.dia)}
            gridRow={getRow(hora.hora_ini)}
            gridSpan={getRowSpan(hora.hora_ini, hora.hora_fin)}
          />
        );
      })}
    </div>
  );
};

export const Horarios = ({
  turno = "",
  disponibilidad = [],
  horarioAsignado = [],
  handleCeldaClick,
  handleClickDia,
  handleClickHora,
}) => {
  const { hoursByShift, loading } = useHourSessions();

  if (loading) return <div className="p-4">Cargando horarios...</div>;
  if (!turno || !hoursByShift[turno]) return <div className="p-4">Turno no encontrado</div>;

  const turnoSessions = hoursByShift[turno];
  const horaInicio = turnoSessions[0]?.startTime;
  const horaFin = turnoSessions[turnoSessions.length - 1]?.endTime;

  // Obtener las horas específicas del turno seleccionado
  const horasIni = turnoSessions.map(s => s.startTime);
  const horasFin = turnoSessions.map(s => s.endTime);

  if (!horaInicio || !horaFin) return <div className="p-4">Error en configuración del turno</div>;

  return (
    <div className="p-4 space-y-10">
      <TablaTurno
        nombreTurno={turno}
        horaInicio={horaInicio}
        horaFin={horaFin}
        horarioAsignado={horarioAsignado}
        disponibilidad={disponibilidad}
        handleCeldaClick={handleCeldaClick}
        handleClickDia={handleClickDia}
        handleClickHora={handleClickHora}
        horasIni={horasIni}
        horasFin={horasFin}
      />
    </div>
  );
};