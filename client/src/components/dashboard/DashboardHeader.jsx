import React from 'react';

const DashboardHeader = ({ title, subtitle, onExport }) => (
  <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
    <button
      onClick={onExport}
      className="inline-flex items-center justify-center rounded-lg border border-teal-500/40 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-500/30"
    >
      Export CSV
    </button>
  </header>
);

export default DashboardHeader;
