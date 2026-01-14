const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware"); // use your existing protect
const upload = require("../middleware/upload");    // your existing multer config
const ctrl = require("../controllers/sharedDiaryController");

// Base path: /api/shared-diaries
router.use(protect);

router.post("/", ctrl.createSharedDiary);                     // { title, partnerEmail }
router.get("/", ctrl.getMySharedDiaries);
router.get("/:id", ctrl.getSharedDiaryById);

router.post("/:id/entries", upload.array("images", 5), ctrl.addEntry);
router.put("/:id/entries/:entryId", upload.array("images", 5), ctrl.updateEntry);
router.delete("/:id/entries/:entryId", ctrl.deleteEntry);

module.exports = router;
