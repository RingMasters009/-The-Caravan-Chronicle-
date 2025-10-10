// client/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../api/apiService";
import ComplaintTable from "../../components/complaints/ComplaintTable";
import { useUser } from "../../context/UserContext";

const defaultFilters = {
  status: "",
  priority: "",
  type: "",
  city: "",
  search: "",
};

const AdminDashboard = () => {
  const { user, logout } = useUser();
  const [filters, setFilters] = useState(defaultFilters);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-filter by admin's city
  useEffect(() => {
    if (!user) return;
    setFilters((prev) => ({
      ...prev,
      city: user?.city || "",
    }));
  }, [user]);

  // Fetch complaints, stats, and staff
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [complaintData, statData, staffData] = await Promise.all([
          apiService.getComplaints(filters),
          apiService.getComplaintStats(filters),
          apiService.getStaffMembers(),
        ]);

        // normalize complaints: server might return array or { items: [] }
        const complaintsList = Array.isArray(complaintData)
          ? complaintData
          : complaintData?.items ?? [];

        setComplaints(complaintsList);

        // normalize stats: server might return flat object or { summary: { ... } }
        const normalizedStats = statData?.summary ?? statData ?? {};
        setStats(normalizedStats);

        // normalize staff list
        const staffList = Array.isArray(staffData)
          ? staffData
          : staffData?.items ?? [];

        const filteredStaff = (staffList ?? []).filter(
          (s) => s.city === user.city && s.profession
        );
        setStaffMembers(filteredStaff);

        setError("");
      } catch (err) {
        const message = err.message || "Failed to load admin data";
        if (message.toLowerCase().includes("not authorized")) {
          logout();
          return;
        }
        setError(message);
        setStats({ totals: [], overdueCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, user, logout]);

  // Complaint totals - accept both aggregation-array and flat objects
  const totals = useMemo(() => {
    const summary = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      ESCALATED: 0,
    };

    if (!stats) return summary;

    // case: aggregation array [{ _id: "OPEN", count: X }, ...]
    if (Array.isArray(stats?.totals)) {
      stats.totals.forEach((row) => {
        if (row._id && typeof row.count === "number") summary[row._id] = row.count;
      });
    }

    // case: backend flat keys
    if (typeof stats === "object") {
      summary.OPEN = stats.open ?? summary.OPEN;
      summary.IN_PROGRESS = stats.inProgress ?? summary.IN_PROGRESS;
      summary.RESOLVED = stats.completed ?? summary.RESOLVED;
      summary.ESCALATED = stats.escalated ?? summary.ESCALATED;
    }

    return summary;
  }, [stats]);

  // Filters
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handleReset = () =>
    setFilters({ ...defaultFilters, city: user?.city || "" });

  // Status change
  const handleStatusChange = async (id, status) => {
    try {
      await apiService.updateComplaintStatus(id, { status });
      // refresh: keep filters the same to trigger useEffect
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Assign complaint
  const handleAssign = async (complaintId, staffId) => {
    try {
      if (!staffId) return;

      const selectedStaff = staffMembers.find((s) => s._id === staffId);
      if (!selectedStaff) {
        alert("Invalid staff member selected.");
        return;
      }

      const complaint = complaints.find((c) => c._id === complaintId);
      if (!complaint) {
        alert("Complaint not found.");
        return;
      }

      if (selectedStaff.city !== complaint.location.city) {
        alert("Staff must be from the same city as the complaint.");
        return;
      }

      const complaintType = complaint.type?.toLowerCase() || "";
      const profession = selectedStaff.profession?.toLowerCase() || "";
      const isProfessionMatch =
        complaintType.includes(profession) || profession.includes(complaintType);

      if (!isProfessionMatch) {
        alert(
          `Staff profession (${selectedStaff.profession}) does not match complaint type (${complaint.type}).`
        );
        return;
      }

      await apiService.assignComplaint(complaintId, staffId);
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      console.error("Failed to assign complaint", err);
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const blob = await apiService.exportComplaintsCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaints-admin-${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV", err);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Manage complaints for your city and assign them to qualified staff.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center rounded-lg border border-teal-500/40 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-500/30"
        >
          Export CSV
        </button>
      </header>

      {/* Filters */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {["status", "priority", "type", "city", "search"].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {field === "status" ? (
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              ) : field === "priority" ? (
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              ) : (
                <input
                  type="text"
                  name={field}
                  value={filters[field]}
                  onChange={handleChange}
                  disabled={field === "city"}
                  placeholder={field === "city" ? user?.city || "City" : "Enter value"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-400 hover:text-teal-200"
          >
            Reset filters
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        {["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED"].map((key) => (
          <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{key}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{totals[key]}</p>
          </div>
        ))}
      </section>

      {/* Complaint Table */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-0">
        <ComplaintTable
          complaints={complaints}
          loading={loading}
          error={error}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          showActions
          staffOptions={staffMembers}
        />
      </section>
    </div>
  );
};

export default AdminDashboard;
