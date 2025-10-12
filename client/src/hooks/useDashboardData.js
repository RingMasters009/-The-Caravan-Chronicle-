import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';

const useDashboardData = (defaultFilters) => {
  const { user, logout } = useUser();
  const socket = useSocket();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const promises = [apiService.getComplaints({ ...filters, page })];

      if (user.role === 'Admin' || user.role === 'Staff') {
        promises.push(apiService.getComplaintStats(filters));
      }

      if (user.role === 'Admin') {
        promises.push(apiService.getStaffMembers({ city: user.city }));
      }

      const results = await Promise.all(promises);

      setComplaints(results[0].complaints || []);
      setTotalPages(results[0].totalPages || 1);

      if (user.role === 'Admin' || user.role === 'Staff') {
        setStats(results[1]);
      }

      if (user.role === 'Admin') {
        const staffData = results[2];
        setStaffMembers(Array.isArray(staffData) ? staffData : staffData?.items ?? []);
      }

    } catch (err) {
      const message = err.message || 'Failed to load data';
      if (message.toLowerCase().includes('not authorized')) {
        logout();
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, filters, page, logout]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log('Real-time update received. Refreshing data...');
      fetchData();
    };

    socket.on('newComplaint', handleUpdate);
    socket.on('complaintUpdated', handleUpdate);

    return () => {
      socket.off('newComplaint', handleUpdate);
      socket.off('complaintUpdated', handleUpdate);
    };
  }, [socket, fetchData]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const refreshData = () => {
    fetchData();
  };

  return {
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
  };
};

export default useDashboardData;
