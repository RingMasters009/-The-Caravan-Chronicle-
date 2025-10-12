import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { apiService } from '../../api/apiService';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardFilters from '../../components/dashboard/DashboardFilters';
import StaffRouteMap from '../../components/staff/StaffRouteMap';

const defaultFilters = {
  status: '',
  priority: '',
  search: '',
};

const StaffDashboard = () => {
  const {
    user,
    filters,
    setFilters,
    complaints,
    stats,
    loading,
    error,
    refreshData,
  } = useDashboardData(defaultFilters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiService.updateComplaintStatus(id, { status });
      refreshData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportComplaintsCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-complaints-${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <DashboardHeader
        title="Staff Command Center"
        subtitle="Manage your assigned complaints and update their status."
        onExport={handleExport}
      />

      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        user={user}
        availableFilters={['status', 'priority', 'search']}
      />

      {stats && <DashboardStats stats={stats} />}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="xl:col-span-3 rounded-xl border border-slate-800 bg-slate-900/40 p-0">
          <ComplaintTable
            complaints={complaints}
            loading={loading}
            error={error}
            onStatusChange={handleStatusChange}
            showActions={false}
          />
        </section>
        <section className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-[400px] lg:min-h-0">
            <h3 className="text-lg font-bold mb-4 text-slate-200">Route Map</h3>
            <StaffRouteMap complaints={complaints} />
        </section>
      </div>
    </div>
  );
};

export default StaffDashboard;
