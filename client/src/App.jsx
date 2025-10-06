import React from "react";
import { Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "./pages/HomePage.jsx";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import MunicipalDashboard from "./pages/MunicipalDashboard.jsx";
// Import other pages as you create them, e.g., LoginPage
// import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="App">
      {/* The Routes component is where you define all your app's pages */}
      <Routes>
        {/* Route for the homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Route for the complaint submission form */}
        <Route path="/report" element={<ComplaintForm />} />

        {/* Route for the municipal dashboard */}
        <Route path="/dashboard" element={<MunicipalDashboard />} />

        {/* A placeholder for your login page route */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;
