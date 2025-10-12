import React, { useEffect } from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { apiService } from '../../api/apiService';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardFilters from '../../components/dashboard/DashboardFilters';
import Pagination from '../../components/Pagination';

const defaultFilters = {
  status: '',
  priority: '',
  type: '',
  city: '',
  search: '',
};

const AdminDashboard = () => {
  const {
    user,
    filters,
    setFilters,
    complaints,
    stats,
    staffMembers,
    loading,
    error,
    refreshData,
    page,
    totalPages,
    setPage,
  } = useDashboardData(defaultFilters);

  useEffect(() => {
    if (user?.city) {
      setFilters((prev) => ({ ...prev, city: user.city }));
    }
  }, [user, setFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ ...defaultFilters, city: user?.city || '' });
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiService.updateComplaintStatus(id, { status });
      refreshData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAssign = async (complaintId, staffId) => {
    try {
      await apiService.assignComplaint(complaintId, staffId);
      refreshData();
    } catch (err) {
      console.error('Failed to assign complaint', err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportComplaintsCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `complaints-admin-${Date.now()}.csv`;
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
        title="Admin Dashboard"
        subtitle="Manage complaints for your city and assign them to qualified staff."
        onExport={handleExport}
      />

      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        user={user}
        availableFilters={['status', 'priority', 'type', 'city', 'search']}
      />

      {stats && <DashboardStats stats={stats} />}

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
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default AdminDashboard;
