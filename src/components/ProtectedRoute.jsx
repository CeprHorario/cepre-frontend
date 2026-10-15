import React from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { LoginPanel } from "@/pages/Login/LoginPanel";
import { MaintenancePage } from "@/pages/Maintenance/MaintenancePage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSystemStatus } from "@/hooks/useSystemStatus";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
    Verificando acceso…
  </div>
);

export const ProtectedRoute = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentUser = useCurrentUser();
  const systemStatus = useSystemStatus();

  const urlToken = searchParams.get("token");
  const storedToken = localStorage.getItem("token");
  const token = urlToken || storedToken;

  if (location.pathname === "/login" && urlToken) {
    return <Outlet />;
  }

  if (systemStatus.isLoading && !systemStatus.data) return <LoadingScreen />;

  const maintenanceError = currentUser.error?.response?.data;
  const maintenance =
    systemStatus.data?.maintenance ||
    (currentUser.error?.response?.status === 503 &&
      maintenanceError?.code === "MAINTENANCE_MODE");
  const maintenanceInfo = maintenanceError?.code === "MAINTENANCE_MODE"
    ? maintenanceError
    : systemStatus.data;

  if (maintenance) {
    if (!token || (!currentUser.isLoading && currentUser.data?.role !== "administrador")) {
      return (
        <MaintenancePage
          message={maintenanceInfo?.message}
          endsAt={maintenanceInfo?.endsAt}
        />
      );
    }
    if (currentUser.isLoading) return <LoadingScreen />;
  }

  if (!token) return <LoginPanel />;
  if (currentUser.isLoading) return <LoadingScreen />;
  if (!currentUser.data) return <LoginPanel />;

  const userRole = currentUser.data.role;
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
  const expectedPath = rolePaths[userRole];

  if (!expectedPath) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
  if (!location.pathname.startsWith(expectedPath)) {
    return <Navigate to={expectedPath} replace />;
  }

  return <Outlet />;
};
