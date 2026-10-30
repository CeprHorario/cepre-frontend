import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Overlay";
import { usePartsSessionProtection } from "./usePartsSessionProtection";

export function PartsSessionProtection() {
  const { confirmExit, keepDrafts, discardAndLogout } = usePartsSessionProtection();
  return <Dialog open={confirmExit} title="Hay pendientes de partes" onClose={keepDrafts} footer={<>
    <Button variant="secondary" onClick={keepDrafts}>Conservar borradores</Button>
    <Button variant="danger-solid" onClick={discardAndLogout}>Descartar pendientes y cerrar sesión</Button>
  </>}>
    <p>Hay cambios, revisiones, operaciones o subidas sin asociar conservados en memoria. Puedes volver y resolverlos, o descartarlos explícitamente antes de cerrar sesión. Esto no borra archivos del servidor.</p>
  </Dialog>;
}
