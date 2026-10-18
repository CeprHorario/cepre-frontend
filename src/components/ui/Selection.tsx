import { useState, type ReactNode } from "react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { Button } from "./Button";

/**
 * Selección múltiple que se activa a pedido (docs/ROLES.md): la tabla no muestra casillas
 * hasta que el usuario pulsa «Seleccionar».
 */
export function useSelectionMode<T>(rows: T[], rowKey: (row: T) => string) {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const stop = () => {
    setActive(false);
    setSelected(new Set());
  };

  return {
    active,
    start: () => setActive(true),
    stop,
    selectedRows: rows.filter((row) => selected.has(rowKey(row))),
    /** Para la prop `selection` de DataTable: undefined fuera del modo selección */
    tableSelection: active ? { selected, onChange: setSelected } : undefined,
  };
}

export function SelectionToggle({ active, onStart, onStop }: { active: boolean; onStart: () => void; onStop: () => void }) {
  return active ? (
    <Button variant="ghost" icon={<FiX />} onClick={onStop}>
      Cancelar selección
    </Button>
  ) : (
    <Button variant="secondary" icon={<FiCheckSquare />} onClick={onStart}>
      Seleccionar
    </Button>
  );
}

/** Barra de acciones en bloque; visible mientras el modo selección está activo */
export function SelectionBar({ count, singular, plural, children }: { count: number; singular: string; plural: string; children: ReactNode }) {
  return (
    <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-marino-900 px-4 py-2.5 text-[13px] text-white">
      <strong>{count ? `${count} ${count === 1 ? `${singular} seleccionado` : `${plural} seleccionados`}` : `Marca los ${plural} que quieras gestionar`}</strong>
      {count > 0 && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
