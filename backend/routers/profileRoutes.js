const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateProfile,
  changePassword,
  updateProfilePicture,
  getMyProfile,
} = require("../controllers/profileController");

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/update-picture", protect, updateProfilePicture);

module.exports = router;
