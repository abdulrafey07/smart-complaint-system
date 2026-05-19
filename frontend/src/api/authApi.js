import api from "./axios.js";

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me")
};

export default authApi;
