const path = require("path");
const fs = require("fs");
const multer = require("multer");
const  {Complaint}  = require("../models/Complaint");
const User = require("../models/user.model");
// =====================
// 🧠 Profession Mapping
// =====================
// =====================
// 🧠 Profession Mapping
// =====================
const typeToProfessionMap = {
  // ⚡ Electricity-related
  "Electricity": "Electrician",
  "Power Outage": "Electrician",
  "Street Light Failure": "Electrician",
  "Electric Shortage": "Electrician",
  "Lighting Issue": "Electrician",

  // 💧 Water-related
  "Water Leakage": "Plumber",
  "Broken Pipe": "Plumber",
  "Clogged Drain": "Plumber",

  // 🗑️ Waste-related
  "Garbage": "Cleaner",
  "Garbage Collection": "Cleaner",
  "Waste Management": "Cleaner",
  "Uncollected Waste": "Cleaner",
  "Sanitation": "Cleaner",

  // 🛣️ Road-related
  "Road Damage": "Road Worker",
  "Potholes": "Road Worker",
  "Broken Road": "Road Worker",
  "Footpath Damage": "Road Worker",

  // 🌳 Garden-related
  "Tree Damage": "Gardener",
  "Park Maintenance": "Gardener",
  "Fallen Tree": "Gardener",

  // 🚗 Vehicle/Traffic-related
  "Abandoned Vehicle": "Traffic Officer",
  "Traffic Signal Issue": "Traffic Officer",
  "Illegal Parking": "Traffic Officer",
  "Road Blockage": "Traffic Officer",
  "Accident": "Traffic Officer",

};

// ✅ Helper function to check if staff matches complaint type
function matchesProfession(staff, complaint) {
  if (!staff.profession || !complaint.type) return false;

  const profession = staff.profession.toLowerCase();
  const type = complaint.type.toLowerCase();

  // ✅ Flexible keyword-based rules
  const professionKeywords = {
    electrician: ["electric", "power", "light", "wiring"],
    plumber: ["water", "pipe", "drain", "leak"],
    cleaner: ["garbage", "waste", "sanitation", "trash", "debris"],
    roadworker: ["road", "pothole", "footpath"],
    gardener: ["tree", "park", "garden", "plant"],
  };

  // Match profession name directly
  if (professionKeywords[profession]) {
    return professionKeywords[profession].some(keyword =>
      type.includes(keyword)
    );
  }

  // Also allow explicit map fallbacks (if you defined earlier)
  const expectedProfession = typeToProfessionMap[complaint.type];
  if (expectedProfession) {
    return expectedProfession.toLowerCase() === profession;
  }

  return false;
}


// -----------------------
// 📸 Multer setup for image upload
// -----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/complaints");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
};

const upload = multer({ storage, fileFilter });
exports.uploadComplaintImage = upload.single("image");

// ============================================================
// 🧍 Citizen: Create Complaint (Auto-Assign by Profession + City)
// ============================================================
exports.createComplaint = async (req, res) => {
  try {
    console.log("👤 Authenticated user:", req.user);
    let { title, description, type, priority, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    // 🗺️ Parse location if sent as JSON string
    if (typeof location === "string") {
      try {
        location = JSON.parse(location);
      } catch (err) {
        console.warn("Invalid location JSON:", err);
        location = {};
      }
    }

    // 🧩 Find matching staff automatically
    let assignedStaff = null;
    if (type && location?.city) {
      assignedStaff = await User.findOne({
        role: "staff",
        profession: { $regex: new RegExp(type, "i") },
        city: location.city,
      });
    }

    // 🧾 Build new complaint document
    const complaint = new Complaint({
      title,
      description,
      type,
      priority: priority || "LOW",
      location,
      reporter: req.user._id,
      assignedTo: assignedStaff ? assignedStaff._id : null,
      status: assignedStaff ? "IN_PROGRESS" : "OPEN",
      statusHistory: [
        {
          status: assignedStaff ? "IN_PROGRESS" : "OPEN",
          updatedBy: req.user._id,
          notes: assignedStaff ? "Auto-assigned to matching staff" : "Complaint created",
        },
      ],
    });

    // 📎 Attach image if uploaded
    if (req.file) {
      const imagePath = `/uploads/complaints/${req.file.filename}`;
      complaint.attachments = [imagePath];
    }

    await complaint.save();

    res.status(201).json({
      message: assignedStaff
        ? `Complaint auto-assigned to ${assignedStaff.fullName} (${assignedStaff.profession})`
        : "Complaint created successfully (awaiting staff assignment)",
      complaint,
    });
  } catch (error) {
    console.error("❌ Error creating complaint:", error);
    res.status(500).json({ message: "Failed to create complaint", error: error.message });
  }
};

// ============================================================
// 📋 Get All Complaints (role-based visibility)
// ============================================================
// 📋 Get All Complaints (role-based visibility)
// ============================================================
// ============================================================
// 📋 Get All Complaints (role-based visibility)
// ============================================================
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, priority, type, city, search } = req.query;
    const query = {};

    console.log("👤 Authenticated user:", req.user.fullName, "| Role:", req.user.role, "| City:", req.user.city);

    // 🧠 Role-based visibility
    if (req.user.role?.toLowerCase() === "admin") {
      if (req.user.city) query["location.city"] = new RegExp(req.user.city, "i");
    } 
    else if (req.user.role?.toLowerCase() === "staff") {
      // Staff can see their assigned + same-city complaints
      query.$or = [
        { assignedTo: req.user._id },
        { "location.city": new RegExp(req.user.city, "i") },
      ];
    } 
    else if (req.user.role?.toLowerCase() === "citizen" || req.user.role?.toLowerCase() === "user") {
      query.reporter = req.user._id;
    }

    // 🧩 Apply optional filters
    if (status) query.status = new RegExp(status, "i");
    if (priority) query.priority = new RegExp(priority, "i");
    if (type) query.type = new RegExp(type, "i");
    if (city) query["location.city"] = new RegExp(city, "i");
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    console.log("🔍 Complaint Query Used:", JSON.stringify(query, null, 2));

    const complaints = await Complaint.find(query)
      .populate("assignedTo", "fullName email profession city")
      .populate("reporter", "fullName email city")
      .sort({ createdAt: -1 });

    console.log("🟢 Complaints Found:", complaints.length);

    res.status(200).json(complaints);
  } catch (error) {
    console.error("❌ Error fetching complaints:", error.message);
    res.status(500).json({ message: "Failed to load complaints", error: error.message });
  }
};



// ============================================================
// 📊 Get Complaint Stats
// ============================================================
exports.getComplaintStats = async (req, res) => {
  try {
    const query = {};
    if (req.query.city) query["location.city"] = new RegExp(req.query.city, "i");
    else if (req.user.role === "Admin" && req.user.city)
      query["location.city"] = new RegExp(req.user.city, "i");

    console.log("📊 Complaint Stats Query:", query);

    const total = await Complaint.countDocuments(query);
    const open = await Complaint.countDocuments({ ...query, status: /^OPEN$/i });
    const inProgress = await Complaint.countDocuments({ ...query, status: /^IN_PROGRESS$/i });
    const completed = await Complaint.countDocuments({ ...query, status: /^RESOLVED$/i });
    const overdue = await Complaint.countDocuments({
      ...query,
      dueAt: { $lt: new Date() },
      status: { $ne: "RESOLVED" },
    });

    console.log("✅ Complaint Stats:", { total, open, inProgress, completed, overdue });

    res.status(200).json({ total, open, inProgress, completed, overdue });
  } catch (error) {
    console.error("❌ Error fetching complaint stats:", error.message);
    res.status(500).json({ message: "Failed to load complaint stats" });
  }
};

// ============================================================
// 📋 Get Complaint by ID
// ============================================================
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("reporter", "fullName email city")
      .populate("assignedTo", "fullName email profession city");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Access control
    if (
      req.user.role === "citizen" &&
      !complaint.reporter._id.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "staff" &&
      !complaint.assignedTo?._id?.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "You can only access your assigned complaints" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("❌ Error getting complaint:", error);
    res.status(500).json({ message: "Failed to fetch complaint", error: error.message });
  }
};

// ============================================================
// 🧑‍⚖️ Admin: Assign Complaint
// ============================================================
exports.assignComplaint = async (req, res) => {
  try {
    const { staffId, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff")
      return res.status(400).json({ message: "Invalid staff member" });

    // Ensure same city
    if (complaint.location?.city && staff.city !== complaint.location.city) {
      return res.status(400).json({
        message: `Staff must be in the same city (${complaint.location.city}) as the complaint.`,
      });
    }

    // Ensure matching profession
    // ✅ Check if staff profession matches complaint type using mapping
if (!matchesProfession(staff, complaint)) {
  return res.status(400).json({
    message: `Staff profession (${staff.profession}) not suitable for complaint type (${complaint.type}).`,
  });
}


    complaint.assignedTo = staff._id;
    complaint.assignmentHistory.push({
      assignedTo: staff._id,
      assignedBy: req.user._id,
      notes,
    });
    complaint.status = "IN_PROGRESS";
    complaint.statusHistory.push({
      status: "IN_PROGRESS",
      updatedBy: req.user._id,
      notes: "Assigned manually by admin",
    });

    await complaint.save();
    res.json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    console.error("❌ Error assigning complaint:", error);
    res.status(500).json({ message: "Failed to assign complaint", error: error.message });
  }
};

// ============================================================
// 🧑‍💼 Staff: Update Complaint Status
// ============================================================
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (req.user.role === "staff" && !complaint.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only update your assigned complaints" });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      notes,
    });

    if (status === "RESOLVED") complaint.resolvedAt = new Date();

    await complaint.save();
    res.json({ message: "Complaint status updated successfully", complaint });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
};

// ============================================================
// 🧑‍⚖️ Admin: Update Complaint
// ============================================================
exports.updateComplaint = async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Complaint not found" });

    res.json({ message: "Complaint updated successfully", complaint: updated });
  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
};

// ============================================================
// 🧑‍⚖️ Admin: Delete Complaint
// ============================================================
exports.deleteComplaint = async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Complaint not found" });

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting complaint:", error);
    res.status(500).json({ message: "Failed to delete complaint", error: error.message });
  }
};
// Get simplified complaints data for heatmap (public route)
exports.getHeatmapData = async (req, res) => {
  try {
    const complaints = await Complaint.find(
      { "location.coordinates.coordinates": { $exists: true, $ne: [] } },
      {
        location: 1,
        city: 1,
        status: 1,
        createdAt: 1,
        slaHours: 1,
        dueAt: 1,
      }
    );

    const formatted = complaints
      .map((c) => {
        const coords = c.location?.coordinates?.coordinates; // <-- FIXED HERE
        if (!coords || coords.length < 2) return null;

        return {
          lat: coords[1], // GeoJSON = [lng, lat]
          lng: coords[0],
          city: c.location?.city || c.city || "Unknown",
          status: c.status,
          createdAt: c.createdAt,
          slaHours: c.slaHours || null,
          overdue: c.dueAt ? new Date() > new Date(c.dueAt) : false,
        };
      })
      .filter(Boolean);

    if (formatted.length === 0) {
      console.log("⚠️ No complaint data found for heatmap");
    }

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error loading heatmap data:", err);
    res.status(500).json({ message: "Failed to load heatmap data" });
  }
};
// server/controller/complaint.js
// ✅ Add this new function at the bottom or near others


