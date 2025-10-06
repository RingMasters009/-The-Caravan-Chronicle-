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
        // Parse the stored user data and restore the session
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.clear(); // Clear corrupted data if parsing fails
      }
    }
    setLoading(false); // Finished the initial check
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      // Store token and user details for session persistence
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user object as a string
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.toString() || "Login failed" };
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Clear session from storage and state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login"); // Redirect to login page after logout
  };

  // Helper function to check if a user is logged in
  const isAuthenticated = () => {
    return !!user;
  };

  // Helper function to check if a user has the required role (e.g., 'Admin', 'Staff')
  const isAuthorized = (requiredRole) => {
    if (!user) return false;
    // Admins are authorized for everything
    if (user.role === "Admin") return true;
    return user.role === requiredRole;
  };

  // The value object contains all the state and functions we want to share with child components
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAuthorized,
  };

  // Render the provider, passing the `value` to all children.
  // The `!loading && children` part prevents rendering the app until the initial user check is complete.
  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

// 3. Create a custom hook for easy and clean access to the context
export const useUser = () => {
  const context = useContext(UserContext);
  // This error check ensures the hook is used within a component wrapped by UserProvider
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
