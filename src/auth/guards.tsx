import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/api/types";
import { LoadingScreen } from "@/components/ui/Spinner";
import { LoginPage } from "@/features/auth/LoginPage";
import { MaintenancePage } from "@/features/auth/MaintenancePage";
import { ROLE_HOME, useAuth } from "./AuthProvider";

/**
 * Raíz de la app: decide entre login, mantenimiento o el panel del rol.
 * Los administradores pueden entrar aunque el sistema esté en mantenimiento.
 */
export function SessionGate() {
  const { user, loading, status } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Verificando acceso…" />;

  const isAdmin = user?.role === "administrador";
  if (status?.maintenance && !isAdmin) {
    return <MaintenancePage message={status.message} endsAt={status.endsAt} />;
  }

  if (!user) return <LoginPage />;

  const home = ROLE_HOME[user.role];
  if (!home) return <LoginPage unknownRole />;
  if (location.pathname === "/" || !location.pathname.startsWith(home)) return <Navigate to={home} replace />;

  return <Outlet />;
}

/** Restringe una rama de rutas a ciertos roles */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
