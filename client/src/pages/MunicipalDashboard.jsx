import React, { useState, useEffect } from "react";
import { apiService } from "../api/apiService.js";

// --- Complaint Card Component ---
// A self-contained component to display a single complaint and its actions.
const ComplaintCard = ({ complaint, staffList, onAssign, onStatusUpdate }) => {
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const handleAssignClick = () => {
    if (selectedStaffId) {
      onAssign(complaint._id, selectedStaffId);
    } else {
      alert("Please select a staff member to assign.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-blue-400";
      case "In Progress":
        return "text-orange-400";
      case "Resolved":
        return "text-green-400";
      case "Overdue":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
      <h3 className="font-bold text-xl text-white mb-2">{complaint.title}</h3>
      <p className={`font-semibold mb-4 ${getStatusColor(complaint.status)}`}>
        Status: {complaint.status}
      </p>
      <p className="text-gray-400 mb-4 text-sm">{complaint.description}</p>
      <div className="text-xs text-gray-500 mb-4">
        <p>Category: {complaint.category_id?.name || "N/A"}</p>
        <p>Reported by: {complaint.citizen_id?.full_name || "N/A"}</p>
        <p>
          Assigned to: {complaint.assigned_to_id?.full_name || "Unassigned"}
        </p>
      </div>

      {/* --- Assignment UI for Admin --- */}
      <div className="mt-4 space-y-2">
        <label className="text-sm font-semibold text-gray-400">
          Assign to Staff:
        </label>
        <div className="flex gap-2">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="">Select Staff...</option>
            {staffList.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const MunicipalDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch both complaints and staff list when the component mounts
    const fetchData = async () => {
      try {
        setLoading(true);
        const complaintsData = await apiService.getComplaints();
        const staffData = await apiService.getStaffMembers();
        setComplaints(complaintsData.complaints || []);
        setStaffList(staffData.staff || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignComplaint = async (complaintId, staffId) => {
    try {
      await apiService.assignComplaint(complaintId, staffId);
      // Refresh the complaints list to show the update
      const updatedComplaintsData = await apiService.getComplaints();
      setComplaints(updatedComplaintsData.complaints || []);
      alert("Complaint assigned successfully!");
    } catch (err) {
      setError("Failed to assign complaint.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-white">Loading Dashboard...</div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Municipal Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                staffList={staffList}
                onAssign={handleAssignComplaint}
                // onStatusUpdate prop can be passed here if needed
              />
            ))
          ) : (
            <p>No complaints found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MunicipalDashboard;
