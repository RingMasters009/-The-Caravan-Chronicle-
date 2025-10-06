import React from "react";
import { Routes, Route } from "react-router-dom";

// Import all your page components
import HomePage from "./pages/HomePage";
import ComplaintForm from "./pages/ComplaintForm";
import MunicipalDashboard from "./pages/MunicipalDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <div className="App">
      {/* The Routes component defines all your app's pages */}
      <Routes>
        {/* Route for the homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Route for the complaint submission form */}
        <Route path="/report" element={<ComplaintForm />} />

        {/* Route for the municipal dashboard (protected route logic would be added here later) */}
        <Route path="/dashboard" element={<MunicipalDashboard />} />

        {/* --- ADD THESE ROUTES --- */}
        {/* Route for the login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route for the registration page */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
} 

export default App;
