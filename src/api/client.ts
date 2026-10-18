import axios, { AxiosError } from "axios";

export const MAINTENANCE_EVENT = "ceprunsa:maintenance-mode";
const TOKEN_KEY = "token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BACK_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: string; message?: string; endsAt?: string | null }>) => {
    const status = error.response?.status;
    if (status === 503 && error.response?.data?.code === "MAINTENANCE_MODE") {
      window.dispatchEvent(new CustomEvent(MAINTENANCE_EVENT, { detail: error.response.data }));
    }
    // Solo un token inválido cierra la sesión; un 401 por falta de permiso no debe expulsar al usuario
    if (status === 401 && tokenStore.get() && error.config?.url?.includes("/auth/user-info")) {
      tokenStore.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string): Promise<T> {
  return (await api.get<T>(url)).data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  return (await api.post<T>(url, body)).data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  return (await api.put<T>(url, body)).data;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  return (await api.patch<T>(url, body)).data;
}

export async function del<T>(url: string): Promise<T> {
  return (await api.delete<T>(url)).data;
}

export async function upload<T>(url: string, file: File): Promise<T> {
  const form = new FormData();
  form.append("archivo", file);
  return (await api.post<T>(url, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
}

/** Construye un query string ignorando valores vacíos */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Mensaje legible de un error de la API (NestJS devuelve string o string[]) */
export function apiErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join(". ");
    if (message) return message;
    if (error.response?.status === 409) return "El registro ya existe o está en uso";
    if (error.response?.status === 404) return "No se encontró el registro";
    if (!error.response) return "No se pudo conectar con el servidor";
  }
  return fallback;
}
