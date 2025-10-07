const User = require("../models/user.model");

exports.getStaffMembers = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["Staff", "Admin"] } })
      .select("fullName email role")
      .sort({ role: 1, fullName: 1 });

    res.json(staff);
  } catch (error) {
    console.error("Get staff members error:", error);
    res.status(500).json({ message: "Failed to load staff members", error: error.message });
  }
};
