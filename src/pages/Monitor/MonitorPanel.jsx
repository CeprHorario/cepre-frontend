import React, { useState, useEffect } from "react";
import { TablaHorarioMonitor } from "@/components/Horarios/indexMonitor";
import { ListaCursosMonitor } from "@/components/ListaCursosMonitor";
import { FuncionesMonitor } from "./FuncionesMonitor";
import { MonitorsServices } from "@/services/MonitorsServices";
import { DIAS_DIC } from "@/constants/dias";
import { formatTimeToHHMM } from "@/utils/formatTime";
import { toast } from "react-toastify";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";

const fetchHorarioData = async () => {
  try {
    const horario = await MonitorsServices.cargarHorario();
    return horario.map((hora) => ({
      dia: DIAS_DIC[hora.weekday],
      hora_ini: formatTimeToHHMM(hora.startTime),
      hora_fin: formatTimeToHHMM(hora.endTime),
      curso: hora.courseName,
    }));
  } catch (error) {
    if (error?.response?.status === 404) {
      toast.error("No se encontró horario para el monitor.");
      return [];
    }
    console.error("Error fetching horario data", error);
  }
};

const fetchProfesoresData = async () => {
  try {
    const profesores = await MonitorsServices.cargarDocentes();
    return profesores.map((profesor) => ({
      curso: profesor.courseName,
      docente: `${profesor.firstName} ${profesor.lastName}`,
      correo: profesor.email,
    }));
  } catch (error) {
    if (error?.response?.status === 404) {
      toast.error("No se encontró profesores asignados.");
      return [];
    }
    console.error("Error fetching profesores data", error);
  }
};

const fetchDatosMonitor = async () => {
  try {
    const data = await MonitorsServices.getInformacion();
    return {
      meetLink: data?.urlMeet || "",
      classroomLink: data?.urlClassroom || "",
      salon: data?.salon || "",
      monitor: `${data?.nombres || ""} ${data?.apellidos || ""}`,
      salon_id: data?.salon_id || "",
      monitor_id: data?.monitorId || "",
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      toast.error("No se encontró información del monitor.");
      return null;
    }
    console.error("Error fetching monitor data", error);
  }
};

export const MonitorPanel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [horario, setHorario] = useState([]);
  const [listaProfesores, setListaProfesores] = useState([]);
  const [monitorInfo, setMonitorInfo] = useState({});

  useEffect(() => {
    const loadHorario = async () => {
      const cachedHorario = sessionStorage.getItem("horario");
      const cachedProfesores = sessionStorage.getItem("profesores");
      const cachedData = sessionStorage.getItem("data_clase");

      if (cachedHorario && cachedProfesores && cachedData) {
        // Usa los datos del cache
        setHorario(JSON.parse(cachedHorario));
        setListaProfesores(JSON.parse(cachedProfesores));
        setMonitorInfo(JSON.parse(cachedData));
      } else {
        // Si no hay cache, obtener los datos del servidor
        try {
          const profesores = await fetchProfesoresData();
          const horario = await fetchHorarioData();
          const monitor = await fetchDatosMonitor();

          if (!horario.length || !monitor) {
            setHorario([]);
            setListaProfesores([]);
            setMonitorInfo({});
            return;
          }

          setIsLoading(false);

          // Guardar en el estado
          setHorario(
            horario?.map((hora) => {
              const profesor = profesores.find(
                (prof) => prof.curso === hora.curso,
              );

              if (profesor) {
                return {
                  ...hora,
                  docente: profesor.docente,
                };
              }
              return hora;
            }),
          );
          setListaProfesores(profesores);
          setMonitorInfo(monitor);

          // Guardar en sessionStorage
          sessionStorage.setItem("horario", JSON.stringify(horario));
          sessionStorage.setItem("profesores", JSON.stringify(profesores));
        } catch (error) {
          console.error("Error en loadHorario", error);
          toast.error("Error al cargar los datos del horario.");
        }
      }
    };

    loadHorario();
  }, []);

  return (
    <div className="bg-gray-200 p-2 md:p-4 mx-0 md:m-5 text-center">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4">
        {/* Lista de Cursos */}
        <div className="col-span-1 md:col-span-2 overflow-x-auto text-xs md:text-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">CURSOS</h2>
          {isLoading ? (
            <SkeletonTabla numRows={15} nuColumns={3} />
          ) : (
            <ListaCursosMonitor cursos={listaProfesores} />
          )}
        </div>

        {/* Horario del Monitor */}
        <div className="col-span-1 md:col-span-3 overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 ">
            HORARIO {monitorInfo?.salon || ""}
          </h2>
          <TablaHorarioMonitor horas={horario} />

          {/* Funciones del Monitor */}
          <div className="col-span-1 md:col-span-5 mt-4 md:mt-8 text-xs md:text-sm">
            <FuncionesMonitor monitorInfo={monitorInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};
