import api from "./axios.js";

export const aiApi = {
  analyzeComplaint: (payload) => api.post("/ai/analyze", payload)
};

export default aiApi;
