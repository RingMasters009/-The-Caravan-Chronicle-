// A centralized service for making HTTP requests to the backend API.

const API_URL = "http://localhost:5000/api";

/**
 * Helper function to handle API responses and errors consistently.
 * @param {Response} response - The raw response object from fetch.
 * @returns {Promise<any>} - The parsed JSON data on success, or a rejected promise on failure.
 */
const handleResponse = async (response) => {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }

  if (!response.ok) {
    // Extract error message from backend response, or use default status text
    const error = (data && data.message) || response.statusText;
    return Promise.reject(new Error(error));
  }
  return data;
};

/**
 * Creates the authorization header with the JWT token.
 * @returns {HeadersInit} - The headers object.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const buildQueryString = (params = {}) => {
  const cleaned = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : "";
};

export const apiService = {
  // --- AUTHENTICATION ---
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (fullName, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      // Assumes a POST /api/auth/register route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    return handleResponse(response);
  },

  // --- COMPLAINTS ---
  createComplaint: async (complaintData) => {
    const response = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData),
    });
    return handleResponse(response);
  },

  updateComplaintStatus: async (id, status, notes) => {
    const response = await fetch(`${API_URL}/complaints/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },

  assignComplaint: async (complaintId, staffId) => {
    const response = await fetch(
      `${API_URL}/complaints/${complaintId}/assign`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ staffId }),
      }
    );
    return handleResponse(response);
  },

  // --- USERS ---
  /**
   * Fetches a list of all users with the 'Staff' role.
   * Note: This requires a corresponding route on the backend (e.g., GET /api/users/staff).
   */
  getStaffMembers: async () => {
    const response = await fetch(`${API_URL}/users/staff`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getComplaints: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await fetch(`${API_URL}/complaints${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getComplaintStats: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await fetch(`${API_URL}/complaints/stats${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  exportComplaintsCsv: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await fetch(`${API_URL}/complaints/export/csv${query}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to export CSV");
    }

    const blob = await response.blob();
    return blob;
  },

  getPublicSummary: async () => {
    const response = await fetch(`${API_URL}/complaints/public/summary`);
    return handleResponse(response);
  },
};
