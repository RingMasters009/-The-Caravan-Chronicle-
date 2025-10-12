import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService.js";

// 1. Create the context object to hold shared state
const UserContext = createContext();

// 2. Create the Provider component that will wrap the application
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On initial app load, check for an existing session in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Login failed" };
    }
  };

  // --- REGISTER (updated to include role, city, profession) ---
  const register = async (userData) => {
    try {
      const data = await apiService.register(userData);
      // Registration now leads to OTP, so we don't log the user in here.
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // --- AUTH HELPERS ---
  const isAuthenticated = () => !!user;

  const isAuthorized = (requiredRole) => {
    if (!user) return false;
    if (user.role === "Admin") return true;
    return user.role === requiredRole;
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAuthorized,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

// 3. Custom hook for easy access
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
