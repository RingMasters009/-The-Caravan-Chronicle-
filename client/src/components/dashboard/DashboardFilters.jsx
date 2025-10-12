import React from 'react';

const DashboardFilters = ({ filters, onFilterChange, onReset, user, availableFilters }) => (
  <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Filters</h2>
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-${availableFilters.length}`}>
      {availableFilters.map((field) => (
        <div key={field}>
          <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          {field === 'status' ? (
            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          ) : field === 'priority' ? (
            <select
              name="priority"
              value={filters.priority}
              onChange={onFilterChange}
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
              onChange={onFilterChange}
              disabled={field === 'city' && user.role === 'Admin'}
              placeholder={field === 'city' ? user?.city || 'City' : 'Enter value'}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            />
          )}
        </div>
      ))}
    </div>
    <div className="mt-4 flex justify-end">
      <button
        onClick={onReset}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-400 hover:text-teal-200"
      >
        Reset filters
      </button>
    </div>
  </section>
);

export default DashboardFilters;
