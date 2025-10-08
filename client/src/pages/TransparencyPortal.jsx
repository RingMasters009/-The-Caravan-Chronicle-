import React, { useEffect, useState } from "react";
import { apiService } from "../api/apiService";

const metricCard = (label, value, accent = "text-teal-300") => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
  </div>
);

const TransparencyPortal = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPublicSummary();
        setSummary(data ?? {});
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
      <div className="flex h-48 items-center justify-center text-slate-400">
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

  const statusCounts = summary?.statusCounts || {};
  const resolvedRate = summary?.resolvedRate ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const totalComplaints = summary?.totals ?? 0;
  const avgResolutionHours = summary?.averageResolutionHours ?? 0;
  const recent = summary?.recentComplaints ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">Public Transparency Portal</h1>
        <p className="text-sm text-slate-400">
          Real-time visibility into complaints raised by citizens of the Circus of Wonders.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {metricCard("Total Complaints", totalComplaints.toLocaleString())}
        {metricCard("Resolved Rate", `${resolvedRate.toFixed(1)}%`)}
        {metricCard("Open / In Progress", (statusCounts.OPEN || 0) + (statusCounts.IN_PROGRESS || 0), "text-amber-300")}
        {metricCard("Overdue", overdueCount, "text-rose-300")}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Resolution Performance</h2>
        <p className="mt-2 text-sm text-slate-400">
          Average resolution time: <span className="text-teal-300 font-semibold">{avgResolutionHours.toFixed(1)} hrs</span>
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{status}</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">{count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Most Recent Complaints</h2>
        <div className="mt-3 space-y-3">
          {recent.length === 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-slate-400">
              No complaints reported in the last week.
            </div>
          )}
          {recent.map((item) => (
            <div key={item._id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.type} · {item.priority}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                Reported {new Date(item.createdAt).toLocaleString()} · {item.location?.city || "Unknown City"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TransparencyPortal;
