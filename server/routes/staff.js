const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protect } = require("../middleware/auth");
const professionMapping = require("../utils/professionMapping");

// ✅ Get all staff (Admin sees only their city, with optional profession filtering)
router.get("/", protect, async (req, res) => {
  try {
    const { complaintType } = req.query;
    let query = { role: /^Staff$/i };

    // Admin-specific filtering
    if (req.user.role === "Admin") {
      if (req.user.city) {
        query.city = req.user.city.toLowerCase();
      }

      // Filter by profession based on complaint type
      if (complaintType && professionMapping[complaintType]) {
        const professions = professionMapping[complaintType];
        if (professions.length > 0) {
          query.profession = { $in: professions };
        } else {
          // If no profession is mapped, return no staff
          return res.status(200).json([]);
        }
      }
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
