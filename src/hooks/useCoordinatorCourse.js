import { useQuery } from "@tanstack/react-query";
import CursoService from "@/services/cursoServices";

export const useCoordinatorCourse = (coordinatorCourseId) => {
  const courseId = Number(coordinatorCourseId);
  const hasCourse = Number.isFinite(courseId) && courseId > 0;

  return useQuery({
    queryKey: ["coordinatorCourse", courseId],
    queryFn: () => CursoService.getCursoById(courseId),
    enabled: hasCourse,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};
