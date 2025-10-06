// A centralized service for making HTTP requests to the backend API.

const API_URL = "http://localhost:5000/api";

/**
 * Helper function to handle API responses and errors consistently.
 * @param {Response} response - The raw response object from fetch.
 * @returns {Promise<any>} - The parsed JSON data on success, or a rejected promise on failure.
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Extract error message from backend response, or use default status text
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
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

  // --- COMPLAINTS ---
  getComplaints: async () => {
    const response = await fetch(`${API_URL}/complaints`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createComplaint: async (complaintData) => {
    const response = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData),
    });
    return handleResponse(response);
  },

  updateComplaintStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/complaints/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
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
};
