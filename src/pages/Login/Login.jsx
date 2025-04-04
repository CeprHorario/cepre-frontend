import React, { useEffect } from "react";
import logo from "@/assets/Unsa_logo.png";
import escudo from "@/assets/escudo-unsa.jpeg";
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      `${import.meta.env.VITE_API_BACK_URL}/api/auth/google`,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };
  
  useEffect(() => {
    const receiveMessage = (event) => {
      if (event.origin !== import.meta.env.VITE_API_BACK_URL) return;
      if (event.data.error) {
        alert("An error occurred during login. Please try again. ");
        return;
      }
      if (event.data.token) {
        localStorage.setItem("token", event.data.token);
        navigate("/"); // Redirigir a la página 
      }
    };
    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [navigate]);

  return (
    <div className="h-screen p-5 flex flex-col items-left justify-center space-y-10">

      <div className="bg-white shadow-lg p-2 max-w-md  rounded-tl-[10px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[20px]">
        <img src={logo} alt="UNSA CEPRUNSA" className="h-20" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full text-center">

        {/* Texto de inicio de sesión */}
        <div className="mb-4 text-lg font-semibold">
          Identifíquese usando su cuenta en:
        </div>

        {/* Botón con imagen y texto */}
        <button
          className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition w-full"
          onClick={handleLogin}
        >
          <img src={escudo} alt="Escudo UNSA" className="h-6 w-6" />
          <span>Ingrese con su correo CEPRUNSA</span>
        </button>

        {/* Botón de aviso de cookies alineado a la derecha */}
        <div className="mt-4 flex justify-end">
          <a href="#" className="text-blue-500 hover:underline text-sm">Aviso de Cookies</a>
        </div>

      </div>

    </div>
  );
};
