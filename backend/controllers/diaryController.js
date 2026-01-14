const Diary = require("../models/DiaryEntry");
const User = require("../models/User");
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const dayjs = require('dayjs'); 
const utc = require('dayjs/plugin/utc'); 
dayjs.extend(utc); 

// Helper function to upload from buffer
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "moofli_diary" }, // Optional: organize in a folder
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


// 🟢 CREATE new diary (Updated)
exports.createDiary = async (req, res) => {
  try {
    const { title, content, mood, userId } = req.body;
    const files = req.files; // From multer

    if (!title || !content || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Upload images to Cloudinary
    let uploadedImages = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(result => ({ url: result.secure_url }));
    }

    // 2. Create diary with Cloudinary URLs
    const diary = await Diary.create({
      title,
      content,
      mood: mood || "neutral",
      images: uploadedImages, // Save the array of { url: "..." }
      userId,
    });

    res.status(201).json({ message: "Diary entry created", diary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating diary" });
  }
};


// 🟡 READ all diaries for a user
exports.getAllDiaries = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res.status(400).json({ message: "userId is required in query" });

    const diaries = await Diary.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(diaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching diaries" });
  }
};

// 🔵 READ one diary
exports.getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

    res.status(200).json(diary);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching diary" });
  }
};

// 🟣 UPDATE diary
exports.updateDiary = async (req, res) => {
  try {
    const { title, content, mood, existingImages } = req.body;
    const newFiles = req.files; // New files from multer

    let parsedExistingImages = [];
    if (existingImages) {
      parsedExistingImages = JSON.parse(existingImages);
    }
    
    // 1. Upload *new* images
    let newUploadedImages = [];
    if (newFiles && newFiles.length > 0) {
      const uploadPromises = newFiles.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      newUploadedImages = results.map(result => ({ url: result.secure_url }));
    }

    // 2. Combine old and new images
    const allImages = [...parsedExistingImages, ...newUploadedImages];

    // 3. Update the diary
    const updated = await Diary.findByIdAndUpdate(
      req.params.id,
      { title, content, mood, images: allImages },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Diary not found" });

    res.status(200).json({ message: "Diary updated", diary: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error while updating diary" });
  }
};

// 🔴 DELETE diary
exports.deleteDiary = async (req, res) => {
  try {
    const deleted = await Diary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Diary not found" });

    res.status(200).json({ message: "Diary deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error while deleting diary" });
  }
};


exports.getCalendarData = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    if (!userId || !month || !year) {
      return res.status(400).json({ message: "userId, month, and year are required" });
    }

    // 1. Create date range for the requested month (in UTC)
    const startDate = dayjs.utc(`${year}-${parseInt(month) + 1}-01`).startOf('month');
    const endDate = startDate.endOf('month');

    // 2. Find all entries for that user within that month
    const diaries = await Diary.find({
      userId,
      createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    }).select('createdAt');

    // 3. Get unique days (in UTC)
    const completedDays = new Set(
      diaries.map(diary => dayjs.utc(diary.createdAt).date())
    );

    res.status(200).json(Array.from(completedDays));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching calendar data" });
  }
};

// 🌟 NEW: GET USER STREAK & STATS
exports.getDiaryStats = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 1. Get all entries, sorted by date (newest first)
    const entries = await Diary.find({ userId }).select('createdAt').sort({ createdAt: -1 });
    if (entries.length === 0) {
      return res.status(200).json({ streakCount: 0, xpCount: 0 });
    }

    // 2. Get unique dates (YYYY-MM-DD format)
    const uniqueDays = new Set(
        entries.map(entry => dayjs.utc(entry.createdAt).format('YYYY-MM-DD'))
    );

    let streakCount = 0;
    let today = dayjs.utc();
    let yesterday = today.subtract(1, 'day');

    // 3. Check if today or yesterday is the last entry
    // (Allows streak to continue if they write at 11 PM and check at 1 AM)
    if (uniqueDays.has(today.format('YYYY-MM-DD')) || uniqueDays.has(yesterday.format('YYYY-MM-DD'))) {
      
      // If last entry was today, start streak at 1
      if (uniqueDays.has(today.format('YYYY-MM-DD'))) {
        streakCount = 1;
        // Start checking from yesterday
        let dayToCompare = yesterday;
        
        while (uniqueDays.has(dayToCompare.format('YYYY-MM-DD'))) {
          streakCount++;
          dayToCompare = dayToCompare.subtract(1, 'day');
        }
      }
      
      // If last entry was yesterday, start streak at 1
      // (This logic handles the case where they *only* wrote yesterday)
      if (streakCount === 0 && uniqueDays.has(yesterday.format('YYYY-MM-DD'))) {
          streakCount = 1;
          // Start checking from 2 days ago
          let dayToCompare = yesterday.subtract(1, 'day');
          
          while (uniqueDays.has(dayToCompare.format('YYYY-MM-DD'))) {
            streakCount++;
            dayToCompare = dayToCompare.subtract(1, 'day');
          }
      }
    }
    
    // TODO: Calculate XP (e.g., 10 XP per entry)
    const xpCount = entries.length * 10; 

    res.status(200).json({ streakCount, xpCount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};


//function to get the dairy into single paragraph with timelines for creating story

exports.getDiaryParagraph = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const entries = await Diary.find({ userId }).sort({ createdAt: 1 });

    if (entries.length === 0) {
      return res.status(200).json({ paragraph: "" });
    }

    const formatted = entries
      .map(diary => {
        const date = dayjs(diary.createdAt).format("YYYY-MM-DD");
        return `${date}: ${diary.content.trim()}`;
      })
      .join("\n");

    res.status(200).json({ paragraph: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while formatting diary paragraph" });
  }
};
