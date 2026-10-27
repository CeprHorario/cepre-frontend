import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MAINTENANCE_EVENT } from "@/api/client";
import { toast } from 'react-toastify';
import { AuthApi } from "@/api/services";
import { keys, useMe, useSystemStatus } from "@/api/queries";
import type { CurrentUser, Role, SystemStatus } from "@/api/types";

export const ROLE_HOME: Record<Role, string> = {
  administrador: "/admin",
  profesor: "/docente",
  docente: "/docente",
  monitor: "/monitor",
  supervisor: "/supervisor",
  coordinador: "/coordinador",
};

export const ROLE_LABEL: Record<Role, string> = {
  administrador: "Administrador",
  profesor: "Docente",
  docente: "Docente",
  monitor: "Monitor",
  supervisor: "Supervisor",
  coordinador: "Coordinador",
};

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  status: SystemStatus | undefined;
  loginWithGoogle: () => void;
  loggingIn: boolean;
  loginError: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const loginPopup = useRef<Window | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const me = useMe();
  const status = useSystemStatus();

  // El popup confirma la cookie de sesión sin entregar credenciales al JavaScript.
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== new URL(import.meta.env.VITE_API_BACK_URL).origin || !loginPopup.current || event.source !== loginPopup.current) return;
      const data = event.data as { authenticated?: boolean; error?: string };
      setLoggingIn(false);
      if (data?.authenticated === true) {
        setLoginError(null);
        client.removeQueries({ predicate: query => query.queryKey[0] !== 'me' && query.queryKey[0] !== 'system' });
        client.invalidateQueries({ queryKey: keys.me });
      } else if (data?.error) {
        setLoginError("Tu cuenta no está registrada en el sistema o no tiene un rol asignado.");
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [client]);

  useEffect(() => {
    const onMaintenance = (event: Event) => {
      const detail = (event as CustomEvent<Partial<SystemStatus>>).detail;
      client.setQueryData(keys.status, { maintenance: true, message: detail?.message ?? "", endsAt: detail?.endsAt ?? null });
    };
    window.addEventListener(MAINTENANCE_EVENT, onMaintenance);
    return () => window.removeEventListener(MAINTENANCE_EVENT, onMaintenance);
  }, [client]);

  const loginWithGoogle = useCallback(() => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    setLoginError(null);
    setLoggingIn(true);
    const popup = window.open(AuthApi.googleUrl(), "ceprunsa-login", `width=${width},height=${height},left=${left},top=${top}`);
    loginPopup.current = popup;
    if (!popup) {
      setLoggingIn(false);
      setLoginError("El navegador bloqueó la ventana de inicio de sesión. Permite las ventanas emergentes e inténtalo de nuevo.");
      return;
    }
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        setLoggingIn(false);
      }
    }, 800);
  }, []);

  const logout = useCallback(() => {
    void AuthApi.logout().then(() => { client.clear(); window.location.href = '/'; })
      .catch(() => toast.error('No se pudo cerrar la sesión. Intenta nuevamente.'));
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me.isError ? null : (me.data ?? null),
      loading: me.isLoading,
      status: status.data,
      loginWithGoogle,
      loggingIn,
      loginError,
      logout,
    }),
    [me.data, me.isLoading, me.isError, status.data, loginWithGoogle, loggingIn, loginError, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
