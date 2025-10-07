const mongoose = require('mongoose');

const statusEnum = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];
const priorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const typeEnum = ['Road Damage', 'Water Leakage', 'Garbage', 'Lighting', 'Safety', 'Other'];

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
      required: true,
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
      city: String,
      country: String,
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

complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ status: 1, priority: 1, type: 1, 'location.city': 1 });
complaintSchema.index({ createdAt: -1 });

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
