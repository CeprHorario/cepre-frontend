import { FiCompass } from "react-icons/fi";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white">
        <EmptyState
          icon={<FiCompass />}
          title="No encontramos esta página"
          description="El enlace puede estar mal escrito o la página ya no existe."
          action={<ButtonLink to="/">Ir al inicio</ButtonLink>}
        />
      </div>
    </div>
  );
}
