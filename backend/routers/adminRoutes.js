const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// GET ALL USERS
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// DELETE USER
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User deleted" });
});

// MAKE USER AN ADMIN
router.put("/users/:id/make-admin", protect, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isAdmin = true;
  await user.save();

  res.json({ message: "User promoted to admin" });
});

module.exports = router;
