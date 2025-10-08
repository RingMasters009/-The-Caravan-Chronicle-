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

        setComplaints(complaintData?.items ?? []);
        setStats(statData ?? { totals: [], overdueCount: 0 });
        setStaffMembers(staffData ?? []);
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

  const totals = useMemo(() => {
    const summary = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      ESCALATED: 0,
    };

    const totalsArray = Array.isArray(stats?.totals) ? stats.totals : [];

    totalsArray.forEach((row) => {
      summary[row._id] = row.count;
    });

    return summary;
  }, [stats]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => setFilters(defaultFilters);

  const handleStatusChange = async (id, status) => {
    try {
      await apiService.updateComplaintStatus(id, status);
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAssign = async (id, staffId) => {
    try {
      if (!staffId) return;
      await apiService.assignComplaint(id, staffId);
      setFilters((prev) => ({ ...prev }));
    } catch (err) {
      console.error("Failed to assign complaint", err);
    }
  };

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
          <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">
            Oversee every complaint, monitor SLAs, and coordinate the entire circus crew.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center rounded-lg border border-teal-500/40 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-500/30"
        >
          Export CSV
        </button>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
              Status
            </label>
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
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
              Priority
            </label>
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
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            >
              <option value="">All</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Garbage">Garbage</option>
              <option value="Lighting">Lighting</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
              City
            </label>
            <input
              type="text"
              name="city"
              value={filters.city}
              onChange={handleChange}
              placeholder="Wondervale"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Title or description"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            />
          </div>
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

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{totals.OPEN}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{totals.IN_PROGRESS}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Escalated</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{totals.ESCALATED}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{totals.RESOLVED}</p>
        </div>
      </section>

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
