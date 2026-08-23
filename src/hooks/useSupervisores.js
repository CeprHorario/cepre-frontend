import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupervisorsServices } from "@/services/SupervisorsServices.js";

export const useSupervisores = ({ page = 1, limit = 20 } = {}) => {
  const queryClient = useQueryClient();

  // Obtener los supervisores con useQuery
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["supervisores", page, limit],
    queryFn: () => SupervisorsServices.getSupervisors(page, limit),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutación para crear un supervisor
  const crearSupervisorMutation = useMutation({
    mutationFn: SupervisorsServices.createSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisores"] });
    },
  });

  // Mutación para actualizar un supervisor
  const actualizarSupervisorMutation = useMutation({
    mutationFn: SupervisorsServices.updateSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisores"] });
    },
  });

  // Mutación para eliminar un supervisor
  const eliminarSupervisorMutation = useMutation({
    mutationFn: SupervisorsServices.deactivate,
    onSuccess: (_, idEliminado) => {
      queryClient.setQueryData(["supervisores", page, limit], (prev) => {
        if (!prev) return;
        return {
          ...prev,
          data: prev.data.filter((s) => s.id !== idEliminado),
          total: prev.total - 1,
        };
      });
    },
  });

  const supervisores = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    supervisores,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    crearSupervisorMutation,
    actualizarSupervisorMutation,
    eliminarSupervisorMutation,
  };
};
