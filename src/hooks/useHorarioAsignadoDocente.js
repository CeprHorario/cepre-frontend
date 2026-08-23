import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DIAS_DIC } from "@/constants/dias";
import { TeachersServices } from "@/services/TeachersServices";
import { SchedulesService } from "@/services/SchedulesServices";
import { formatTimeToHHMM } from "@/utils/formatTime";

const formatearHorario = (data) => {
  return Array.isArray(data)
    ? data.flatMap((clase) =>
      Array.isArray(clase.schedules)
        ? clase.schedules.map((item) => ({
          id: clase.classId,
          area: clase.areaName || "Sin área",
          dia: DIAS_DIC[item.weekday] || item.weekday || "Día desconocido",
          hora_ini: formatTimeToHHMM(item.hourSession?.startTime),
          hora_fin: formatTimeToHHMM(item.hourSession?.endTime),
          clase: clase.className || "ASIGNADO",
          urlClassroom: clase.urlClassroom || clase.classes?.urlClassroom || "",
          urlMeet: clase.urlMeet || clase.classes?.urlMeet || "",
        }))
        : []
    )
    : [];
};

export const useHorarioAsignadoDocente = ({ idDocente }) => {
  const queryClient = useQueryClient();

  const {
    data: horario = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["horarioDocente", idDocente],
    queryFn: async () => {
      if (!idDocente) return [];
      const data = await TeachersServices.getHorario(idDocente);
      return formatearHorario(data);
    },
    enabled: !!idDocente,
  });

  const { mutateAsync: desasignarClaseMutation } = useMutation({
    mutationFn: ({ teacherId, classId }) =>
      SchedulesService.desasignarSchedulesByTeacherClass({ teacherId, classId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["horarioDocente", idDocente]);
    },
    onError: (err) => {
      console.error("Error al desasignar clase:", err);
    },
  });

  return {
    horario,
    loading,
    error: isError ? error : null,
    desasignarClaseMutation,
    refetch,
  };
};
