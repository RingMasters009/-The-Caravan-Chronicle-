const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT token from the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the header and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Extract the token from the header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user by the ID from the token and attach it to the request object
      // We exclude the password from being attached.
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // 4. If everything is valid, proceed to the next function (the controller)
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

/**
 * Middleware to restrict access to certain roles (e.g., 'Admin').
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an Admin" });
  }
};

module.exports = { protect, isAdmin };
