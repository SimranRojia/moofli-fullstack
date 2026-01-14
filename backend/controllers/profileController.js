const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ------------------ GET PROFILE ------------------
exports.getMyProfile = async (req, res) => {
  res.json(req.user);
};

// ------------------ UPDATE NAME ------------------
exports.updateProfile = async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ message: "Username required" });

  const user = await User.findById(req.user._id);

  user.username = username;
  await user.save();

  res.json({
    message: "Profile updated",
    user,
  });
};

// ------------------ CHANGE PASSWORD ------------------
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  user.password = newPassword; // will be hashed automatically
  await user.save();

  res.json({ message: "Password changed successfully" });
};

// ------------------ PROFILE PICTURE ------------------
exports.updateProfilePicture = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl)
    return res.status(400).json({ message: "Image URL is required" });

  const user = await User.findById(req.user._id);
  user.profilePicture = imageUrl;
  await user.save();

  res.json({
    message: "Profile picture updated",
    profilePicture: imageUrl,
  });
};
