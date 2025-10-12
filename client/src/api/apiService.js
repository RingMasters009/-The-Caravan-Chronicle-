// client/src/api/apiService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Helper: strip empty query params
 */
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

export const apiService = {
  // ===========================
  // AUTH
  // ===========================
  register: async (userData) => {
    const { fullName, email, password, role, city, profession, adminCode } = userData;
    const res = await api.post("/auth/register", {
      fullName,
      email,
      password,
      role,
      city,
      profession,
      adminCode,
    });
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  verifyEmail: async (data) => {
    const res = await api.post("/auth/verify-email", data);
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  // ===========================
  // COMPLAINTS / ADMIN
  // ===========================
  // Fetch complaints — returns the raw payload the server sends.
  // Caller (UI) should normalize if needed.
  getComplaints: async (params = {}) => {
    const res = await api.get("/complaints", { params: cleanParams(params) });
    return res.data;
  },

  // Fetch single complaint
  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  // Create complaint — builds FormData automatically if an image is present
  createComplaint: async (formDataObj, imageFile) => {
    // If already FormData, send it through
    const fd = new FormData();
    if (formDataObj && typeof formDataObj === "object") {
      Object.entries(formDataObj).forEach(([k, v]) => {
        if (k === "location" && typeof v === "object") {
          fd.append(k, JSON.stringify(v));
        } else if (v !== undefined && v !== null) {
          fd.append(k, v);
        }
      });
    }
    if (imageFile) fd.append("image", imageFile);
    const res = await api.post("/complaints", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Update status (patch)
  updateComplaintStatus: async (id, data) => {
    const res = await api.patch(`/complaints/${id}/status`, data);
    return res.data;
  },

  // Assign complaint to staff (admin)
  assignComplaint: async (id, staffId) => {
    const res = await api.patch(`/complaints/${id}/assign`, { staffId });
    return res.data;
  },

  // Stats for admin (returns whatever server responds)
  getComplaintStats: async (params = {}) => {
    const res = await api.get("/complaints/stats", { params: cleanParams(params) });
    return res.data;
  },

  // Export CSV (returns Blob)
  exportComplaintsCsv: async (params = {}) => {
    const res = await api.get("/complaints/export", {
      params: cleanParams(params),
      responseType: "blob",
    });
    return res.data;
  },

  // ===========================
  // STAFF
  // ===========================
  // Get staff members list
  getStaffMembers: async (params = {}) => {
    const res = await api.get("/staff", { params: cleanParams(params) });
    return res.data;
  },

  // ===========================
  // NOTIFICATIONS
  // ===========================
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationsAsRead: async () => {
    const res = await api.patch('/notifications/read');
    return res.data;
  },

  // ===========================
  // TRANSPARENCY / PUBLIC
  // ===========================
  getPublicSummary: async () => {
    const res = await api.get("/public/summary");
    return res.data;
  },
};
