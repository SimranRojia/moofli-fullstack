const SharedDiary = require("../models/SharedDiary");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "moofli_shared_diary" },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });

const assertParticipant = (diary, userId) => {
  const ok = diary.participants.some((p) => {
    if (!p) return false;
    // Handle cases: p is ObjectId, p is string, or p is populated object
    const pid = typeof p === "object" && p._id ? p._id.toString() : p.toString();
    return pid === userId.toString();
  });

  if (!ok) {
    const err = new Error("Not authorized: you're not a participant of this diary");
    err.statusCode = 403;
    throw err;
  }
};


exports.createSharedDiary = async (req, res) => {
    try {
        await User.syncIndexes();
        const { title, partnerEmail } = req.body;
        if (!title || !partnerEmail) {
            return res.status(400).json({ message: "title and partnerEmail are required" });
        }

        const partner = await User.findOne({ email: partnerEmail.toLowerCase() });
        if (!partner) return res.status(404).json({ message: "Partner user not found" });

        if (partner._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot create a shared diary with yourself" });
        }

        // Optional: prevent duplicates for same title and same pair (order-independent)
        const existing = await SharedDiary.findOne({
            title,
            participants: { $all: [req.user._id, partner._id] },
        });
        if (existing) {
            return res
                .status(409)
                .json({ message: "A shared diary with this partner and title already exists" });
        }

        const diary = await SharedDiary.create({
            title,
            participants: [req.user._id, partner._id],
            entries: [],
        });

        res.status(201).json(diary);
    } catch (e) {
        console.error(e);
        res.status(e.statusCode || 500).json({ message: e.message || "Server error" });
    }
};

exports.getMySharedDiaries = async (req, res) => {
    try {
        const diaries = await SharedDiary.find({ participants: req.user._id })
            .populate("participants", "username email profilePicture")
            .sort({ updatedAt: -1 });
        res.json(diaries);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getSharedDiaryById = async (req, res) => {
    try {
        const diary = await SharedDiary.findById(req.params.id).populate(
            "participants entries.author",
            "username email profilePicture"
        );
        if (!diary) return res.status(404).json({ message: "Diary not found" });
        assertParticipant(diary, req.user._id);
        res.json(diary);
    } catch (e) {
        console.error(e);
        res.status(e.statusCode || 500).json({ message: e.message || "Server error" });
    }
};

exports.addEntry = async (req, res) => {
    try {
        const diary = await SharedDiary.findById(req.params.id);
        if (!diary) return res.status(404).json({ message: "Diary not found" });
        assertParticipant(diary, req.user._id);

        const { content, mood } = req.body;
        if (!content && (!req.files || req.files.length === 0)) {
            return res.status(400).json({ message: "content or at least one image is required" });
        }

        let uploadedImages = [];
        if (req.files?.length) {
            const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer)));
            uploadedImages = results.map((r) => ({ url: r.secure_url }));
        }

        const entry = {
            author: req.user._id,
            content: content || "",
            mood: mood || "neutral",
            images: uploadedImages,
        };

        diary.entries.push(entry);
        diary.lastActivityAt = new Date();
        await diary.save();

        const populated = await SharedDiary.findById(diary._id).populate(
            "participants entries.author",
            "username email profilePicture"
        );

        res.status(201).json(populated);
    } catch (e) {
        console.error(e);
        res.status(e.statusCode || 500).json({ message: e.message || "Server error" });
    }
};

exports.updateEntry = async (req, res) => {
    try {
        const { id, entryId } = req.params;
        const diary = await SharedDiary.findById(id);
        if (!diary) return res.status(404).json({ message: "Diary not found" });
        assertParticipant(diary, req.user._id);

        const entry = diary.entries.id(entryId);
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        if (entry.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can edit only your own entries" });
        }

        const { content, mood, existingImages } = req.body;
        let parsedExistingImages = [];
        if (existingImages) {
            try {
                parsedExistingImages = JSON.parse(existingImages);
            } catch {
                return res.status(400).json({ message: "existingImages must be a JSON array" });
            }
        }

        let newUploadedImages = [];
        if (req.files?.length) {
            const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer)));
            newUploadedImages = results.map((r) => ({ url: r.secure_url }));
        }

        const allImages = [...parsedExistingImages, ...newUploadedImages];

        if (content !== undefined) entry.content = content;
        if (mood !== undefined) entry.mood = mood;
        entry.images = allImages;
        entry.editedAt = new Date();
        diary.lastActivityAt = new Date();

        await diary.save();

        const populated = await SharedDiary.findById(diary._id).populate(
            "participants entries.author",
            "username email profilePicture"
        );
        res.json(populated);
    } catch (e) {
        console.error(e);
        res.status(e.statusCode || 500).json({ message: e.message || "Server error" });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const { id, entryId } = req.params;
        const diary = await SharedDiary.findById(id);
        if (!diary) return res.status(404).json({ message: "Diary not found" });
        assertParticipant(diary, req.user._id);

        const entry = diary.entries.id(entryId);
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        if (entry.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can delete only your own entries" });
        }

        entry.remove();
        diary.lastActivityAt = new Date();
        await diary.save();

        res.json({ message: "Entry deleted" });
    } catch (e) {
        console.error(e);
        res.status(e.statusCode || 500).json({ message: e.message || "Server error" });
    }
};
