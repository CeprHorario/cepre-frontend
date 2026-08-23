import React from "react";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { HorarioDocenteCompleto } from "@/components/Horarios/HorarioDocenteCompleto";
import { useHorarioAsignadoDocente } from "@/hooks/useHorarioAsignadoDocente";
import { Button } from "@/components/ui/Button";
import { useHourSessions } from "@/hooks/useHourSessions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Tabla } from "@/components/ui/Tabla";

export const HorarioCompleto = ({
  setMostrarHorarioCompleto,
  docente,
  soloLectura = false,
  mostrarEnlacesClases = false,
}) => {
  const { horario, loading, desasignarClaseMutation, refetch } =
    useHorarioAsignadoDocente({ idDocente: docente?.id });
  const [estadoEliminar, setEstadoEliminar] = React.useState(false);
  const [claseAEliminar, setClaseAEliminar] = React.useState(null);
  const { horasIni, horasFin } = useHourSessions();
  const clasesConEnlaces = React.useMemo(() => {
    const clases = new Map();

    (horario || []).forEach((item) => {
      const key = item.id || `${item.clase}-${item.area}`;
      if (!clases.has(key)) {
        clases.set(key, {
          clase: item.clase || "-",
          area: item.area || "-",
          urlMeet: item.urlMeet || "",
          urlClassroom: item.urlClassroom || "",
        });
      }
    });

    return Array.from(clases.values());
  }, [horario]);

  const renderLink = (url, label) =>
    url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline hover:text-blue-800 break-all"
      >
        {label}
      </a>
    ) : (
      <span className="text-gray-500">Sin enlace</span>
    );

  const handleClaseSeleccionada = (clase) => {
    if (!estadoEliminar || !clase) return;
    setClaseAEliminar(clase);
  };

  const handleConfirmarEliminarClase = async () => {
    if (!claseAEliminar) return;
    try {
      await desasignarClaseMutation({
        teacherId: claseAEliminar?.idDocente,
        classId: claseAEliminar?.idClase,
      });
      refetch();
      setClaseAEliminar(null);
    } finally {
      setEstadoEliminar(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Horario Docente {docente?.firstName} {docente?.lastName}
      </h1>

      {loading ? (
        <p>Cargando horario...</p>
      ) : (
        <>
          <HorarioDocenteCompleto
            horarios={horario || []}
            setClaseSeleccionada={handleClaseSeleccionada}
            idDocente={docente?.id}
            estadoEliminar={estadoEliminar}
            horasIni={horasIni}
            horasFin={horasFin}
          />

          {mostrarEnlacesClases && (
            <div className="w-full max-w-5xl">
              <h2 className="mb-3 text-xl font-bold text-[#78211E]">
                Enlaces de clases
              </h2>
              <Tabla
                encabezado={["Clase", "Área", "Meet", "Classroom"]}
                datos={clasesConEnlaces.map((clase) => [
                  clase.clase,
                  clase.area,
                  renderLink(clase.urlMeet, "Abrir Meet"),
                  renderLink(clase.urlClassroom, "Abrir Classroom"),
                ])}
                filtrar={false}
              />
            </div>
          )}
        </>
      )}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <ButtonNegative onClick={() => setMostrarHorarioCompleto(false)}>
          Atrás
        </ButtonNegative>
        {!soloLectura && (
          <Button onClick={() => setEstadoEliminar(!estadoEliminar)}>
            {estadoEliminar ? "Eliminando Clase" : "Eliminar Clase"}
          </Button>
        )}
      </div>
      <ConfirmModal
        open={!!claseAEliminar}
        title="Eliminar clase asignada"
        message={`Se eliminará la clase "${claseAEliminar?.clase || ""}" del horario del docente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar clase"
        isLoading={false}
        onCancel={() => setClaseAEliminar(null)}
        onConfirm={handleConfirmarEliminarClase}
      />
    </div>
  );
};
