const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protect } = require("../middleware/auth");

// ✅ Get all staff (Admin sees only their city)
router.get("/", protect, async (req, res) => {
  try {
    let query = { role: "Staff" };

    if (req.user.role === "Admin" && req.user.city) {
      query.city = req.user.city.toLowerCase();
    }

    const staff = await User.find(query).select("-password");
    console.log("👥 Staff Query:", query);
    console.log("🟢 Found Staff:", staff.length);

    res.status(200).json(staff);
  } catch (error) {
    console.error("❌ Error fetching staff:", error);
    res.status(500).json({ message: "Failed to load staff" });
  }
});

module.exports = router;
