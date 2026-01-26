import React, { useState, useEffect } from "react";
import { AulaInfo } from "@/components/AulaInfo";
import { ListaSalones } from "@/components/ListaSalones";
import { TablaHorario } from "@/components/Horarios";
import { ClassesServices } from "@/services/ClassesServices";
import { DIAS_DIC } from "@/constants/dias";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { useHourSessions } from "@/hooks/useHourSessions";

const AREAS = {
  S: "Sociales",
  I: "Ingenierías",
  B: "Biomédicas",
  E: "Extraordinario",
};

const fetchHorarioData = async () => {
  try {
    const clases = await ClassesServices.getClassesOfTeacher();

    return clases.map((clase) => ({
      aula: clase.name.replace("-", " - "),
      monitor: clase.monitor?.user
        ? `${clase.monitor.user.firstName} ${clase.monitor.user.lastName}`
        : "No asignado",
      enlace: clase.urlMeet,
      area: AREAS[clase.name.charAt(0)] || "Desconocido",
      horas:
        clase.schedules?.map((hora) => ({
          dia: DIAS_DIC[hora.weekday] || "Día desconocido",
          hora_ini: formatTimeToHHMM(hora.hourSession.startTime),
          hora_fin: formatTimeToHHMM(hora.hourSession.endTime),
        })) || [],
    }));
  } catch (error) {
    console.error("Error fetching horario data", error);
    return [];
  }
};

export const DocentePanel = () => {
  const [horario, setHorario] = useState([]);
  const [numHoras, setNumHoras] = useState(0);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const { horasIni, horasFin } = useHourSessions();

  useEffect(() => {
    const loadHorario = async () => {
      try {
        const data = await fetchHorarioData();
        let numHoras = 0;
        data.forEach((clase) => {
          clase?.horas?.forEach(() => {
            numHoras += 1;
          });
        });
        setHorario(data);
        setNumHoras(numHoras);
      } catch (error) {
        console.error("Error cargando el horario", error);
      }
    };

    loadHorario();
  }, []);

  return (
    <div className="p-0 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {/* Horario General */}
        <div className="col-span-1 md:col-span-2 bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-5xl font-semibold mb-4">Horario General</h2>
          <TablaHorario
            listaSalones={horario}
            horasIni={horasIni}
            horasFin={horasFin}
            setClaseSeleccionada={setClaseSeleccionada}
          />
        </div>

        {/* Información del Aula */}

        <div className="col-span-1 bg-gray-100 p-4 rounded-lg shadow-md flex justify-center items-center flex-col">
          <h1 className="text-xl font-bold mb-4">
            Total de horas Académicas: {numHoras}
          </h1>
          <AulaInfo {...(claseSeleccionada || {})} />
        </div>

        {/* Lista de Salones */}
        <div className="col-span-1 md:col-span-3 bg-gray-100 p-4 rounded-lg shadow-md">
          <ListaSalones items={horario} />
        </div>
      </div>
    </div>
  );
};
