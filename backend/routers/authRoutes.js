const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Optional private route (if you later want to add “/me” endpoint)
router.post("/logout", logoutUser);

module.exports = router;
