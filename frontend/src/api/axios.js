import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartComplaintToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("smartComplaintToken");
      localStorage.removeItem("smartComplaintUser");
      window.dispatchEvent(new Event("smart-complaints:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;
