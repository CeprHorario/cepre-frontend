import { FiLock } from "react-icons/fi";
import background from "@/assets/cepr-background.jpg";
import logoWhite from "@/assets/logo-dark.png";
import logo from "@/assets/logo-light.png";
import unsaLogo from "@/assets/LOGO_UNSA.png";
import { useAuth } from "@/auth/AuthProvider";
import { Alert } from "@/components/ui/EmptyState";
import { GoogleButton } from "./GoogleButton";
import { EmailLink } from "@/components/ui/Contact";

export function LoginPage({ unknownRole = false, embedded = false }: { unknownRole?: boolean; embedded?: boolean }) {
  const { loginWithGoogle, loggingIn, loginError, status } = useAuth();

  const card = (
    <section className="w-full max-w-[440px] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_80px_rgba(10,12,30,0.45)]">
      <div className="h-1.5" style={{ background: "linear-gradient(90deg,#1C2140 0 60%,#661124 60% 100%)" }} />
      <div className="flex flex-col gap-6 px-7 pb-7 pt-8 sm:px-9">
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-line bg-surface-2 p-4">
          <img src={unsaLogo} alt="UNSA" className="h-10 w-auto sm:h-11" />
          <span className="h-10 w-px bg-field" aria-hidden="true" />
          <img src={logo} alt="CEPRUNSA" className="h-8 w-auto sm:h-9" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-guinda-50 px-3 text-xs font-bold text-guinda-700">
            <FiLock className="size-3" aria-hidden="true" />
            Acceso institucional
          </span>
          <h2 className="font-display text-[26px] font-extrabold text-marino-900">Iniciar sesión</h2>
          <p className="text-sm leading-6 text-ink-500">Ingresa con la cuenta de Google que la administración registró para tu perfil.</p>
        </div>
        {(loginError || unknownRole) && (
          <Alert tone="danger" title="No pudimos iniciar tu sesión">
            {unknownRole ? "Tu cuenta no tiene un rol válido en el proceso actual." : loginError}
          </Alert>
        )}
        <GoogleButton onClick={loginWithGoogle} loading={loggingIn} />
        <details className="border-t border-line-soft pt-4 text-[13px] text-ink-500">
          <summary className="cursor-pointer font-semibold text-marino-900">¿No puedes ingresar?</summary>
          <p className="mt-2 leading-6">
            Tu correo debe estar registrado por la coordinación académica. Si el problema continúa, escribe a{" "}
            <EmailLink email="ceprunsa@unsa.edu.pe" />
            .
          </p>
        </details>
      </div>
      <div className="border-t border-line bg-surface-2 px-9 py-3.5 text-center text-xs text-ink-500">
        Universidad Nacional de San Agustín de Arequipa
      </div>
    </section>
  );

  if (embedded) return card;

  return (
    <div className="relative min-h-screen bg-marino-900 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(115deg,rgba(28,33,64,0.92) 0%,rgba(28,33,64,0.78) 45%,rgba(102,17,36,0.82) 100%)" }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-[1360px] flex-wrap items-center justify-center gap-10 px-5 py-10 sm:px-10 lg:justify-between">
        <section className="hidden max-w-xl flex-col gap-7 text-white lg:flex">
          <img src={logoWhite} alt="CEPRUNSA, calidad en la preparación académica" className="h-auto w-[340px]" />
          <span className="h-1 w-[72px] rounded bg-oro-500" aria-hidden="true" />
          <h1 className="font-display text-[46px] font-extrabold leading-[1.12]">Sistema de horarios académicos</h1>
          <p className="max-w-[520px] text-[17px] leading-7 text-white/85">
            Horarios, salones, docentes y monitores de cada proceso de admisión, con tu cuenta institucional.
          </p>
          {status?.maintenance === false && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-semibold">
              <span className="size-2 rounded-full bg-[#7BD3A4]" aria-hidden="true" />
              Sistema disponible
            </span>
          )}
        </section>
        <div className="flex w-full max-w-[440px] flex-col items-center gap-6">
          <img src={logoWhite} alt="CEPRUNSA" className="h-auto w-56 lg:hidden" />
          {card}
        </div>
      </div>
    </div>
  );
}
