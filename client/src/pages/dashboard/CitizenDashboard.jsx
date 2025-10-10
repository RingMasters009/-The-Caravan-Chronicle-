import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../api/apiService";

const statusBadges = {
  OPEN: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  IN_PROGRESS: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
  RESOLVED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  ESCALATED: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
};

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getComplaints({});
      setComplaints(Array.isArray(data) ? data : data?.items ?? []);

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleVerification = async (complaintId, action) => {
    try {
      let notes;
      if (action === "REJECT") {
        const input = window.prompt(
          "Please describe what is still unresolved (optional details help staff)."
        );
        if (input === null) {
          return;
        }
        notes = input.trim() ? input.trim() : undefined;
      }

      setVerifyingId(complaintId);
      await apiService.verifyComplaint(complaintId, action, notes);
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Failed to submit verification");
      await loadComplaints();
    } finally {
      setVerifyingId(null);
    }
  };

  const renderVerificationStatus = (complaint) => {
    const verification = complaint.verification;
    if (!verification) {
      return <span className="text-slate-500">—</span>;
    }

    const expiresLabel = verification.expiresAt
      ? new Date(verification.expiresAt).toLocaleString()
      : null;
    const requestedLabel = verification.requestedAt
      ? new Date(verification.requestedAt).toLocaleString()
      : null;
    const actionedLabel = verification.actionedAt
      ? new Date(verification.actionedAt).toLocaleString()
      : null;

    switch (verification.status) {
      case "PENDING":
        return (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-amber-300">Awaiting your confirmation</p>
            {requestedLabel && <p className="text-slate-400">Requested: {requestedLabel}</p>}
            {expiresLabel && <p className="text-slate-400">Expires: {expiresLabel}</p>}
          </div>
        );
      case "CONFIRMED":
        return (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-emerald-300">Confirmed</p>
            {actionedLabel && <p className="text-slate-400">On: {actionedLabel}</p>}
          </div>
        );
      case "AUTO_CONFIRMED":
        return (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-emerald-300">Auto-confirmed</p>
            {expiresLabel && <p className="text-slate-400">Window ended: {expiresLabel}</p>}
          </div>
        );
      case "REJECTED":
        return (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-rose-300">You reported it unresolved</p>
            {actionedLabel && <p className="text-slate-400">On: {actionedLabel}</p>}
          </div>
        );
      default:
        return <span className="text-xs text-slate-400">{verification.status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Citizen Dashboard</h1>
          <p className="text-sm text-slate-400">
            Track the status of issues you have reported.
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-400"
        >
          + New Complaint
        </Link>
      </header>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          Loading complaints...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
          You have not reported any complaints yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ticket</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium">Verification</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {complaints.map((complaint) => {
                const isPendingVerification =
                  complaint.status === "RESOLVED" && complaint.verification?.status === "PENDING";

                return (
                  <tr key={complaint._id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 text-slate-200">
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-xs text-slate-500">
                        {complaint.description?.slice(0, 80)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusBadges[complaint.status] ?? ""
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{complaint.priority}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {complaint.assignedTo?.fullName ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {renderVerificationStatus(complaint)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {isPendingVerification ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleVerification(complaint._id, "CONFIRM")}
                            disabled={verifyingId === complaint._id}
                          >
                            {verifyingId === complaint._id ? "Confirming..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleVerification(complaint._id, "REJECT")}
                            disabled={verifyingId === complaint._id}
                          >
                            {verifyingId === complaint._id ? "Submitting..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
