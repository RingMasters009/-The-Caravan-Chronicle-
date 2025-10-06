import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService";

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location_x: null,
    location_y: null,
    image_url: "", // In a real app, this would handle file uploads
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // In a real application, you'd fetch these categories from your database
  useEffect(() => {
    // Simulating fetching categories
    const fetchedCategories = [
      { _id: "635f8d5e1c9d440000a1b1c1", name: "Infrastructure Damage" },
      { _id: "635f8d5e1c9d440000a1b1c2", name: "Waste Management" },
      { _id: "635f8d5e1c9d440000a1b1c3", name: "Electrical Fault" },
      { _id: "635f8d5e1c9d440000a1b1c4", name: "Safety Hazard" },
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
    // This is a simulation. It gets the click coordinates relative to the map image container.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setFormData((prev) => ({ ...prev, location_x: x, location_y: y }));
    alert(`Location Pinned at: (x: ${x}, y: ${y})`);
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
      setError("Please fill out all fields and select a location on the map.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.createComplaint(formData);
      setSuccess(response.message || "Complaint submitted successfully!");
      // Reset form or navigate away
      setTimeout(() => navigate("/"), 2000); // Redirect to home after 2 seconds
    } catch (err) {
      setError(
        err.toString() || "Failed to submit complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-4 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl w-full">
          <div className="text-center mb-10">
            <h1
              className="text-4xl md:text-5xl font-extrabold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Chronicle a New Issue
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              Your report helps us maintain the magic. Please be as detailed as
              possible.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Left Column: Interactive Map */}
              <div className="w-full">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
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
                    className="object-cover rounded-2xl h-full w-full opacity-70"
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

              {/* Right Column: Form Fields */}
              <div className="w-full space-y-6">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
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
                    placeholder="e.g., Flickering Lights at the Main Stage"
                    className="form-input w-full p-3 rounded-lg"
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
                    className="form-input w-full p-3 rounded-lg appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
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
                    className="form-input w-full p-3 rounded-lg"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary text-white font-bold py-4 px-10 text-lg rounded-xl mt-4 disabled:bg-gray-500"
                  >
                    {loading ? "Submitting..." : "Submit to the Ringmaster"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && (
                  <p className="text-green-500 text-center">{success}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
