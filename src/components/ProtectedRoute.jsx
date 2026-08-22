import React from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { LoginPanel } from "@/pages/Login/LoginPanel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const ProtectedRoute = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: user } = useCurrentUser();

  const urlToken = searchParams.get("token");
  const storedToken = localStorage.getItem("token");
  const token = urlToken || storedToken;

  if (location.pathname === "/login" && urlToken) {
    return <Outlet />; // Permitir acceso al login con token
  }

  if (!token) {
    return <LoginPanel />;
  }

  try {
    const userRole = user?.role;

    if (urlToken && urlToken !== storedToken) {
      localStorage.setItem("token", urlToken);
    }

    const rolePaths = {
      administrador: "/admin",
      profesor: "/docente",
      docente: "/docente",
      monitor: "/monitor",
      supervisor: "/supervisor",
      coordinador: "/coordinador",
    };

    const expectedPath = rolePaths[userRole] || "/";

    if (!location.pathname.startsWith(expectedPath)) {
      return <Navigate to={expectedPath} replace />;
    }

    return <Outlet />; // Ruta correcta para el rol
  } catch (error) {
    console.error("Token inválido:", error);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};
