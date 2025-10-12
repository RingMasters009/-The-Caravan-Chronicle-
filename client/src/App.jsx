import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { SocketProvider } from './context/SocketContext';

import HomePage from "./pages/HomePage";
import ComplaintForm from "./pages/ComplaintForm";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CitizenDashboard from "./pages/dashboard/CitizenDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TransparencyPortal from "./pages/TransparencyPortal";
import Layout from "./components/layout/Layout";

const GlobalStyles = () => (
  <style>{`
    body {
      font-family: 'Lato', sans-serif;
      background-image: url('https://images.unsplash.com/photo-1533109721025-d1ae7de8c242?q=80&w=1974&auto-format&fit=crop');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }
    body::before {
      content: '';
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 20, 35, 0.75);
      z-index: -1;
    }
    h1 { font-family: 'Playfair Display', serif; }
    .glass-card {
      background: rgba(15, 30, 45, 0.6);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-primary-gradient {
      background-image: linear-gradient(to right, #0891b2, #0d9488);
      box-shadow: 0 4px 15px 0 rgba(8, 145, 178, 0.3);
    }
    .btn-primary-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(8, 145, 178, 0.45);
    }
    .text-gold { color: #f59e0b; }
    .form-input {
      background: rgba(10, 25, 40, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .form-input:focus {
      outline: none;
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3);
    }
  `}</style>
);

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
    <SocketProvider>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="report" element={<ProtectedRoute roles={['User']}><ComplaintForm /></ProtectedRoute>} />
          <Route path="transparency" element={<TransparencyPortal />} />
          <Route path="dashboard/citizen" element={<ProtectedRoute roles={['User']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="dashboard/staff" element={<ProtectedRoute roles={['Staff', 'Admin']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="dashboard/admin" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
