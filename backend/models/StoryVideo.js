const mongoose = require("mongoose");

const StoryVideoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl: { type: String, required: true },
  title: { type: String, default: "" },
  template: { type: String, default: "basic" }, // NEW: animated template used
  dateRange: {
    from: { type: Date },
    to: { type: Date }
  }, // NEW: user-selected range
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StoryVideo", StoryVideoSchema);
