import React from "react";
import { useCursos } from "@/hooks/useCursos";
import { Button } from "@/components/ui/Button";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { Tabla } from "@/components/ui/Tabla";

export const TablaCursos = ({ docentes = [], buscarProfesor, soloLectura = false }) => {
  const { cursos, isLoading, isError, error } = useCursos();
  const encabezado = soloLectura
    ? ["Curso", "Docente", "Correo del docente"]
    : ["Curso", "Docente", "Correo del docente", "Acciones"];

  if (isLoading) return <SkeletonTabla numRows={5} numColums={encabezado.length} />;

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Error al cargar los cursos: {error.message}
      </div>
    );
  }

  const docentesPorCurso = {};
  docentes.forEach((docente) => {
    if (docente.teacherId !== "no asignado") {
      docentesPorCurso[docente.courseName] = {
        id: docente.teacherId,
        firstName: docente.firstName,
        lastName: docente.lastName,
        email: docente.email,
      };
    }
  });

  const datos = cursos.map((curso) => {
    const docente = docentesPorCurso[curso.name];
    const fila = [
      curso.name,
      docente ? `${docente.firstName} ${docente.lastName}` : "-",
      docente?.email || "-",
    ];

    if (!soloLectura) {
      fila.push(
        <Button key={curso.id} onClick={() => buscarProfesor(curso, docente)}>
          Modificar
        </Button>,
      );
    }

    return fila;
  });

  return (
    <div className="overflow-x-auto w-full">
      <div className="w-full text-center">
        <Tabla encabezado={encabezado} datos={datos} />
      </div>
    </div>
  );
};
