/** Colores de área heredados de la versión anterior, como etiqueta legible */
const AREA_STYLE: Record<string, { dot: string; background: string; text: string }> = {
  Biomédicas: { dot: "#5E9E48", background: "#E5F1DF", text: "#2F5E22" },
  Ingenierías: { dot: "#4A7FD1", background: "#E3ECFB", text: "#1F4E8C" },
  Sociales: { dot: "#E08A3C", background: "#FCEBD9", text: "#8A4B0F" },
  Extraordinario: { dot: "#7668AF", background: "#ECE9F5", text: "#4B3F86" },
};

const FALLBACK = { dot: "#8C91B5", background: "#ECEEF6", text: "#2E3566" };

export function areaStyle(name: string | null | undefined) {
  return (name && AREA_STYLE[name]) || FALLBACK;
}
