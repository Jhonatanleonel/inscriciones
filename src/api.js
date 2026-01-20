import axios from "axios";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = axios.create({
  baseURL: "https://backent-4utv.onrender.com/",
  withCredentials: true, // 🔑 NECESARIO para CSRF
});
/*     https://backent-4utv.onrender.com/   
       
       http://127.0.0.1:8000/
       
*/
// 👉 Interceptor de REQUEST (NO response)
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error de API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
