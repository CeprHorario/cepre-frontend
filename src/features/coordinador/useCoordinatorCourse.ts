import { useCourses } from "@/api/queries";

/** Nombre del curso de un coordinador de curso (null para el coordinador general) */
export function useCoordinatorCourseName(courseId: number | null | undefined): string | null {
  const courses = useCourses();
  if (courseId == null) return null;
  return courses.data?.find((c) => c.id === courseId)?.name ?? `Curso ${courseId}`;
}
