import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeachersServices } from "@/services/TeachersServices.js";

export const useProfesores = ({ page = 1, limit = 20, curso_id = null } = {}) => {
  const queryClient = useQueryClient();

  // Obtener los profesores con useQuery
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["profesores", page, limit, curso_id], // clave única para cachear y reutilizar esta consulta
    queryFn: () => TeachersServices.getTeachers(page, limit, curso_id),
    staleTime: 1000 * 60 * 5, // 5 minutos: evita refetch si no ha pasado ese tiempo
    cacheTime: 1000 * 60 * 10, // 10 minutos en memoria si no se está usando
    retry: 1, // solo 1 intento si falla
    refetchOnWindowFocus: false, // no vuelve a pedir la data al cambiar de pestaña
  });

  // Mutación para crear un profesor
  const crearProfesorMutation = useMutation({
    mutationFn: TeachersServices.createTeacher,
    onSuccess: (nuevoProfesor) => {
      queryClient.setQueryData(["profesores", page, limit], (prev) => {
        if (!prev) return;
        const newProfesor = {
          courseName: nuevoProfesor?.teacher?.courses?.name,
          email: nuevoProfesor?.email,
          firstName: nuevoProfesor?.userProfile?.firstName,
          lastName: nuevoProfesor?.userProfile?.lastName,
          id: nuevoProfesor?.teacher?.id,
          isCoordinator: nuevoProfesor?.teacher?.isCoordinator,
          jobStatus: nuevoProfesor?.teacher?.jobStatus,
          phone: nuevoProfesor?.userProfile?.phone,
        }
        return {
          ...prev,
          data: [newProfesor, ...prev.data],
          total: prev.total + 1,
        };
      });
    },
  });

  // Mutación para actualizar un profesor
  const actualizarProfesorMutation = useMutation({
    mutationFn: TeachersServices.updateTeacher,
    onSuccess: (profesorActualizado) => {
      queryClient.setQueryData(["profesores", page, limit, curso_id], (prev) => {
        if (!prev) return;
        return {
          ...prev,
          data: prev.data.map((p) =>
            p.id === profesorActualizado.id ? {
              ...p,
              firstName: profesorActualizado.firstName || "-",
              lastName: profesorActualizado.lastName || "-",
              email: profesorActualizado.email || "-",
              phone: profesorActualizado.phone || "-",
              maxHours: profesorActualizado.maxHours || "-",
            } : p
          ),
        };
      });
    },
  });

  // Mutación para eliminar un profesor
  const eliminarProfesorMutation = useMutation({
    mutationFn: TeachersServices.deactivate,
    onSuccess: (_, idEliminado) => {
      queryClient.setQueryData(["profesores", page, limit, curso_id], (prev) => {
        if (!prev) return;
        return {
          ...prev,
          data: prev.data.filter((p) => p.id !== idEliminado),
          total: prev.total - 1,
        };
      });
    },
  });

  const profesores = data?.data || [];
  const total = data?.total || 0; // total de profesores
  const totalPages = Math.ceil(total / limit);

  return {
    profesores,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    crearProfesorMutation,
    actualizarProfesorMutation,
    eliminarProfesorMutation,
  };
};