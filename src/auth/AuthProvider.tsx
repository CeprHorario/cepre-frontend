import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MAINTENANCE_EVENT, tokenStore } from "@/api/client";
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
  const [hasToken, setHasToken] = useState(Boolean(tokenStore.get()));
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const me = useMe();
  const status = useSystemStatus();

  // El backend responde en una ventana emergente con postMessage({ token } | { error })
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_API_BACK_URL) return;
      const data = event.data as { token?: string; error?: string };
      setLoggingIn(false);
      if (data?.token) {
        tokenStore.set(data.token);
        setHasToken(true);
        setLoginError(null);
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
    tokenStore.clear();
    setHasToken(false);
    client.clear();
    window.location.href = "/";
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: hasToken ? (me.data ?? null) : null,
      loading: hasToken && me.isLoading,
      status: status.data,
      loginWithGoogle,
      loggingIn,
      loginError,
      logout,
    }),
    [hasToken, me.data, me.isLoading, status.data, loginWithGoogle, loggingIn, loginError, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
