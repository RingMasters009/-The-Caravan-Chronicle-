const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  getDashboardStats,
  exportComplaintsCsv,
  getHeatmapData,
  getPublicSummary,
} = require('../controller/complaint');

const { protect, requireRole } = require('../middleware/auth');

// Create complaint (citizen portal)
router.post('/', protect, createComplaint);

// List complaints with filtering & pagination
router.get('/', protect, getComplaints);

// Dashboard stats for staff/admin
router.get('/stats', protect, requireRole('Staff', 'Admin'), getDashboardStats);

// CSV export - staff/admin only
router.get('/export/csv', protect, requireRole('Staff', 'Admin'), exportComplaintsCsv);

// Heatmap data - staff/admin only
router.get('/heatmap', getHeatmapData);
// Public summary (no auth)
router.get('/public/summary', getPublicSummary);

// Single complaint detail
router.get('/:id', protect, getComplaintById);

// Status update - staff/admin
router.patch('/:id/status', protect, requireRole('Staff', 'Admin'), updateComplaintStatus);

// Assign to staff - admin only
router.patch('/:id/assign', protect, requireRole('Admin'), assignComplaint);

module.exports = router;
