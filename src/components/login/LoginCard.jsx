import React, { useState } from "react";
import { FaLock } from "react-icons/fa";
import { GoogleButton } from "./GoogleButton";
import escudo from "@/assets/LOGO_UNSA.png";
import logo from "@/assets/logo-light.png";

export const LoginCard = ({ onGoogleLogin, isLoading, embedded = false }) => {
  return (
    <section
      className={`relative w-full max-w-md overflow-hidden rounded-2xl transition-all duration-300 animate-fadeIn ${
        embedded
          ? "bg-transparent px-1 py-5"
          : "border border-slate-200 bg-white/95 p-7 shadow-[0_22px_60px_rgba(71,31,30,0.18)] backdrop-blur-sm sm:p-8"
      }`}
    >
      {!embedded && (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#78211E]" />
      )}

      <div className="flex flex-col items-center">
        <div className="flex w-full items-center justify-center gap-5 rounded-2xl border border-slate-200 bg-[#FAF7F7] px-5 py-4">
          <Escudo />
          <div className="h-10 w-px bg-slate-300" aria-hidden="true" />
          <Logo />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#78211E]/8 px-3 py-1.5 text-xs font-semibold text-[#78211E]">
          <FaLock size={10} aria-hidden="true" />
          Acceso institucional seguro
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-600">
          Ingresa al sistema de horarios con tu cuenta institucional de
          CEPRUNSA.
        </p>
      </div>

      <div className="mt-7">
        <GoogleButton onClick={onGoogleLogin} isLoading={isLoading} />
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Utiliza el correo institucional autorizado para tu perfil.
        </p>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4 text-center">
        <p className="text-xs text-slate-400">
          Universidad Nacional de San Agustín de Arequipa
        </p>
      </div>
    </section>
  );
};

export const Escudo = () => (
  <div className="flex h-12 shrink-0 items-center justify-center">
    <OptimizedImage
      src={escudo}
      alt="Escudo de la Universidad Nacional de San Agustín"
      className="h-12 object-contain"
    />
  </div>
);

export const Logo = () => (
  <div className="flex h-12 min-w-0 max-w-52 items-center justify-center">
    <OptimizedImage
      src={logo}
      alt="CEPRUNSA"
      className="h-12 max-w-full object-contain"
    />
  </div>
);

const OptimizedImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded bg-slate-200" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};
