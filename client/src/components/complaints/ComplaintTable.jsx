import React from "react";

const statusColors = {
  OPEN: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
  IN_PROGRESS: "bg-sky-500/20 text-sky-200 border border-sky-500/30",
  RESOLVED: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  COMPLETED: "bg-green-500/20 text-green-200 border border-green-500/30",
  ESCALATED: "bg-rose-500/20 text-rose-200 border border-rose-500/30",
};

const priorityColors = {
  LOW: "text-slate-300",
  MEDIUM: "text-amber-300",
  HIGH: "text-orange-300",
  CRITICAL: "text-rose-300",
};

const ComplaintTable = ({
  complaints = [],
  loading = false,
  error = "",
  onStatusChange,
  onAssign,
  showActions = false,
  staffOptions = [],
}) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400">
        Loading complaints...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
        {error}
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
        No complaints found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Ticket</th>
            <th className="px-4 py-3 text-left font-medium">Citizen</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Priority</th>
            <th className="px-4 py-3 text-left font-medium">Created</th>
            <th className="px-4 py-3 text-left font-medium">Assigned</th>
            {showActions && <th className="px-4 py-3 text-left font-medium">Actions</th>}
{!showActions && <th className="px-4 py-3 text-left font-medium">Manage</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {complaints.map((complaint) => (
            <tr key={complaint._id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-slate-200">
                <div className="font-medium">{complaint.title}</div>
                <div className="text-xs text-slate-500">
                  {complaint.description?.slice(0, 110)}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {complaint.reporter?.fullName ?? "Citizen"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[complaint.status] ?? ""
                  }`}
                >
                  {complaint.status}
                </span>
              </td>
              <td className={`px-4 py-3 ${priorityColors[complaint.priority] ?? "text-slate-300"}`}>
                {complaint.priority}
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(complaint.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {complaint.assignedTo?.fullName ?? "Unassigned"}
              </td>
              {showActions && (
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {onStatusChange && (
                      <select
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs"
                        value={complaint.status}
                        onChange={(e) => onStatusChange(complaint._id, e.target.value)}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="ESCALATED">ESCALATED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    )}
                    {onAssign && (
                      <select
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs"
                        value={complaint.assignedTo?._id ?? ""}
                        onChange={(e) => onAssign(complaint._id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {staffOptions.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.fullName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              )}
              {!showActions && (
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                        {complaint.status === 'OPEN' && (
                            <button onClick={() => onStatusChange(complaint._id, 'IN_PROGRESS')} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-1 px-3 rounded-md text-xs transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75">Start Work</button>
                        )}
                        {complaint.status === 'IN_PROGRESS' && (
                            <button onClick={() => onStatusChange(complaint._id, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-3 rounded-md text-xs transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75">Mark Complete</button>
                        )}
                    </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
