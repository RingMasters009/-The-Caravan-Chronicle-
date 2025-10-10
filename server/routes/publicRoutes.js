const express = require("express");
const router = express.Router();
const { Complaint } = require("../models/Complaint");

router.get("/summary", async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const resolvedComplaints = counts.RESOLVED || 0;
    const resolvedRate =
      totalComplaints > 0
        ? Math.round((resolvedComplaints / totalComplaints) * 100)
        : 0;

    const overdueCount = await Complaint.countDocuments({
      dueAt: { $lt: new Date() },
      status: { $ne: "RESOLVED" },
    });

    const recentComplaints = await Complaint.find({}, {
      title: 1,
      description: 1,
      type: 1,
      priority: 1,
      status: 1,
      createdAt: 1,
      location: 1,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totals: totalComplaints,
      statusCounts: counts,
      resolvedRate,
      overdueCount,
      averageResolutionHours: 0,
      recentComplaints,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});


module.exports = router;
