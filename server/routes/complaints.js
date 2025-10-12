const express = require("express");
const router = express.Router();
const complaintController = require("../controller/complaint");
const { protect, requireRole } = require("../middleware/auth");

// 🟢 Create new complaint (Citizen/User)
router.post(
  "/",
  protect,
  complaintController.uploadComplaintImage,
  complaintController.createComplaint
);

// 🗺️ Public heatmap (no auth required)
router.get("/heatmap", complaintController.getHeatmapData);

// 📊 Complaint statistics (Admin and Staff)
router.get("/stats", protect, requireRole("Admin", "Staff"), complaintController.getComplaintStats);
router.get(
  "/export",
  protect,
  requireRole("admin"),
  complaintController.exportComplaintsToCSV
);
// 🧾 Get all complaints (Admin/Staff/User — logic handled inside controller)
router.get("/", protect, complaintController.getComplaints);

// 📋 Get single complaint by ID
router.get("/:id", protect, complaintController.getComplaintById);

// 👷 Assign complaint to staff (Admin only)
router.patch("/:id/assign", protect, requireRole("Admin"), complaintController.assignComplaint);

// 🔄 Update complaint status (Staff or Admin)
router.patch("/:id/status", protect, complaintController.updateComplaintStatus);

// 🛠️ Update full complaint (Admin only)
router.patch("/:id", protect, requireRole("Admin"), complaintController.updateComplaint);

// ❌ Delete complaint (Admin only)
router.delete("/:id", protect, requireRole("Admin"), complaintController.deleteComplaint);

module.exports = router;
