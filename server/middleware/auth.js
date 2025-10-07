const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT token from the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the header and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extract the token from the header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // 3. Find the user by the ID from the token and attach it to the request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // 4. If everything is valid, proceed to the next function (the controller)
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }

  next();
};

module.exports = { protect, requireRole };
