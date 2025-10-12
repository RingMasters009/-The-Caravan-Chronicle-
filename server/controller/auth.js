const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, city, profession, adminCode } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine user role:
    // - If no users exist, first registered user becomes Admin automatically.
    // - If "role" is provided, validate it properly.
    let finalRole = role || 'User';
    const userCount = await User.countDocuments({});

    if (userCount === 0) {
      finalRole = 'Admin';
    } else if (role === 'Admin') {
      // Only allow Admin creation with secret code
      if (adminCode !== process.env.ADMIN_CODE) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    // If registering as staff, profession is required
    if (finalRole === 'Staff' && !profession) {
      return res.status(400).json({ message: 'Profession is required for staff' });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      role: finalRole,
      city: city || null,
      profession: profession || null,
    });

    await user.save();

    // Generate JWT
    const token = user.generateAuthToken();

    // Return user data (excluding password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(', ') || 'Validation failed',
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    console.log("🟡 Login attempt received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, city: user.city },
      process.env.JWT_SECRET || "supersecretkey123",
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful:", user.email);
    res.json({ token, user });

  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==================== GET CURRENT USER ====================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
