import React from 'react';

const DashboardStats = ({ stats }) => {
  const totals = {
    OPEN: stats?.open ?? 0,
    IN_PROGRESS: stats?.inProgress ?? 0,
    RESOLVED: stats?.completed ?? 0,
    ESCALATED: stats?.escalated ?? 0,
  };

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {Object.entries(totals).map(([key, value]) => (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{key.replace('_', ' ')}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
        </div>
      ))}
    </section>
  );
};

export default DashboardStats;
