import React from "react";
import { DocenteUsuarios } from "@/pages/Admin/gestionar/usuarios/docente/DocenteUsuarios";
import { useAuth } from "@/contexts/useAuth";
import { useCoordinatorCourse } from "@/hooks/useCoordinatorCourse";

export const CoordinatorPanel = () => {
  const { user } = useAuth();
  const esCoordinadorGeneral = user?.coordinatorCourseId == null;
  const { data: coordinatorCourse } = useCoordinatorCourse(
    esCoordinadorGeneral ? null : user?.coordinatorCourseId,
  );
  const coordinatorCourseName =
    coordinatorCourse?.name || `Curso ${user?.coordinatorCourseId}`;
  const panelTitle = esCoordinadorGeneral
    ? "Panel de Coordinador General"
    : `Panel de Coordinador - ${coordinatorCourseName}`;

  return (
    <div className="md:m-5">
      <div className="w-full min-h-screen md:min-h-[82vh] bg-gray-200 md:shadow-md md:rounded-lg px-2 md:p-4 pb-16 md:pb-4 overflow-auto">
        <div className="w-full text-center text-xs sm:text-sm">
          <div className="mb-4 px-4 text-left">
            <h1 className="text-2xl font-bold text-[#78211E]">
              {panelTitle}
            </h1>
            <p className="text-sm text-gray-700">
              {esCoordinadorGeneral
                ? "Consulta general de docentes y horarios asignados."
                : "Consulta de docentes y horarios asignados del curso a cargo."}
            </p>
          </div>

          <DocenteUsuarios
            soloLectura
            mostrarFiltroCurso={esCoordinadorGeneral}
            ocultarHorasMaximas
            titulo="CONSULTA DE DOCENTES"
          />
        </div>
      </div>
    </div>
  );
};
