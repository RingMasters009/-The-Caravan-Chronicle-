const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controller/user");
const { protect } = require("../middleware/auth");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard/citizen");
  }
);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", protect, userController.getMe);

module.exports = router;
