const express = require("express");
const router = express.Router();

const {
  generateStoryVideo,
  getUserVideos,
  renameVideo,
  deleteVideo
} = require("../controllers/storyController");

router.post("/generate", generateStoryVideo);
router.get("/videos", getUserVideos);
router.put("/rename/:id", renameVideo);
router.delete("/delete/:id", deleteVideo);

module.exports = router;
