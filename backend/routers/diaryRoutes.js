const express = require("express");
const router = express.Router();
const {
  createDiary,
  getAllDiaries,
  getDiaryById,
  updateDiary,
  deleteDiary,
  getCalendarData,
  getDiaryStats,
  getDiaryParagraph,
} = require("../controllers/diaryController");
const upload = require('../middleware/upload'); 

// Base path: /api/diary

router.get("/calendar", getCalendarData); 
router.get("/stats", getDiaryStats);
router.get("/paragraph", getDiaryParagraph);

router.get("/", getAllDiaries);
router.get("/:id", getDiaryById);
router.delete("/:id", deleteDiary);
router.post('/', upload.array('images', 5), createDiary);
router.put('/:id', upload.array('images', 5), updateDiary);

module.exports = router;
