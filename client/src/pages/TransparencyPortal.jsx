import React, { useEffect, useState } from "react";
import { apiService } from "../api/apiService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// 🎨 Metric Card
const metricCard = (label, value, accent = "text-teal-300") => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
  </div>
);

// 🎨 Colors for charts
const COLORS = ["#14b8a6", "#facc15", "#3b82f6", "#ef4444", "#a855f7"];

const TransparencyPortal = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
 const data = await apiService.getPublicSummary();
setSummary(data); // <-- FIXED: backend already returns the summary

        setError("");
      } catch (err) {
        setError(err.message || "Failed to load transparency data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400 animate-pulse">
        Loading transparency report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
        {error}
      </div>
    );
  }

  const {
    totals = 0,
    statusCounts = {},
    resolvedRate = 0,
    overdueCount = 0,
    averageResolutionHours = 0,
    recentComplaints = [],
    dailyTrend = [], // optional extra data from backend
  } = summary || {};

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* 🌐 HEADER */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">
          Public Transparency Portal
        </h1>
        <p className="text-sm text-slate-400">
          Real-time civic complaint analytics for the city.
        </p>
      </header>

      {/* 📊 METRICS */}
      <section className="grid gap-4 md:grid-cols-4">
        {metricCard("Total Complaints", totals.toLocaleString())}
        {metricCard("Resolved Rate", `${resolvedRate.toFixed(1)}%`)}
        {metricCard(
          "Open / In Progress",
          (statusCounts.OPEN || 0) + (statusCounts.IN_PROGRESS || 0),
          "text-amber-300"
        )}
        {metricCard("Overdue", overdueCount, "text-rose-300")}
      </section>

      {/* 🧩 VISUAL DASHBOARD */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* 🥧 Complaint Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Complaint Status Distribution
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm">No data to visualize</p>
          )}
        </div>

        {/* 📈 SLA / Resolution Trend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Average Resolution Time (hrs)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Avg Time", hours: averageResolutionHours },
                { name: "Target (24h)", hours: 24 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="hours" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 🕒 RECENT COMPLAINTS */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Most Recent Complaints
        </h2>
        <div className="mt-3 space-y-3">
          {recentComplaints.length === 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-slate-400">
              No complaints reported recently.
            </div>
          )}
          {recentComplaints.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800/60 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.type} · {item.priority}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.status === "CLOSED"
                      ? "bg-green-900/40 text-green-300"
                      : item.status === "IN_PROGRESS"
                      ? "bg-amber-900/40 text-amber-300"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Reported {new Date(item.createdAt).toLocaleString()} ·{" "}
                {item.location?.city || "Unknown City"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TransparencyPortal;
