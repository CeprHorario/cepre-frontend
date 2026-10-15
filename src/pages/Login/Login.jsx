import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginCard } from "@/components/login/LoginCard";

export const Login = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    setIsLoading(true);
    const authWindow = window.open(
      `${import.meta.env.VITE_API_BACK_URL}/api/auth/google`,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    const checkWindowClosed = setInterval(() => {
      if (authWindow && authWindow.closed) {
        clearInterval(checkWindowClosed);
        setIsLoading(false);
      }
    }, 1500); // Check every 1.5 seconds
  };

  useEffect(() => {
    const receiveMessage = (event) => {
      if (event.origin !== import.meta.env.VITE_API_BACK_URL) return;
      if (event.data.error) {
        alert("Ocurrió un error en el inicio de sesión.");
        setIsLoading(false);
        return;
      }
      if (event.data.token) {
        localStorage.setItem("token", event.data.token);
        navigate("/");
      }
    };
    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [navigate]);

  return (
    <div className={`${embedded ? "py-6" : "h-screen p-5"} flex flex-col items-center justify-center bg-opacity-90`}>
      <LoginCard
        onGoogleLogin={handleLogin}
        isLoading={isLoading}
        embedded={embedded}
      />
    </div>
  );
};
