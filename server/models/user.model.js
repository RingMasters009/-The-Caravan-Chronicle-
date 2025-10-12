const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  city: {
    type: String,
    trim: true, // optional — not required for backward compatibility
  },
profession: {
  type: String,
  enum: ["Electrician", "Plumber", "Cleaner", "Mechanic", "Other", null],
  default: null,
  validate: {
    validator: function (value) {
      // Allow null or undefined
      if (value === null || value === undefined) return true;
      // If role is Staff, require a valid profession
      if (this.role === "Staff") {
        return ["Electrician", "Plumber", "Cleaner", "Mechanic", "Other"].includes(value);
      }
      // If not Staff, ignore profession value
      return true;
    },
    message: (props) => `${props.value} is not a valid profession`,
  },
},

  role: {
    type: String,
    enum: ['User', 'Staff', 'Admin'],
    default: 'User',
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT (includes role, city, profession)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      city: this.city || null,
      profession: this.profession || null,
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1d' }
  );
};

const User = mongoose.model('User', userSchema);
module.exports = User;
