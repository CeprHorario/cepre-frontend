import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SchedulesService } from "@/services/SchedulesServices";

export const useListaSalonesDisponibles = ({ objApi, page = 1, limit = 10, area_id = null, shift_id = null }) => {
  const enabled = Boolean(objApi?.idDocente && objApi?.idCurso && objApi?.horario);
  const queryClient = useQueryClient();

  console.log('🏫 useListaSalonesDisponibles - enabled:', enabled, 'objApi:', objApi);

  objApi = {
    ...objApi,
    page,
    pageSize: limit,
    area_id,
    shift_id,
  };

  const {
    data: salones,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["salonesDisponibles", objApi, page, limit, area_id, shift_id],
    queryFn: () => {
      console.log('🏫 Ejecutando query getClasesDisponibles con objApi:', objApi);
      return SchedulesService.getClasesDisponibles(objApi);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos sin volver a pedir los mismos datos
    cacheTime: 1000 * 60 * 10, // 10 minutos de retención en caché
    retry: 1,
    refetchOnWindowFocus: false,
    enabled, // evita ejecutar la query si no se tiene los datos necesarios
  });

  console.log('🏫 Salones recibidos:', salones, 'isLoading:', isLoading, 'isError:', isError);

  const asignarSalonMutation = useMutation({
    mutationFn: ({ teacherId, classId }) =>
      SchedulesService.asignarSchedulesByTeacherClass({
        teacherId,
        classId,
      }),
    onSuccess: (_, { classId }) => {
      // Actualizar cache y eliminar el salón asignado
      queryClient.setQueryData(
        ["salonesDisponibles", objApi, page, limit, area_id, shift_id],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData?.filter((salon) => salon.id !== classId);
        }
      );
    },
    onError: () => { },
  });

  return {
    salones,
    isLoading,
    enabled,
    isError,
    error,
    asignarSalonMutation,
    refetch,
    isFetching,
  };
};