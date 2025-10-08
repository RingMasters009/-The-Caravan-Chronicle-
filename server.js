// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const app = express();
// app.use(cors({
//   origin: "http://localhost:5173", 
//   methods: ["GET", "POST", "PATCH"]
// }));
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }
// mongoose.connect("mongodb://127.0.0.1:27017/complaintsDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const complaintSchema = new mongoose.Schema({
//   city: String,
//   country: String,
//   description: String,
//   lat: Number,
//   lng: Number,
//   status: { type: String, default: "open" },
//   createdAt: { type: Date, default: Date.now },
//   resolvedAt: Date,
//   slaHours: { type: Number, default: 48 },
//   photo: String,
// });

// const Complaint = mongoose.model("Complaint", complaintSchema);
// function isOverdue(complaint) {
//   if (!complaint) return false;
//   if (complaint.status === "resolved") return false;
//   const deadline = new Date(complaint.createdAt);
//   deadline.setHours(deadline.getHours() + (complaint.slaHours || 48));
//   return new Date() > deadline;
// }
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage });
// app.get("/api/complaints", async (req, res) => {
//   try {
//     const complaints = await Complaint.find({});
//     const result = complaints.map((c) => ({
//       ...c._doc,
//       overdue: isOverdue(c),
//     }));
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
// app.post("/api/complaints", upload.single("photo"), async (req, res) => {
//   try {
//     const { city, country, description, lat, lng } = req.body;
//     if (!description || !lat || !lng) {
//       return res.status(400).json({ error: "Description, lat and lng are required" });
//     }

//     const photo = req.file ? `/uploads/${req.file.filename}` : null;

//     const newComplaint = new Complaint({
//       city,
//       country,
//       description,
//       lat,
//       lng,
//       photo,
//     });

//     await newComplaint.save();
//     res.status(201).json(newComplaint);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
// app.patch("/api/complaints/:id/resolve", async (req, res) => {
//   try {
//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { status: "resolved", resolvedAt: new Date() },
//       { new: true }
//     );
//     if (!complaint) return res.status(404).json({ error: "Complaint not found" });
//     res.json(complaint);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err.stack);
//   res.status(500).json({ error: err.message });
// });
// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// server.js
const express = require('express');
const multer = require('multer'); // for file uploads
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // parse JSON
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// In-memory storage for simplicity
let complaints = [];

// GET all complaints
app.get('/api/complaints', (req, res) => {
  res.json(complaints);
});

// POST a complaint
app.post('/api/complaints', upload.single('photo'), (req, res) => {
  try {
    const { title, description, lat, lng } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    const complaint = {
      id: complaints.length + 1,
      title,
      description,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      city: "Unknown",    // optional: integrate with Geoapify reverse geocoding
      country: "Unknown",
      status: "open",
      slaHours: 48,
      createdAt: new Date(),
      overdue: false,
      photo: req.file ? req.file.filename : null
    };

    complaints.push(complaint);
    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
