import React, { useState } from "react";
import { DocenteUsuarios } from "@/pages/Admin/gestionar/usuarios/docente/DocenteUsuarios";
import { Salones } from "@/pages/Admin/gestionar/salones/Salones";
import { useAuth } from "@/contexts/useAuth";
import { useCoordinatorCourse } from "@/hooks/useCoordinatorCourse";

const VISTAS = {
  DOCENTES: "docentes",
  SALONES: "salones",
};

export const CoordinatorPanel = () => {
  const { user } = useAuth();
  const esCoordinadorGeneral = user?.coordinatorCourseId == null;
  const [vistaActual, setVistaActual] = useState(VISTAS.DOCENTES);
  const { data: coordinatorCourse } = useCoordinatorCourse(
    esCoordinadorGeneral ? null : user?.coordinatorCourseId,
  );
  const coordinatorCourseName =
    coordinatorCourse?.name || `Curso ${user?.coordinatorCourseId}`;
  const panelTitle = esCoordinadorGeneral
    ? "Panel de Coordinador General"
    : `Panel de Coordinador - ${coordinatorCourseName}`;

  const renderContenido = () => {
    if (vistaActual === VISTAS.SALONES) {
      return <Salones soloLectura titulo="CONSULTA DE SALONES" permitirDetalle={esCoordinadorGeneral} />;
    }

    return (
      <DocenteUsuarios
        soloLectura
        mostrarFiltroCurso={esCoordinadorGeneral}
        ocultarHorasMaximas
        titulo="CONSULTA DE DOCENTES"
      />
    );
  };

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
                ? "Consulta general de docentes, salones y horarios asignados."
                : "Consulta de docentes y horarios asignados del curso a cargo."}
            </p>
          </div>

          <div className="mb-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setVistaActual(VISTAS.DOCENTES)}
              className={`rounded-md px-4 py-2 font-semibold shadow-sm transition-colors ${
                vistaActual === VISTAS.DOCENTES
                  ? "bg-[#78211E] text-white"
                  : "bg-white text-[#78211E] hover:bg-gray-100"
              }`}
            >
              Docentes
            </button>
            <button
              type="button"
              onClick={() => setVistaActual(VISTAS.SALONES)}
              className={`rounded-md px-4 py-2 font-semibold shadow-sm transition-colors ${
                vistaActual === VISTAS.SALONES
                  ? "bg-[#78211E] text-white"
                  : "bg-white text-[#78211E] hover:bg-gray-100"
              }`}
            >
              Salones
            </button>
          </div>

          {renderContenido()}
        </div>
      </div>
    </div>
  );
};
