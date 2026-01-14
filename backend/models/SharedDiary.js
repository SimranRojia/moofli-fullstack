const mongoose = require("mongoose");

const SharedDiaryEntrySchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true },
        mood: {
            type: String,
            enum: ["neutral", "happy", "sad", "angry", "anxious", "grateful", "excited"],
            default: "neutral",
        },
        images: [
            {
                url: { type: String },
                description: { type: String },
            },
        ],
        editedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const SharedDiarySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        participants: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
            validate: {
                validator(arr) {
                    return Array.isArray(arr) && arr.length === 2 && arr[0].toString() !== arr[1].toString();
                },
                message: "Shared diary must have exactly two distinct participants.",
            },
        },
        entries: [SharedDiaryEntrySchema],
        lastActivityAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

SharedDiarySchema.index({ participants: 1 });
SharedDiarySchema.index({ updatedAt: -1 });

module.exports = mongoose.model("SharedDiary", SharedDiarySchema);
