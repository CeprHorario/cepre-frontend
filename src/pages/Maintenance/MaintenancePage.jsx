import React, { useState } from "react";
import { FaChevronLeft, FaClock, FaShieldAlt, FaTools } from "react-icons/fa";
import ceprunsaLogo from "@/assets/logo-light.png";
import { Login } from "@/pages/Login/Login";

export const MaintenancePage = ({ message, endsAt }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const formattedEnd = endsAt
    ? new Intl.DateTimeFormat("es-PE", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(endsAt))
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4F4F4] px-4 py-8 text-slate-800 sm:px-6 md:py-12">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#78211E]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#D6B36A]/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(71,31,30,0.12)]">
          <div className="h-2 bg-[#78211E]" />

          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="relative flex flex-col justify-between overflow-hidden bg-[#FAF7F7] p-7 sm:p-10 lg:min-h-[610px]">
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full border-[36px] border-[#78211E]/5" />

              <div className="relative">
                <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <img
                    src={ceprunsaLogo}
                    alt="CEPRUNSA"
                    className="mx-auto h-12 w-auto max-w-full object-contain"
                  />
                </div>

                <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#78211E] text-white shadow-lg shadow-[#78211E]/20">
                  <FaTools size={27} aria-hidden="true" />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#78211E]">
                  Servicio temporalmente pausado
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                  Estamos mejorando el sistema
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                  Nuestro equipo se encuentra realizando tareas de mantenimiento
                  para brindarte una mejor experiencia.
                </p>
              </div>

              <div className="relative mt-10 flex items-start gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
                <FaShieldAlt className="mt-0.5 shrink-0 text-[#78211E]" aria-hidden="true" />
                <p>La información del sistema permanece protegida durante este proceso.</p>
              </div>
            </aside>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              {!showAdminLogin ? (
                <>
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#78211E]/8 px-4 py-2 text-sm font-semibold text-[#78211E]">
                    <span className="h-2 w-2 rounded-full bg-[#B88A35]" />
                    Mantenimiento en curso
                  </div>

                  <div className="mt-7 rounded-2xl border border-[#78211E]/10 bg-[#FCF8F8] p-5 sm:p-6">
                    <p className="text-sm font-semibold text-[#78211E]">
                      Información del mantenimiento
                    </p>
                    <p className="mt-2 leading-7 text-slate-700">
                      {message ||
                        "El acceso estará disponible nuevamente cuando concluyan las tareas programadas."}
                    </p>
                  </div>

                  {formattedEnd ? (
                    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D6B36A]/20 text-[#8A621D]">
                        <FaClock aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Finalización estimada
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">{formattedEnd}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-6 text-slate-500">
                      Vuelve a esta pestaña más adelante para comprobar si el servicio ya fue restablecido.
                    </p>
                  )}

                  <div className="mt-9 border-t border-slate-200 pt-7">
                    <p className="text-sm text-slate-500">
                      El acceso administrativo continúa disponible.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(true)}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#78211E] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#78211E]/15 transition hover:bg-[#641B19] focus:outline-none focus:ring-4 focus:ring-[#78211E]/20 sm:w-auto cursor-pointer"
                    >
                      Acceso para administradores
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#78211E] hover:text-[#641B19] cursor-pointer"
                  >
                    <FaChevronLeft size={12} aria-hidden="true" />
                    Volver al aviso
                  </button>
                  <div className="mt-2 [&>div]:h-auto [&>div]:p-0 [&>div>div]:shadow-none">
                    <Login embedded />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
