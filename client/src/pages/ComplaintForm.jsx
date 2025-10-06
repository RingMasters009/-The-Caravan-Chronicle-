import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService.js";

// It's best practice to move these styles to your index.css file,
// but they are included here for a complete, single-file component.
const GlobalStyles = () => (
  <style>{`
    body {
      font-family: 'Lato', sans-serif;
      background-image: url('https://images.unsplash.com/photo-1533109721025-d1ae7de8c242?q=80&w=1974&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      overflow-x: hidden;
      position: relative;
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 20, 35, 0.75);
      z-index: -1;
    }

    h1, h2, h3 {
      font-family: 'Playfair Display', serif;
    }

    .glass-card {
      background: rgba(15, 30, 45, 0.6);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-primary-gradient {
      background-image: linear-gradient(to right, #0891b2, #0d9488);
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px 0 rgba(8, 145, 178, 0.3);
    }
    .btn-primary-gradient:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px 0 rgba(8, 145, 178, 0.45);
    }

    .text-gold {
      color: #f59e0b;
    }

    .header-shadow {
      text-shadow: 0px 3px 15px rgba(0, 0, 0, 0.5);
    }

    /* New Themed Form Input Styles */
    .form-input {
      background: rgba(10, 25, 40, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e5e7eb; /* Light gray text */
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .form-input:focus {
      outline: none;
      border-color: #0891b2; /* Teal focus border */
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3);
    }
    .form-input::placeholder {
      color: #6b7280; /* Gray placeholder text */
    }
    /* Style for the select dropdown arrow */
    select.form-input {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }
  `}</style>
);

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location_x: null,
    location_y: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd fetch these from GET /api/complaint-categories
    const fetchedCategories = [
      { _id: "cat1", name: "Infrastructure Damage" },
      { _id: "cat2", name: "Waste Management" },
      { _id: "cat3", name: "Electrical Fault" },
      { _id: "cat4", name: "Safety Hazard" },
      { _id: "cat5", name: "Plumbing & Water Supply" },
      { _id: "cat6", name: "Vendor & Stall Issue" },
      { _id: "cat7", name: "Noise Complaint" },
      { _id: "cat8", name: "Lost & Found" },
      { _id: "cat9", name: "Other" },
    ];
    setCategories(fetchedCategories);
    if (fetchedCategories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category_id: fetchedCategories[0]._id,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setFormData((prev) => ({ ...prev, location_x: x, location_y: y }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !formData.title ||
      !formData.description ||
      !formData.category_id ||
      formData.location_x === null
    ) {
      setError("Please fill all fields and pin a location on the map.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.createComplaint(formData);
      setSuccess(response.message || "Complaint submitted successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.toString() || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-4 text-gray-200">
        {/* Consistent Header */}
        <header className="w-full p-4 fixed top-0 z-50">
          <nav className="container mx-auto max-w-7xl glass-card rounded-2xl p-4 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl tracking-tight font-bold header-shadow"
            >
              Caravan Chronicle
            </Link>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link
                to="/#live-status"
                className="hover:text-gold transition-colors"
              >
                Live Status
              </Link>
              <Link to="/login" className="hover:text-gold transition-colors">
                Login
              </Link>
            </div>
          </nav>
        </header>

        <div className="w-full max-w-6xl mt-24">
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold header-shadow text-white">
                Chronicle a New Issue
              </h1>
              <p className="text-lg text-gray-300 mt-2">
                Your report helps us maintain the magic. Please be as detailed
                as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Left Column: Map */}
                <div className="w-full">
                  <h2 className="text-2xl font-bold mb-4">
                    1. Pinpoint the Location
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Click on the map to mark the exact spot of the problem.
                  </p>
                  <div
                    onClick={handleMapClick}
                    className="aspect-square bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-teal-400 transition-colors relative"
                  >
                    <img
                      src="https://i.pinimg.com/originals/e7/73/19/e773197593c76a404b905f88f25381a1.jpg"
                      alt="Map of the Circus of Wonders"
                      className="object-cover rounded-2xl h-full w-full opacity-60"
                    />
                    {formData.location_x && (
                      <div
                        className="absolute text-4xl"
                        style={{
                          left: `${formData.location_x}px`,
                          top: `${formData.location_y}px`,
                          transform: "translate(-50%, -100%)",
                        }}
                      >
                        📍
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Form */}
                <div className="w-full space-y-6">
                  <h2 className="text-2xl font-bold mb-4">
                    2. Provide the Details
                  </h2>
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-lg font-semibold mb-2"
                    >
                      Issue Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Flickering Lights at Main Stage"
                      className="form-input w-full p-3 rounded-lg text-base"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="category_id"
                      className="block text-lg font-semibold mb-2"
                    >
                      Category of Concern
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="form-input w-full p-3 rounded-lg appearance-none text-base"
                    >
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat._id}
                          className="bg-gray-800 text-white"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-lg font-semibold mb-2"
                    >
                      Describe the Spectacle
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Tell us the full story of what you witnessed..."
                      className="form-input w-full p-3 rounded-lg text-base"
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary-gradient font-bold py-4 px-10 text-lg rounded-xl mt-4 disabled:bg-gray-500 disabled:shadow-none"
                    >
                      {loading ? "Submitting..." : "Submit to the Ringmaster"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-400 text-center font-semibold">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-green-400 text-center font-semibold">
                      {success}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintForm;
