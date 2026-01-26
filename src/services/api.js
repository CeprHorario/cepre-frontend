import axios from "axios";

let token = localStorage.getItem("token");

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BACK_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});

// Interceptor para verificar si el token es null antes de cada petición
api.interceptors.request.use(
  (config) => {
    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores 401 (token expirado||sin autorización)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expirado. Redirigiendo al login...");
      localStorage.removeItem("token"); // Eliminar token
      token = null;
      window.location.href = "/"; // Redirigir al login
    }
    return Promise.reject(error);
  },
);

/**
 * Función genérica para manejar peticiones HTTP.
 * @param {"get" | "post" | "put" | "delete"} method - Método HTTP de la petición.
 * @param {string} endpoint - Endpoint de la API.
 * @param {Object} [data={}] - Datos a enviar en la petición.
 * @param {boolean} [isList=false] - Indica si la respuesta es una lista y debe ordenarse.
 * @returns {Promise<any | null>}
 */

export async function request(
  method,
  endpoint,
  data = {},
  isList = false,
  isFormData = false,
) {
  try {
    const config = {};

    // Solo agregamos el content-type si es FormData
    if (isFormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    }

    const response =
      method === "get" || method === "delete"
        ? await api[method](endpoint, config)
        : await api[method](endpoint, data, config);

    let result = response.data;

    if (isList && Array.isArray(result)) {
      result.sort((a, b) => {
        const isNumberA = !isNaN(a.id);
        const isNumberB = !isNaN(b.id);
        return isNumberA && isNumberB
          ? Number(a.id) - Number(b.id)
          : a.id.localeCompare(b.id);
      });
    }

    return result;
  } catch (error) {
    console.error("Error en la petición", {
      method,
      endpoint,
      data,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
}

export default api;
