import api from "./axios.js";

export const complaintApi = {
  createComplaint: (payload) => api.post("/complaints", payload),
  getComplaints: (params) => api.get("/complaints", { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateComplaint: (id, payload) => api.patch(`/complaints/${id}`, payload),
  updateComplaintStatus: (id, payload) => api.put(`/complaints/${id}`, payload),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  searchByLocation: (location, params = {}) => api.get("/complaints/search", { params: { ...params, location } }),
  getStats: () => api.get("/complaints/stats/summary"),
  analyzeAndSaveComplaint: (id) => api.post(`/complaints/${id}/analyze`)
};

export default complaintApi;
