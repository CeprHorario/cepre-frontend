import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonNegative } from "@/components/ui/ButtonNegative";

export const ConfirmModal = ({
  open,
  title = "Confirmar accion",
  message = "Esta accion no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) onCancel?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 text-left shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2 id="confirm-modal-title" className="text-xl font-bold text-[#78211E]">
          {title}
        </h2>
        <p className="mt-3 text-sm text-gray-700">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <ButtonNegative onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </ButtonNegative>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
