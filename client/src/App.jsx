import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";

import HomePage from "./pages/HomePage";
import ComplaintForm from "./pages/ComplaintForm";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CitizenDashboard from "./pages/dashboard/CitizenDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TransparencyPortal from "./pages/TransparencyPortal";
import Layout from "./components/layout/Layout";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<ProtectedRoute roles={["User"]}><ComplaintForm /></ProtectedRoute>} />
        <Route path="transparency" element={<TransparencyPortal />} />

        <Route
          path="dashboard/citizen"
          element={
            <ProtectedRoute roles={["User"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/staff"
          element={
            <ProtectedRoute roles={["Staff", "Admin"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 

export default App; 
