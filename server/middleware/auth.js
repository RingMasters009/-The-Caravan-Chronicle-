const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // ✅ correct import

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized — user not found" });
    }

    req.user = user;
    console.log(
      `👤 Authenticated user: ${user.email || user.fullName || user._id}, Role: ${user.role}`
    );

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired — please log in again" });
    }

    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (
      req.user.role === "Admin" ||
      roles.map((r) => r.toLowerCase()).includes(req.user.role.toLowerCase())
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden — insufficient permissions for this route",
    });
  };
};

module.exports = { protect, requireRole };
