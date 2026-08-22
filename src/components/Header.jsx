import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import unsaLogo from "@/assets/logo-light.png";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { useCoordinatorCourse } from "@/hooks/useCoordinatorCourse";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: coordinatorCourse } = useCoordinatorCourse(
    user?.role === "coordinador" ? user?.coordinatorCourseId : null,
  );
  const coordinatorCourseName = coordinatorCourse?.name;


  const handleLogout = () => {
    logout(navigate);
  };

  const getWelcomeText = () => {
    if (!user) return "Bienvenido";

    const fullName = `${user?.firstName?.split(" ")[0] || "Sin Nombres"} ${user?.lastName || ""}`;
    const courseText =
      user.role === "coordinador" && user.coordinatorCourseId != null
        ? ` - ${coordinatorCourseName || `Curso ${user.coordinatorCourseId}`}`
        : "";

    return `Bienvenido ${user.role}${courseText}, ${fullName}`;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[#78211E] h-20 shadow-md flex items-center z-50">
      {/* Sección izquierda: Logo + Texto alineados */}
      <div className="flex items-center h-full pl-0">
      <div 
        className="bg-[#f7fafa] ml-0 rounded-br-4xl p-3 flex items-center relative"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 0 100%)' }}
      >
        <img
          src={unsaLogo}
          alt="UNSA"
          className="h-10 w-auto object-contain ml-4"
        />
      </div>
      
        <p className="ml-2 md:ml-4 text-white text-sm md:text-lg font-semibold">
          {getWelcomeText()}
        </p>
      </div>

      {/* Botón de salida - Versión ligeramente más grande */}
      <button
        onClick={handleLogout}
        className="ml-auto flex items-center text-white space-x-2 hover:opacity-80 pr-4 cursor-pointer"
      >
        <span className="text-sm md:text-base">Salir</span>
        <FaSignOutAlt size={18} className="md:size-5" />
      </button>
    </header>
  );
};
