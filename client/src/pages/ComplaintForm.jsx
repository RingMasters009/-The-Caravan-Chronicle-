import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService";
import MapPicker from "../MapPicker";

const professionOptions = [
  "Electrician",
  "Plumber",
  "Cleaner",
  "Mechanic",
  "Other",
];

// ✅ Problem types mapped to professions (matching your schema exactly)
const problemOptions = {
  Electrician: [
    "Electric Shortage",
    "Lighting",
    "Power Outage",
    "Faulty Wiring",
  ],
  Plumber: [
    "Water Leakage",
    "Clogged Drain",
    "Broken Pipe",
    "Water Supply Issue",
    "Sewage Issue",
  ],
  Cleaner: [
    "Garbage",
    "Street Cleaning",
    "Public Restroom Issue",
    "Waste Management",
    "Recycling Issue",
  ],
  Mechanic: [
    "Abandoned Vehicle",
    "Traffic Signal Issue",
    "Illegal Parking",
    "Road Damage",
    "Potholes",
    "Road Blockage",
  ],
  Other: [
    "Tree Damage",
    "Park Maintenance",
    "Graffiti",
    "Vandalism",
    "Noise Complaint",
    "Air Quality",
    "Animal Control",
    "Pest Control",
    "Fire Hazard",
    "Health Hazard",
    "Safety",
    "Other",
  ],
};

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const ComplaintForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    profession: "",
    type: "",
    priority: "MEDIUM",
    location: {
      address: "",
      city: "",
      coordinates: { type: "Point", coordinates: [] },
    },
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // handle nested location
    if (name === "address" || name === "city") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
      return;
    }

    // reset type when profession changes
    if (name === "profession") {
      setFormData((prev) => ({
        ...prev,
        profession: value,
        type: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapSelect = ({ lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { type: "Point", coordinates: [lng, lat] },
      },
    }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: { type: "Point", coordinates: [longitude, latitude] },
          },
        }));
      },
      () => setError("Unable to fetch your location.")
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { title, description, profession, type, location } = formData;

    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description.");
      return;
    }

    if (!profession) {
      setError("Please select your profession.");
      return;
    }

    if (!type) {
      setError("Please select the problem type.");
      return;
    }

    if (!location.coordinates.coordinates?.length) {
      setError("Please mark the issue location on the map.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        title: title.trim(),
        description: description.trim(),
      };

      await apiService.createComplaint(payload, image);
      navigate("/dashboard/citizen");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-100">
          Report a New Issue
        </h1>
        <p className="text-sm text-slate-400">
          Select your profession and describe the issue to help us assign the
          right staff.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6"
      >
        {/* Title */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 outline-none border border-slate-700 focus:border-teal-500"
            placeholder="Enter issue title"
            required
          />
        </div>

        {/* Profession */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">
            Profession
          </label>
          <select
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
            required
          >
            <option value="">Select Profession</option>
            {professionOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Problem Type */}
        {formData.profession && (
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">
              Problem Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
              required
            >
              <option value="">Select Problem</option>
              {problemOptions[formData.profession]?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 outline-none border border-slate-700 focus:border-teal-500"
            placeholder="Describe the issue in detail..."
            required
          ></textarea>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
          >
            {priorityOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Address and City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.location.address}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.location.city}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
              placeholder="Enter city"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">
            Attach Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-300"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-40 w-auto rounded-lg border border-slate-700 object-cover"
            />
          )}
        </div>

        {/* Map Picker */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-500">
            Pick location on map
          </label>
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-400"
            >
              📍 Use My Location
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            <MapPicker onSelect={handleMapSelect} userLocation={userLocation} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
