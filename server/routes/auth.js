const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controller/user"); // ✅ use updated user controller
const { protect } = require("../middleware/auth");

// --- GOOGLE OAUTH LOGIN ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// --- GOOGLE OAUTH CALLBACK ---
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    // ✅ Redirect to frontend after successful login
    res.redirect("http://localhost:3000/dashboard/citizen");
  }
);

// --- REGISTER USER ---
// @route   POST /api/auth/register
// @desc    Register a new user (includes role, city, profession)
// @access  Public
router.post("/register", userController.register);

// --- LOGIN USER ---
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", userController.login);

// --- VERIFY EMAIL ---
// @route   POST /api/auth/verify-email
// @desc    Verify user's email with a token
// @access  Public
router.post("/verify-email", userController.verifyEmail);

// --- FORGOT PASSWORD ---
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", userController.forgotPassword);

// --- RESET PASSWORD ---
// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post("/reset-password", userController.resetPassword);

// --- GET CURRENT USER ---
// @route   GET /api/auth/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", protect, userController.getMe);

module.exports = router;
