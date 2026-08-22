import React from "react";
import { AuthContext } from "./AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const AuthProvider = ({ children }) => {
  const { data: user, refetch } = useCurrentUser();

  const login = async (token, navigate, shouldRedirect = true) => {
    if (token) {
      localStorage.setItem("token", token);
      const { data: updatedUser } = await refetch();
      if (shouldRedirect && updatedUser?.role) {
        redirectByRole(updatedUser.role, navigate);
      }
    }
  };

  const logout = (navigate) => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // Para resetear caché y estado
  };

  const redirectByRole = (role, navigate) => {
    switch (role) {
      case "administrador":
        navigate("/admin");
        break;
      case "docente":
        navigate("/docente");
        break;
      case "monitor":
        navigate("/monitor");
        break;
      case "supervisor":
        navigate("/supervisor");
        break;
      case "coordinador":
        navigate("/coordinador");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
