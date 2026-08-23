import React, { useState } from "react";
import { ButtonCabecera } from "@/components/ui/ButtonCabecera";
import { DocenteUsuarios } from "./docente/DocenteUsuarios";
import { MonitorUsuarios } from "./monitor/MonitorUsuarios";
import { SupervisorUsuarios } from "./supervisor/SupervisorUsuarios";
import { CoordinadorUsuarios } from "./coordinador/CoordinadorUsuarios";

const ROLES = {
  DOCENTE: "Docente",
  MONITOR: "Monitor",
  SUPERVISOR: "Supervisor",
  COORDINADOR: "Coordinador",
};

export const Usuarios = () => {
  const [rol, setRol] = useState(ROLES.DOCENTE);
  const [mostrarCabecera, setMostrarCabecera] = useState(true); // NUEVO

  const handleClick = (nuevoRol) => {
    setRol(nuevoRol);
    setMostrarCabecera(true); // Mostrar cabecera al cambiar de rol
  };

  return (
    <div className="overflow-x-auto w-full text-center text-xs sm:text-sm">
      {mostrarCabecera && ( // SOLO SI mostrarCabecera es true
        <div className="flex w-full max-w-xl justify-between mx-auto mb-4 gap-2">
          {Object.values(ROLES).map((tipoRol) => (
            <ButtonCabecera
              key={tipoRol}
              text={tipoRol}
              handleClick={() => handleClick(tipoRol)}
              className={`${rol === tipoRol ? "bg-gray-300 font-bold" : "bg-white"} px-4 py-2 rounded shadow`}
            />
          ))}
        </div>
      )}

      {rol === ROLES.DOCENTE && <DocenteUsuarios setMostrarCabecera={setMostrarCabecera} />}
      {rol === ROLES.MONITOR && <MonitorUsuarios />}
      {rol === ROLES.SUPERVISOR && <SupervisorUsuarios setMostrarCabecera={setMostrarCabecera} />}
      {rol === ROLES.COORDINADOR && <CoordinadorUsuarios />}
    </div>
  );
};
