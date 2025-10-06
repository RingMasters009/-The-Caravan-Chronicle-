const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
} = require("../controllers/complaint.controller");

// Import middleware
const { protect, isAdmin } = require("../middleware/auth.middleware");

// --- Complaint Routes ---

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (Requires a logged-in user)
router.post("/", protect, createComplaint);

// @route   GET /api/complaints
// @desc    Get all complaints for the user's city
// @access  Private (Requires a logged-in municipal user, we can add a role check here later)
router.get("/", protect, getAllComplaints);

// @route   PATCH /api/complaints/:id/status
// @desc    Update a complaint's status
// @access  Private (Requires a logged-in municipal user)
router.patch("/:id/status", protect, updateComplaintStatus);

// @route   PATCH /api/complaints/:id/assign
// @desc    Assign a complaint to a staff member
// @access  Private (Requires an Admin user)
router.patch("/:id/assign", protect, isAdmin, assignComplaint);

module.exports = router;
