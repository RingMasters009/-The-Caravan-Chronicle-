const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controller/auth');
const { protect } = require('../middleware/auth');

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback',
	passport.authenticate('google', { failureRedirect: '/login', session: true }),
	(req, res) => {
		// Redirect to frontend after successful login
		res.redirect('http://localhost:3000/dashboard/citizen');
	}
);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, authController.getMe);

module.exports = router;
