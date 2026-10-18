import { useState } from "react";
import { toast } from "react-toastify";
import { apiErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/ui/Overlay";

interface Options<T> {
  singular: string;
  plural: string;
  /** Complemento del título: «a Juan» → «¿Eliminar a Juan?» */
  describe: (item: T) => string;
  idOf: (item: T) => string;
  /** Una sola llamada al endpoint en bloque del backend, también para un solo elemento */
  remove: (ids: string[]) => Promise<{ deactivated: number }>;
  pending?: boolean;
  /** Consecuencia propia del rol, antes de la aclaración común; `many` para el plural */
  consequence: (many: boolean) => string;
  onDone?: () => void;
}

/**
 * Eliminación de personas, igual en todos los roles (docs/ROLES.md). En el backend es lógica:
 * marca el usuario como inactivo y conserva su registro.
 */
export function useRemoval<T>({ singular, plural, describe, idOf, remove, pending, consequence, onDone }: Options<T>) {
  const [items, setItems] = useState<T[]>([]);

  const confirm = async () => {
    try {
      const { deactivated } = await remove(items.map(idOf));
      toast.success(deactivated === 1 ? `${capitalize(singular)} eliminado` : `${deactivated} ${plural} eliminados`);
      setItems([]);
      onDone?.();
    } catch (error) {
      // El backend no elimina ninguno si alguno falla, así que la selección se mantiene para reintentar
      toast.error(apiErrorMessage(error, items.length > 1 ? `No se pudieron eliminar los ${plural}` : `No se pudo eliminar el ${singular}`));
    }
  };

  const dialog = (
    <ConfirmDialog
      open={items.length > 0}
      title={items.length > 1 ? `¿Eliminar ${items.length} ${plural}?` : `¿Eliminar ${items[0] ? describe(items[0]) : ""}?`}
      message={`${consequence(items.length > 1)} ${items.length > 1 ? "Sus registros se conservan" : "Su registro se conserva"} en el sistema como inactivo${items.length > 1 ? "s" : ""}.`}
      confirmText="Eliminar"
      loading={pending}
      onConfirm={confirm}
      onCancel={() => setItems([])}
    />
  );

  return { request: setItems, dialog };
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
