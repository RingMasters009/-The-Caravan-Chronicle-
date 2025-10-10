const Complaint = require("../models/Complaint");

// 📊 Public summary of all complaints
exports.getPublicSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusSummary = statusCounts.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    const overdueCount = await Complaint.countDocuments({ overdue: true });

    const resolvedComplaints = await Complaint.find({ status: "RESOLVED" });
    const avgResolutionHours =
      resolvedComplaints.length > 0
        ? resolvedComplaints.reduce(
            (acc, c) => acc + (c.slaHours || 0),
            0
          ) / resolvedComplaints.length
        : 0;

    const resolvedRate =
      total > 0
        ? ((statusSummary.RESOLVED || 0) / total) * 100
        : 0;

    const recentComplaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type priority status description location createdAt");

    res.json({
      totals: total,
      statusCounts: statusSummary,
      overdueCount,
      resolvedRate,
      averageResolutionHours: avgResolutionHours,
      recentComplaints,
    });
  } catch (err) {
    console.error("Error generating public summary:", err);
    res.status(500).json({ message: "Failed to load public summary" });
  }
};
