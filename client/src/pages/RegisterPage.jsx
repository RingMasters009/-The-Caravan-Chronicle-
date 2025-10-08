import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const GlobalStyles = () => (
  <style>{`
      body {
        font-family: 'Lato', sans-serif;
        background-image: url('https://images.unsplash.com/photo-1533109721025-d1ae7de8c242?q=80&w=1974&auto-format&fit=crop');
        background-size: cover; background-position: center; background-attachment: fixed;
      }
      body::before {
        content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(10, 20, 35, 0.75); z-index: -1;
      }
      h1 { font-family: 'Playfair Display', serif; }
      .glass-card {
        background: rgba(15, 30, 45, 0.6); backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .btn-primary-gradient {
        background-image: linear-gradient(to right, #0891b2, #0d9488);
        box-shadow: 0 4px 15px 0 rgba(8, 145, 178, 0.3);
      }
      .btn-primary-gradient:hover {
        transform: translateY(-2px); box-shadow: 0 6px 20px 0 rgba(8, 145, 178, 0.45);
      }
      .text-gold { color: #f59e0b; }
      .form-input {
        background: rgba(10, 25, 40, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .form-input:focus {
        outline: none; border-color: #0891b2;
        box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3);
      }
    `}</style>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await register(
        formData.fullName,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex items-center justify-center p-4 text-gray-200">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-white">
                Join the Circus
              </h1>
              <p className="text-gray-400 mt-2">
                Create your account to get started.
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  onChange={handleChange}
                  required
                  className="form-input w-full p-3 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  required
                  className="form-input w-full p-3 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  required
                  className="form-input w-full p-3 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                  required
                  className="form-input w-full p-3 rounded-lg"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary-gradient font-bold py-3 px-6 text-lg rounded-xl mt-4 transition-all disabled:bg-gray-500"
                >
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </div>
            </form>
            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-gold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
