import { useState } from "react";
import { FiChevronLeft, FiClock, FiShield, FiTool } from "react-icons/fi";
import logo from "@/assets/logo-light.png";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { LoginPage } from "./LoginPage";

export function MaintenancePage({ message, endsAt }: { message?: string; endsAt?: string | null }) {
  const [adminLogin, setAdminLogin] = useState(false);

  return (
    <main className="min-h-screen bg-app px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="w-full overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_70px_rgba(28,33,64,0.12)]">
          <div className="app-header h-2" />
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="flex flex-col justify-between gap-10 bg-marino-900 p-8 text-white sm:p-10">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-center rounded-xl bg-white p-3">
                  <img src={logo} alt="CEPRUNSA" className="h-11 w-auto" />
                </div>
                <span className="flex size-16 items-center justify-center rounded-2xl bg-guinda-700 text-3xl shadow-[inset_0_0_0_1px_rgba(210,174,109,0.5)]">
                  <FiTool aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-3">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-oro-500">Servicio temporalmente pausado</span>
                  <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Estamos mejorando el sistema</h1>
                </div>
              </div>
              <p className="flex items-start gap-3 border-t border-white/10 pt-6 text-sm text-white/80">
                <FiShield className="mt-0.5 shrink-0 text-oro-500" aria-hidden="true" />
                La información del sistema permanece protegida durante este proceso.
              </p>
            </aside>
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 lg:p-14">
              {adminLogin ? (
                <div className="flex flex-col items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setAdminLogin(false)}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-guinda-700"
                  >
                    <FiChevronLeft aria-hidden="true" />
                    Volver al aviso
                  </button>
                  <LoginPage embedded />
                </div>
              ) : (
                <>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-guinda-50 px-4 py-2 text-sm font-semibold text-guinda-700">
                    <span className="size-2 rounded-full bg-oro-500" aria-hidden="true" />
                    Mantenimiento en curso
                  </span>
                  <div className="rounded-2xl border border-guinda-100 bg-[#FCF7F8] p-5">
                    <p className="text-sm font-semibold text-guinda-700">Información del mantenimiento</p>
                    <p className="mt-2 leading-7 text-ink-700">
                      {message || "El acceso estará disponible nuevamente cuando concluyan las tareas programadas."}
                    </p>
                  </div>
                  {endsAt ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-oro-100 text-oro-700">
                        <FiClock aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Finalización estimada</p>
                        <p className="mt-1 font-semibold text-ink-900">{formatDateTime(endsAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">Vuelve más tarde para comprobar si el servicio ya fue restablecido.</p>
                  )}
                  <div className="border-t border-line pt-6">
                    <p className="text-sm text-ink-500">El acceso administrativo continúa disponible.</p>
                    <Button className="mt-4" onClick={() => setAdminLogin(true)}>
                      Acceso para administradores
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
