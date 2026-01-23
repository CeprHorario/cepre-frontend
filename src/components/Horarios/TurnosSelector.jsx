import React, { useState, useEffect } from "react";
import { DIAS } from "@/constants/dias";
import { Horarios } from "./Horarios.jsx";
import { useCurrentAdmission } from "@/hooks/useCurrentAdmission";
import { useHourSessions } from "@/hooks/useHourSessions";

export const TurnosSelector = ({
  disponibilidad,
  docente,
  setDisponibilidadDocentes,
  modoEdicion = false,
  horarioAsignado = [],
}) => {
  const { shifts, loading: loadingAdmission } = useCurrentAdmission();
  const { horasIni, horasFin, hoursByShift, loading: loadingHours } = useHourSessions();
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");

  // Inicializar turno seleccionado cuando carguen los shifts
  useEffect(() => {
    if (shifts.length > 0 && !turnoSeleccionado) {
      setTurnoSeleccionado(shifts[0].name);
    }
  }, [shifts, turnoSeleccionado]);

  if (loadingAdmission || loadingHours) return <div>Cargando turnos...</div>;
  if (shifts.length === 0) return <div>No hay turnos configurados</div>;

  const handleTurnoChange = (turno) => {
    setTurnoSeleccionado(turno);
  };

  const handleCeldaClick = (nuevaCelda) => {
    console.log({ nuevaCelda, disponibilidad });
    const yaMarcada = disponibilidad.some(
      (d) =>
        d.dia === nuevaCelda.dia &&
        d.hora_ini === nuevaCelda.hora_ini &&
        d.hora_fin === nuevaCelda.hora_fin
    );

    const nuevaDisponibilidad = yaMarcada
      ? disponibilidad.filter(
        (d) =>
          !(
            d.dia === nuevaCelda.dia &&
            d.hora_ini === nuevaCelda.hora_ini &&
            d.hora_fin === nuevaCelda.hora_fin
          )
      )
      : [...disponibilidad, nuevaCelda];

    setDisponibilidadDocentes(nuevaDisponibilidad);
  };

  const handleClickDia = (dia) => {
    // Usar las horas del turno seleccionado
    const turnoSessions = hoursByShift[turnoSeleccionado] || [];
    const turnoHorasIni = turnoSessions.map(s => s.startTime);
    const turnoHorasFin = turnoSessions.map(s => s.endTime);

    const celdasDelDia = turnoHorasIni.map((hora_ini, i) => ({
      dia,
      hora_ini,
      hora_fin: turnoHorasFin[i],
      idDocente: docente?.id,
    }));
  
    const celdasSeleccionables = celdasDelDia.filter(
      (celda) =>
        !horarioAsignado.some(
          (h) =>
            h.dia === celda.dia &&
            h.hora_ini === celda.hora_ini &&
            h.hora_fin === celda.hora_fin
        )
    );
  
    const todasSeleccionablesMarcadas = celdasSeleccionables.every((celda) =>
      disponibilidad.some(
        (d) =>
          d.dia === celda.dia &&
          d.hora_ini === celda.hora_ini &&
          d.hora_fin === celda.hora_fin
      )
    );
  
    const nuevaDisponibilidad = todasSeleccionablesMarcadas
      ? disponibilidad.filter(
          (d) =>
            !celdasSeleccionables.some(
              (celda) =>
                celda.dia === d.dia &&
                celda.hora_ini === d.hora_ini &&
                celda.hora_fin === d.hora_fin
            )
        )
      : [
          ...disponibilidad,
          ...celdasSeleccionables.filter(
            (celda) =>
              !disponibilidad.some(
                (d) =>
                  d.dia === celda.dia &&
                  d.hora_ini === celda.hora_ini &&
                  d.hora_fin === celda.hora_fin
              )
          ),
        ];
  
    setDisponibilidadDocentes(nuevaDisponibilidad);
  };

  const handleClickHora = (hora_ini, hora_fin) => {
    const celdasDeLaHora = DIAS.map((dia) => ({
      dia,
      hora_ini,
      hora_fin,
      idDocente: docente?.id,
    }));
  
    const celdasSeleccionables = celdasDeLaHora.filter(
      (celda) =>
        !horarioAsignado.some(
          (h) =>
            h.dia === celda.dia &&
            h.hora_ini === celda.hora_ini &&
            h.hora_fin === celda.hora_fin
        )
    );
  
    const todasSeleccionablesMarcadas = celdasSeleccionables.every((celda) =>
      disponibilidad.some(
        (d) =>
          d.dia === celda.dia &&
          d.hora_ini === celda.hora_ini &&
          d.hora_fin === celda.hora_fin
      )
    );
  
    const nuevaDisponibilidad = todasSeleccionablesMarcadas
      ? disponibilidad.filter(
          (d) =>
            !celdasSeleccionables.some(
              (celda) =>
                celda.dia === d.dia &&
                celda.hora_ini === d.hora_ini &&
                celda.hora_fin === d.hora_fin
            )
        )
      : [
          ...disponibilidad,
          ...celdasSeleccionables.filter(
            (celda) =>
              !disponibilidad.some(
                (d) =>
                  d.dia === celda.dia &&
                  d.hora_ini === celda.hora_ini &&
                  d.hora_fin === celda.hora_fin
              )
          ),
        ];
  
    setDisponibilidadDocentes(nuevaDisponibilidad);
  };  

  return (
    <div className="">
      <div className="flex w-full mb-4 gap-2 flex-row justify-center flex-wrap">
        {shifts.map((shift) => {
          const turnoSessions = hoursByShift[shift.name] || [];
          const horario = turnoSessions.length > 0
            ? `${turnoSessions[0].startTime} - ${turnoSessions[turnoSessions.length - 1].endTime}`
            : '';
          
          return (
            <button
              key={shift.name}
              onClick={() => setTurnoSeleccionado(shift.name)}
              className={`px-4 py-2 rounded-md cursor-pointer select-none transition-all duration-200 shadow 
                ${turnoSeleccionado === shift.name
                  ? "bg-gray-300 text-black font-bold shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {shift.name}: {horario}
            </button>
          );
        })}
      </div>

      <Horarios
        turno={turnoSeleccionado}
        disponibilidad={disponibilidad}
        horarioAsignado={horarioAsignado}
        handleCeldaClick={modoEdicion ? handleCeldaClick : null}
        handleClickDia={modoEdicion ? handleClickDia : null}
        handleClickHora={modoEdicion ? handleClickHora : null}
      />
    </div>
  );
};
