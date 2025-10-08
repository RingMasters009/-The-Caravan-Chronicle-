import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // You can send result.user info to your backend here if needed
      // For now, just redirect or set user context
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

// It's best practice to move these styles to your index.css file,
// but they are included here for a complete, single-file component.
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

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect based on user role after successful login
        const userRole = JSON.parse(localStorage.getItem("user"))?.role;
        if (userRole === "Admin" || userRole === "Staff") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch (err) {
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
                Welcome Back
              </h1>
              <p className="text-gray-400 mt-2">
                Log in to the Caravan Chronicle.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ringmaster@circus.com"
                  required
                  className="form-input w-full p-3 rounded-lg text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input w-full p-3 rounded-lg text-base"
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
                  {loading ? "Logging In..." : "Login"}
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-slate-900 font-bold py-3 px-6 text-lg rounded-xl border border-slate-300 flex items-center justify-center gap-2 hover:bg-slate-100"
                  disabled={loading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-6 w-6" />
                  Sign in with Google
                </button>
              </div>
            </form>
            <p className="text-center text-sm text-gray-400 mt-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-gold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
