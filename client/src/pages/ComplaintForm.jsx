import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/apiService";
import MapPicker from "../MapPicker";

const typeOptions = ["Road Damage", "Water Leakage", "Garbage", "Lighting", "Safety", "Other"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const ComplaintForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Other",
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

  // ✅ Handles input and textarea changes properly
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested location fields
    if (name === "address" || name === "city") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
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
      setError("Geolocation is not supported by your browser.");
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
      () => {
        setError("Unable to fetch your location. Please allow location access.");
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Fixed validation logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = formData.title.trim();
    const trimmedDesc = formData.description.trim();

    if (!trimmedTitle || !trimmedDesc) {
      setError("Please provide both a title and description.");
      return;
    }

    if (!formData.location.coordinates.coordinates?.length) {
      setError("Please pick the issue location on the map.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: trimmedTitle,
        description: trimmedDesc,
        type: formData.type,
        priority: formData.priority,
        location: {
          address: formData.location.address?.trim() || undefined,
          city: formData.location.city?.trim() || undefined,
          coordinates: formData.location.coordinates,
        },
      };

      const coords = formData.location.coordinates.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        payload.location.latitude = coords[1];
        payload.location.longitude = coords[0];
      }

      await apiService.createComplaint(payload);

      navigate("/dashboard/citizen");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit complaint. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-100">Report a New Issue</h1>
        <p className="text-sm text-slate-400">
          Describe the problem and mark the exact spot so staff can resolve it quickly.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6"
      >
        {/* Title */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">Title</label>
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

        {/* Description */}
        <div>
          <label className="block text-xs uppercase text-slate-500 mb-2">Description</label>
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

        {/* Type & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-slate-100 border border-slate-700 focus:border-teal-500"
            >
              {typeOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">Priority</label>
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
        </div>

        {/* Address & City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-slate-500 mb-2">Address</label>
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
            <label className="block text-xs uppercase text-slate-500 mb-2">City</label>
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
          <label className="block text-xs uppercase text-slate-500 mb-2">Attach Image</label>
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

          {formData.location.coordinates.coordinates?.length ? (
            <p className="mt-2 text-xs text-slate-400">
              Selected coordinates:{" "}
              {formData.location.coordinates.coordinates[1].toFixed(4)},{" "}
              {formData.location.coordinates.coordinates[0].toFixed(4)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Tap on the map above or use your current location.
            </p>
          )}
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
