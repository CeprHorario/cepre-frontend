import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CoordinatorsServices } from "@/services/CoordinatorsServices";

export const useCoordinadores = ({ page = 1, limit = 20 } = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["coordinadores", page, limit],
    queryFn: () => CoordinatorsServices.getCoordinators(page, limit),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const crearCoordinadorMutation = useMutation({
    mutationFn: CoordinatorsServices.createCoordinator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinadores"] });
    },
  });

  const actualizarCoordinadorMutation = useMutation({
    mutationFn: CoordinatorsServices.updateCoordinator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinadores"] });
    },
  });

  const eliminarCoordinadorMutation = useMutation({
    mutationFn: CoordinatorsServices.deactivate,
    onSuccess: (_, idEliminado) => {
      queryClient.setQueryData(["coordinadores", page, limit], (prev) => {
        if (!prev?.data) return prev;
        return {
          ...prev,
          data: prev.data.filter((coordinador) => coordinador.id !== idEliminado),
          total: Math.max((prev.total || 1) - 1, 0),
        };
      });
    },
  });

  const coordinadores = data?.data || data || [];
  const total = data?.total || coordinadores.length || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    coordinadores,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    crearCoordinadorMutation,
    actualizarCoordinadorMutation,
    eliminarCoordinadorMutation,
  };
};
