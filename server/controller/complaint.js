const mongoose = require("mongoose");
const { Parser } = require("json2csv");
const {
  Complaint,
  COMPLAINT_STATUS,
  COMPLAINT_TYPES,
  COMPLAINT_PRIORITY,
} = require("../models/Complaint");

const buildFilters = (user, query) => {
  const filters = {};

  if (user.role === "User") {
    filters.reporter = user._id;
  }

  if (query.status && COMPLAINT_STATUS.includes(query.status)) {
    filters.status = query.status;
  }

  if (query.type && COMPLAINT_TYPES.includes(query.type)) {
    filters.type = query.type;
  }

  if (query.priority && COMPLAINT_PRIORITY.includes(query.priority)) {
    filters.priority = query.priority;
  }

  if (query.assignedTo && mongoose.isValidObjectId(query.assignedTo)) {
    filters.assignedTo = query.assignedTo;
  }

  if (query.city) {
    filters["location.city"] = new RegExp(query.city, "i");
  }

  if (query.from || query.to) {
    filters.createdAt = {};
    if (query.from) {
      filters.createdAt.$gte = new Date(query.from);
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filters.createdAt.$lte = toDate;
    }
  }

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filters.$or = [{ title: regex }, { description: regex }];
  }

  return filters;
};

const ensureStaffAssignmentFilter = (filters, userId) => {
  const staffAssignment = {
    $or: [{ assignedTo: userId }, { assignedTo: { $exists: false } }],
  };

  if (filters.$or) {
    const existingOr = filters.$or;
    delete filters.$or;
    filters.$and = filters.$and || [];
    filters.$and.push({ $or: existingOr });
  }

  filters.$and = filters.$and || [];
  filters.$and.push(staffAssignment);
};

exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      attachments,
      location,
      slaHours,
    } = req.body;

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription =
      typeof description === "string" ? description.trim() : "";

    if (!normalizedTitle || !normalizedDescription) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    let locationPayload = undefined;
    if (location && typeof location === "object") {
      const {
        address,
        city,
        state,
        postalCode,
        country,
        placeId,
        latitude,
        longitude,
        coordinates,
      } = location;

      const geoCoordinates =
        Array.isArray(coordinates?.coordinates) && coordinates.coordinates.length === 2
          ? {
              type: coordinates.type || "Point",
              coordinates: coordinates.coordinates,
            }
          : typeof longitude === "number" && typeof latitude === "number"
          ? {
              type: "Point",
              coordinates: [longitude, latitude],
            }
          : undefined;

      locationPayload = {
        address: address ? address.trim() : undefined,
        city: city ? city.trim() : undefined,
        state: state ? state.trim() : undefined,
        postalCode: postalCode ? postalCode.trim() : undefined,
        country: country ? country.trim() : undefined,
        placeId: placeId ? placeId.trim() : undefined,
        latitude:
          typeof latitude === "number"
            ? latitude
            : geoCoordinates?.coordinates?.[1],
        longitude:
          typeof longitude === "number"
            ? longitude
            : geoCoordinates?.coordinates?.[0],
        coordinates: geoCoordinates,
      };

      Object.keys(locationPayload).forEach((key) => {
        const value = locationPayload[key];
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        ) {
          delete locationPayload[key];
        }
      });

      if (!Object.keys(locationPayload).length) {
        locationPayload = undefined;
      }
    }

    const complaint = await Complaint.create({
      title: normalizedTitle,
      description: normalizedDescription,
      type,
      priority,
      attachments,
      location: locationPayload,
      reporter: req.user._id,
      slaHours,
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Failed to create complaint", error: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const filters = buildFilters(req.user, req.query);

    if (req.user.role === "Staff") {
      ensureStaffAssignmentFilter(filters, req.user._id);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Complaint.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate("reporter", "fullName email role")
        .populate("assignedTo", "fullName email role"),
      Complaint.countDocuments(filters),
    ]);

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findById(id)
      .populate("reporter", "fullName email role")
      .populate("assignedTo", "fullName email role");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (
      req.user.role === "User" &&
      complaint.reporter &&
      complaint.reporter._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Get complaint error:", error);
    res.status(500).json({ message: "Failed to fetch complaint", error: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    if (!status || !COMPLAINT_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === status) {
      return res.json(complaint);
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      notes,
      updatedBy: req.user._id,
    });

    if (status === "RESOLVED") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const populated = await complaint.populate([
      { path: "reporter", select: "fullName email role" },
      { path: "assignedTo", select: "fullName email role" },
    ]);

    res.json(populated);
  } catch (error) {
    console.error("Update complaint status error:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, notes } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid id provided" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.assignedTo = staffId;
    complaint.assignmentHistory.push({
      assignedTo: staffId,
      assignedBy: req.user._id,
      notes,
    });

    if (complaint.status === "OPEN") {
      complaint.status = "IN_PROGRESS";
      complaint.statusHistory.push({
        status: "IN_PROGRESS",
        updatedBy: req.user._id,
        notes: "Auto-updated on assignment",
      });
    }

    await complaint.save();

    const populated = await complaint.populate([
      { path: "reporter", select: "fullName email role" },
      { path: "assignedTo", select: "fullName email role" },
    ]);

    res.json(populated);
  } catch (error) {
    console.error("Assign complaint error:", error);
    res.status(500).json({ message: "Failed to assign complaint", error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const matchStage = buildFilters(req.user, req.query);

    if (req.user.role === "Staff") {
      ensureStaffAssignmentFilter(matchStage, req.user._id);
    }

    const totals = await Complaint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgResolutionHours: {
            $avg: {
              $cond: [
                { $ifNull: ["$resolvedAt", false] },
                {
                  $divide: [
                    { $subtract: ["$resolvedAt", "$createdAt"] },
                    1000 * 60 * 60,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);

    const overdueCount = await Complaint.countDocuments({
      ...matchStage,
      status: { $in: ["OPEN", "IN_PROGRESS", "ESCALATED"] },
      dueAt: { $lt: new Date() },
    });

    res.json({ totals, overdueCount });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

exports.exportComplaintsCsv = async (req, res) => {
  try {
    const filters = buildFilters(req.user, req.query);
    if (req.user.role === "Staff") {
      ensureStaffAssignmentFilter(filters, req.user._id);
    }
    const complaints = await Complaint.find(filters)
      .populate("reporter", "fullName email")
      .populate("assignedTo", "fullName email")
      .lean();

    const parser = new Parser({
      fields: [
        "_id",
        "title",
        "description",
        "type",
        "priority",
        "status",
        "createdAt",
        "updatedAt",
        "dueAt",
        "resolvedAt",
        "reporter.fullName",
        "assignedTo.fullName",
        "location.city",
      ],
    });

    const csv = parser.parse(complaints);

    res.header("Content-Type", "text/csv");
    res.attachment(`complaints-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export complaints CSV error:", error);
    res.status(500).json({ message: "Failed to export complaints", error: error.message });
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const filters = buildFilters(req.user, req.query);
    if (req.user.role === "Staff") {
      ensureStaffAssignmentFilter(filters, req.user._id);
    }

    filters["location.coordinates.coordinates.0"] = { $exists: true };
    filters["location.coordinates.coordinates.1"] = { $exists: true };

    const complaints = await Complaint.find(filters)
      .select(
        "location.coordinates location.city location.country status priority dueAt createdAt slaHours"
      )
      .lean();

    const data = complaints.map((complaint) => {
      const [lng, lat] = complaint.location.coordinates.coordinates;
      return {
        id: complaint._id,
        lat,
        lng,
        status: complaint.status,
        priority: complaint.priority,
        city: complaint.location?.city || null,
        country: complaint.location?.country || null,
        createdAt: complaint.createdAt,
        slaHours: complaint.slaHours,
        overdue:
          complaint.dueAt &&
          ["OPEN", "IN_PROGRESS", "ESCALATED"].includes(complaint.status) &&
          complaint.dueAt < new Date(),
      };
    });

    res.json(data);
  } catch (error) {
    console.error("heatmap data error:", error);
    res.status(500).json({ message: "Failed to load heatmap data", error: error.message });
  }
};

exports.getPublicSummary = async (req, res) => {
  try {
    const [total, statusAggregation, overdueCount, avgResolutionAggregation, recent] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Complaint.countDocuments({
          status: { $in: ["OPEN", "IN_PROGRESS", "ESCALATED"] },
          dueAt: { $lt: new Date() },
        }),
        Complaint.aggregate([
          {
            $match: {
              resolvedAt: { $ne: null },
            },
          },
          {
            $project: {
              diffHours: {
                $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgHours: { $avg: "$diffHours" },
            },
          },
        ]),
        Complaint.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select(
            "title type priority status description createdAt location.city location.country dueAt slaHours"
          )
          .lean(),
      ]);

    const statusCounts = statusAggregation.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const resolvedCount = statusCounts.RESOLVED || 0;
    const resolvedRate = total ? (resolvedCount / total) * 100 : 0;
    const averageResolutionHours = avgResolutionAggregation[0]?.avgHours || 0;

    res.json({
      totals: total,
      statusCounts,
      resolvedRate,
      overdueCount,
      averageResolutionHours,
      recentComplaints: recent,
    });
  } catch (error) {
    console.error("Public summary error:", error);
    res.status(500).json({ message: "Failed to load public summary", error: error.message });
  }
};
