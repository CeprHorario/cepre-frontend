import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Tabla } from "@/components/ui/Tabla";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";
import { AgregarSalon } from "./AgregarSalon";
import { useClases } from "@/hooks/useClases";
import { useAreas } from "@/hooks/useAreas";
import { useTurnos } from "@/hooks/useTurnos";
import { SkeletonTabla } from "@/components/skeletons/SkeletonTabla";
import { EditarSalon } from "./EditarSalon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const VISTAS = {
  LISTA: "lista",
  AGREGAR: "agregar",
  EDITAR: "editar",
};

const ESTADOS_SALON = {
  COMPLETO: "Listo",
  FALTAN_DOCENTES: "Falta Docentes",
};

const esLinkMeetValido = (url) => {
  if (!url?.trim()) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol.startsWith("http") && parsedUrl.hostname === "meet.google.com";
  } catch {
    return false;
  }
};

const esLinkClassroomValido = (url) => {
  if (!url?.trim()) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol.startsWith("http") && parsedUrl.hostname === "classroom.google.com";
  } catch {
    return false;
  }
};

const EnlaceMeet = ({ url }) => {
  if (!url?.trim()) return <span className="font-semibold text-amber-700">Faltante</span>;

  if (!esLinkMeetValido(url)) {
    return <span className="font-semibold text-red-700">Link invalido</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-700 hover:underline break-all"
    >
      Abrir Meet
    </a>
  );
};

const EnlaceClassroom = ({ url }) => {
  if (!url?.trim()) return <span className="font-semibold text-amber-700">Faltante</span>;

  if (!esLinkClassroomValido(url)) {
    return <span className="font-semibold text-red-700">Link invalido</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-700 hover:underline break-all"
    >
      Abrir Classroom
    </a>
  );
};

export const Salones = ({ soloLectura = false, titulo = "GESTION DE SALONES", permitirDetalle = true }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const vistaClase = useMemo(() => searchParams.get("salon") || "", [searchParams]);
  const encabezadoCursos = useMemo(
    () => {
      const columnas = [
      "N de Aula",
      "Area",
      "Turno",
      "Estado",
      "Meet",
      "Classroom",
      ];

      if (!soloLectura || permitirDetalle) {
        columnas.push(soloLectura ? "Ver" : "Acciones");
      }

      return columnas;
    },
    [soloLectura, permitirDetalle],
  );

  const {
    clases,
    isLoading: isLoadingClases,
    eliminarClaseMutation,
    crearClaseMutation,
    refetch,
  } = useClases();

  const { areas, isLoading: isLoadingAreas } = useAreas();
  const { turnos, isLoading: isLoadingTurnos } = useTurnos();

  const [salonAEditar, setSalonAEditar] = useState(null);
  const [salonAEliminar, setSalonAEliminar] = useState(null);
  const [vistaActual, setVistaActual] = useState(VISTAS.LISTA);

  const filtro = useMemo(() => {
    if (!areas?.length || !turnos?.length) return {};
    return {
      1: { options: areas.map((a) => a.name) },
      2: { options: turnos.map((t) => t.name) },
      3: { options: ["Listo", "Falta Docentes"] },
    };
  }, [areas, turnos]);

  const handleBorrar = async () => {
    if (!salonAEliminar?.id) return;
    try {
      await eliminarClaseMutation.mutateAsync(salonAEliminar.id);
      toast.success("Salon eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el aula:", error);
      toast.error("Error al eliminar el salon");
    }
  };

  const handleAgregarSalon = async (nuevoSalon) => {
    try {
      const claseCreada = await crearClaseMutation.mutateAsync(nuevoSalon);
      toast.success(`Salon "${claseCreada.name}" creado correctamente`);
      setVistaActual(VISTAS.LISTA);
    } catch (error) {
      console.error("Error al agregar el salon:", error);
      toast.error("Error al crear el salon");
    }
  };

  const handleAgregar = () => {
    setVistaActual(VISTAS.AGREGAR);
  };

  const handleEditar = useCallback((aula) => {
    if (!permitirDetalle) return;

    setSalonAEditar(aula?.id);
    setVistaActual(VISTAS.EDITAR);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("salon", aula?.name || "");
      return newParams;
    });
  }, [permitirDetalle, setSearchParams]);

  useEffect(() => {
    if (permitirDetalle && vistaClase && clases.length) {
      const aula = clases.find((item) => item.name === vistaClase);
      if (aula) {
        handleEditar(aula);
      }
    }
  }, [permitirDetalle, vistaClase, clases, handleEditar]);

  const handleRegresar = () => {
    setVistaActual(VISTAS.LISTA);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("salon");
      return newParams;
    }, { replace: true });
  };

  const getAcciones = (aula) => (
    <div className="inline-flex gap-10">
      <Button onClick={() => handleEditar(aula)}>Editar</Button>
      <ButtonNegative onClick={() => setSalonAEliminar(aula)}>Borrar</ButtonNegative>
    </div>
  );

  const getVista = (aula) => (
    <div className="inline-flex justify-center">
      <Button onClick={() => handleEditar(aula)}>Ver</Button>
    </div>
  );

  const getDatosAulas = () => {
    if (!clases || !Array.isArray(clases)) return [];

    const clasesOrdenadas = [...clases].sort((a, b) =>
      a.name?.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    return clasesOrdenadas.map((aula) => {
      const fila = [
      aula.name || "Sin nombre",
      aula.area?.name || "Sin area",
      aula.shift?.name || "Sin turno",
      ESTADOS_SALON[aula?.status] || "Sin estado",
      <EnlaceMeet url={aula.urlMeet} />,
      <EnlaceClassroom url={aula.urlClassroom} />,
      ];

      if (!soloLectura || permitirDetalle) {
        fila.push(soloLectura ? getVista(aula) : getAcciones(aula));
      }

      return fila;
    });
  };

  if (vistaActual === VISTAS.AGREGAR) {
    return <AgregarSalon onAgregarSalon={handleAgregarSalon} regresar={handleRegresar} areas={areas} turnos={turnos} />;
  }

  if (vistaActual === VISTAS.EDITAR) {
    return <EditarSalon idSalon={salonAEditar} regresar={handleRegresar} soloLectura={soloLectura} />;
  }

  return (
    <div className="overflow-x-auto w-full text-center text-xs sm:text-sm">
      <div className="flex justify-between items-center mt-1 mb-6 px-4">
        <Button onClick={refetch}>
          <FaSyncAlt />
        </Button>
        <h2 className="text-2xl font-bold text-center flex-1">{titulo}</h2>
        {soloLectura ? <div className="w-24" /> : <Button onClick={handleAgregar}>Agregar Salon</Button>}
      </div>

      {isLoadingAreas || isLoadingTurnos || isLoadingClases ? (
        <SkeletonTabla numRows={6} />
      ) : (
        <Tabla encabezado={encabezadoCursos} datos={getDatosAulas()} filtroDic={filtro} />
      )}
      <ConfirmModal
        open={!!salonAEliminar}
        title="Eliminar salon"
        message={`Se eliminara el salon "${salonAEliminar?.name || ""}". Esta accion no se puede deshacer.`}
        confirmText="Eliminar salon"
        isLoading={eliminarClaseMutation.isPending}
        onCancel={() => setSalonAEliminar(null)}
        onConfirm={async () => {
          await handleBorrar();
          setSalonAEliminar(null);
        }}
      />
      <div className="mb-4"></div>
    </div>
  );
};
