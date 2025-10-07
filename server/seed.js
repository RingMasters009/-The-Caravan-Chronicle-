/*
  Seed script to bootstrap Caravan Chronicle with sample users and complaints.

  Usage:
    node seed.js

  Make sure MongoDB is running and MONGODB_URI (or the default local URI)
  matches your environment. The script is idempotent: running it multiple times
  will update existing seed users/complaints instead of creating duplicates.
*/

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/user.model");
const { Complaint } = require("./models/Complaint");

const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CaravanOfChronicle";

const seedUsers = [
  {
    fullName: "Ariadne Starling",
    email: "admin@g.com",
    password: "123456",
    role: "Admin",
  },
  {
    fullName: "Bastian Weld",
    email: "staff@g.com",
    password: "123456",
    role: "Staff",
  },
  {
    fullName: "Lyra Fern",
    email: "user@g.com",
    password: "123456",
    role: "User",
  },
];

const makeDateHoursAgo = (hoursAgo) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date;
};

const seedComplaints = async (usersByEmail) => {
    const admin = usersByEmail.get("admin@g.com");
    const staff = usersByEmail.get("staff@g.com");
    const citizen = usersByEmail.get("user@g.com");

  const complaintPayloads = [
    {
      title: "Broken marquee lights near main entrance",
      description:
        "Primary light strip at the east gate flickers constantly after sunset and confuses visitors.",
      type: "Lighting",
      priority: "HIGH",
      status: "OPEN",
      reporter: citizen._id,
      slaHours: 24,
      location: {
        address: "East Gate, Wondervale Fairgrounds",
        city: "Wondervale",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [78.0421, 20.5937],
        },
      },
      statusHistory: [
        {
          status: "OPEN",
          updatedBy: citizen._id,
          updatedAt: makeDateHoursAgo(2),
          notes: "Issue observed during evening show entry rush.",
        },
      ],
      createdAt: makeDateHoursAgo(2),
      updatedAt: makeDateHoursAgo(2),
    },
    {
      title: "Overflowing waste bins behind food court",
      description:
        "Three bins behind the north food court have not been emptied since yesterday; area smells unpleasant.",
      type: "Garbage",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      reporter: citizen._id,
      assignedTo: staff._id,
      slaHours: 36,
      location: {
        address: "North Food Court Service Alley",
        city: "Wondervale",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [78.0504, 20.6002],
        },
      },
      assignmentHistory: [
        {
          assignedTo: staff._id,
          assignedBy: admin._id,
          notes: "Route sanitation crew after the evening show.",
          assignedAt: makeDateHoursAgo(20),
        },
      ],
      statusHistory: [
        {
          status: "OPEN",
          updatedBy: citizen._id,
          updatedAt: makeDateHoursAgo(22),
        },
        {
          status: "IN_PROGRESS",
          updatedBy: staff._id,
          updatedAt: makeDateHoursAgo(20),
          notes: "Crew dispatched with extra bags.",
        },
      ],
      createdAt: makeDateHoursAgo(22),
      updatedAt: makeDateHoursAgo(18),
    },
    {
      title: "Loose flooring plank in children's zone",
      description:
        "A wooden plank on the carousel queue is loose and could trip children waiting in line.",
      type: "Safety",
      priority: "CRITICAL",
      status: "ESCALATED",
      reporter: citizen._id,
      assignedTo: staff._id,
      slaHours: 12,
      escalationLevel: 1,
      location: {
        address: "Carousel Queue, Kids Adventure Zone",
        city: "Wondervale",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [78.0481, 20.5968],
        },
      },
      assignmentHistory: [
        {
          assignedTo: staff._id,
          assignedBy: admin._id,
          notes: "High priority—alert maintenance immediately.",
          assignedAt: makeDateHoursAgo(36),
        },
      ],
      statusHistory: [
        {
          status: "OPEN",
          updatedBy: citizen._id,
          updatedAt: makeDateHoursAgo(37),
        },
        {
          status: "IN_PROGRESS",
          updatedBy: staff._id,
          updatedAt: makeDateHoursAgo(35.5),
          notes: "Temporary barricade placed.",
        },
        {
          status: "ESCALATED",
          updatedBy: admin._id,
          updatedAt: makeDateHoursAgo(5),
          notes: "SLA breached; requires supervisor approval.",
        },
      ],
      createdAt: makeDateHoursAgo(37),
      updatedAt: makeDateHoursAgo(5),
    },
    {
      title: "Water leakage near performers’ lounge",
      description:
        "Ceiling drip above the costume prep area; water is pooling on the floor near electrical outlets.",
      type: "Water Leakage",
      priority: "HIGH",
      status: "RESOLVED",
      reporter: citizen._id,
      assignedTo: staff._id,
      slaHours: 18,
      location: {
        address: "Performers’ Lounge, Backstage Block B",
        city: "Wondervale",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [78.0455, 20.5983],
        },
      },
      assignmentHistory: [
        {
          assignedTo: staff._id,
          assignedBy: admin._id,
          notes: "Send plumbing duo Alpha.",
          assignedAt: makeDateHoursAgo(60),
        },
      ],
      statusHistory: [
        {
          status: "OPEN",
          updatedBy: citizen._id,
          updatedAt: makeDateHoursAgo(60.5),
        },
        {
          status: "IN_PROGRESS",
          updatedBy: staff._id,
          updatedAt: makeDateHoursAgo(60),
          notes: "Leak isolated, repair underway.",
        },
        {
          status: "RESOLVED",
          updatedBy: staff._id,
          updatedAt: makeDateHoursAgo(55),
          notes: "Pipe joint replaced and area dried.",
        },
      ],
      resolvedAt: makeDateHoursAgo(55),
      citizenFeedback: {
        rating: 5,
        comments: "Response was quick—thank you!",
        submittedAt: makeDateHoursAgo(50),
      },
      createdAt: makeDateHoursAgo(60.5),
      updatedAt: makeDateHoursAgo(50),
    },
  ];

  for (const payload of complaintPayloads) {
    await Complaint.findOneAndUpdate(
      { title: payload.title },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const upsertUsers = async () => {
  const usersByEmail = new Map();

  for (const user of seedUsers) {
    const existing = await User.findOne({ email: user.email });

    if (existing) {
      // Update role/fullName if they changed, but keep stored password.
      existing.fullName = user.fullName;
      existing.role = user.role;
      await existing.save();
      usersByEmail.set(user.email, existing);
      continue;
    }

    const created = await User.create(user);
    usersByEmail.set(user.email, created);
  }

  return usersByEmail;
};

const run = async () => {
  try {
    console.log("🚀 Connecting to", mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const usersByEmail = await upsertUsers();
    console.log("✅ Seed users ensured:", Array.from(usersByEmail.keys()));

    await seedComplaints(usersByEmail);
    console.log("✅ Sample complaints seeded");
  } catch (error) {
    console.error("❌ Seed failed", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected");
  }
};

run();
