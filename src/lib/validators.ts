export const isDni = (value: string) => /^\d{8}$/.test(value);

export const isPeruMobile = (value: string) => /^9\d{8}$/.test(value);

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Correo con el que se inicia sesión: cualquier cuenta de Google, institucional o no */
export const isLoginEmail = (value: string) => isEmail(value);

export const LOGIN_EMAIL_LABEL = "Correo de acceso";
export const LOGIN_EMAIL_HINT = "Cuenta de Google con la que inicia sesión (institucional o personal).";

export const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export const onlyLetters = (value: string) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");

export const splitPhones = (value: string) =>
  value
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean);

export type LinkState = "ok" | "missing" | "invalid";

export function linkState(url: string | null | undefined, host: "meet.google.com" | "classroom.google.com"): LinkState {
  if (!url?.trim()) return "missing";
  try {
    const parsed = new URL(url);
    return parsed.protocol.startsWith("http") && parsed.hostname === host ? "ok" : "invalid";
  } catch {
    return "invalid";
  }
}
