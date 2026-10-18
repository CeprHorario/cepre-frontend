import { toast } from "react-toastify";
import { formatPhone } from "./format";

/** Abre la redacción de Gmail en una pestaña nueva (las cuentas institucionales son de Google) */
export function gmailComposeUrl(to: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
}

/** Copia el celular al portapapeles y avisa con un toast */
export async function copyPhone(phone: string): Promise<void> {
  const text = phone.replace(/\D/g, "");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Respaldo para contextos sin Clipboard API (http no seguro, permisos denegados)
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) {
      toast.error("No se pudo copiar el número");
      return;
    }
  }
  toast.success(`Número ${formatPhone(text)} copiado`);
}
