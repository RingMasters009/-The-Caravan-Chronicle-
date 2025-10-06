const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
mongoose.connect("mongodb://127.0.0.1:27017/complaintsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const complaintSchema = new mongoose.Schema({
  city: String,
  country: String,
  description: String,
  lat: Number,
  lng: Number,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  slaHours: { type: Number, default: 48 },
  photo: String,
});

const Complaint = mongoose.model("Complaint", complaintSchema);
function isOverdue(complaint) {
  if (!complaint) return false;
  if (complaint.status === "resolved") return false;
  const deadline = new Date(complaint.createdAt);
  deadline.setHours(deadline.getHours() + (complaint.slaHours || 48));
  return new Date() > deadline;
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find({});
    const result = complaints.map((c) => ({
      ...c._doc,
      overdue: isOverdue(c),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/complaints", upload.single("photo"), async (req, res) => {
  try {
    const { city, country, description, lat, lng } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const newComplaint = new Complaint({
      city,
      country,
      description,
      lat,
      lng,
      photo,
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
