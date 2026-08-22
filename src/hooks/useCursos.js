import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CursoService from "@/services/cursoServices";

export function useCursos({ enabled = true } = {}) {
  const queryClient = useQueryClient();

  // Obtener los cursos con useQuery
  const {
    data: cursos = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["cursos"], // clave única para cachear y reutilizar esta consulta
    queryFn: CursoService.getCursos,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos: evita refetch si no ha pasado ese tiempo
    cacheTime: 1000 * 60 * 10, // 10 minutos en memoria si no se está usando
    retry: 1, // solo 1 intento si falla
    refetchOnWindowFocus: false, // no vuelve a pedir la data al cambiar de pestaña
  });

  // Mutación para crear un curso
  const crearCursoMutation = useMutation({
    mutationFn: CursoService.createCurso,
    onSuccess: (nuevoCurso) => {
      queryClient.setQueryData(["cursos"], (cursosPrevios = []) => [
        ...cursosPrevios,
        nuevoCurso,
      ]);
    },
  });

  // Mutación para actualizar un curso
  const actualizarCursoMutation = useMutation({
    mutationFn: CursoService.updateCurso,
    onSuccess: (cursoActualizado) => {
      queryClient.setQueryData(["cursos"], (cursosPrevios = []) =>
        cursosPrevios.map((curso) =>
          curso.id === cursoActualizado.id ? cursoActualizado : curso
        )
      );
    },
  });

  // Mutación para eliminar un curso
  const eliminarCursoMutation = useMutation({
    mutationFn: CursoService.deleteCurso,
    onSuccess: (_, idEliminado) => {
      queryClient.setQueryData(["cursos"], (cursosPrevios = []) =>
        cursosPrevios.filter((curso) => curso.id !== idEliminado)
      );
    },
  });

  return {
    cursos,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    crearCursoMutation,
    actualizarCursoMutation,
    eliminarCursoMutation,
  };
}
