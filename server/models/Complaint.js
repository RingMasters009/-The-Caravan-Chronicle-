const mongoose = require('mongoose');

const statusEnum = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];
const priorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const typeEnum = [
  // 👷 Civil / Roads
  'Road Damage',
  'Potholes',
  'Street Light Failure',

  // 💧 Plumbing / Water
  'Water Leakage',
  'Clogged Drain',
  'Broken Pipe',

  // ⚡ Electrical
  'Electric Shortage',
  'Lighting',
  'Power Outage',
  'Faulty Wiring',

  // 🚗 Vehicle / Traffic
  'Abandoned Vehicle',
  'Traffic Signal Issue',
  'Illegal Parking',
  'Road Blockage',

  // 🌳 Environment / Public Spaces
  'Tree Damage',
  'Park Maintenance',
  'Graffiti',
  'Vandalism',
  'Noise Complaint',
  'Air Quality',

  // 🏛️ Public Services
  'Street Cleaning',
  'Public Restroom Issue',
  'Waste Management',
  'Recycling Issue',
  'Animal Control',
  'Pest Control',
  'Water Supply Issue',
  'Sewage Issue',
  'Fire Hazard',
  'Health Hazard',
  

  // 🗑️ Sanitation / General
  'Garbage',
  'Safety',
  'Other',
];


const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: statusEnum,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: typeEnum,
      default: 'Other',
      required: true, // ✅ Ensure complaint always has a type (used for profession match)
    },
    priority: {
      type: String,
      enum: priorityEnum,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: statusEnum,
      default: 'OPEN',
    },
    attachments: [String],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignmentHistory: [assignmentSchema],
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'OPEN', updatedAt: new Date() }],
    },
    location: {
      address: String,
      city: {
        type: String,
        trim: true,
        required: true, // ✅ City is mandatory for assignment rule
      },
      state: String,
      postalCode: String,
      country: String,
      placeId: String,
      latitude: Number,
      longitude: Number,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: undefined,
        },
      },
    },
    slaHours: {
      type: Number,
      default: 48,
    },
    dueAt: Date,
    resolvedAt: Date,
    escalationLevel: {
      type: Number,
      default: 0,
    },
    citizenFeedback: {
      rating: Number,
      comments: String,
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 📍 Geospatial & performance indexes
complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ status: 1, priority: 1, type: 1, 'location.city': 1 });
complaintSchema.index({ createdAt: -1 });

// Automatically compute dueAt from SLA hours
complaintSchema.pre('save', function (next) {
  const baseDate = this.createdAt || new Date();
  if (!this.dueAt && this.slaHours) {
    this.dueAt = new Date(baseDate.getTime() + this.slaHours * 60 * 60 * 1000);
  }
  next();
});

module.exports = {
  Complaint: mongoose.model('Complaint', complaintSchema),
  COMPLAINT_STATUS: statusEnum,
  COMPLAINT_PRIORITY: priorityEnum,
  COMPLAINT_TYPES: typeEnum,
};
