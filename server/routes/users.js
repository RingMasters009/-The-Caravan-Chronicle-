const express = require("express");
const router = express.Router();

const { getStaffMembers } = require("../controller/user");
const { protect, requireRole } = require("../middleware/auth");

router.get("/staff", protect, requireRole("Admin", "Staff"), getStaffMembers);

module.exports = router;
