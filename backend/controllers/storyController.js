// controllers/storyController.js
const fs = require("fs");
const fsPromises = fs.promises;
const os = require("os");
const path = require("path");
const { createCanvas } = require("canvas");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const cloudinary = require("../config/cloudinary"); // your configured cloudinary instance
const Diary = require("../models/DiaryEntry");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const gTTS = require("gtts");
const { randomUUID } = require("crypto");
const StoryVideo = require("../models/StoryVideo");

dayjs.extend(utc);
ffmpeg.setFfmpegPath(ffmpegPath);

// ----------------------
// Helpers: drawing, wrap
// ----------------------
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ----------------------
// Frame renderer
// ----------------------
async function renderFrame(text, date, index, width = 1280, height = 720) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#e8fbe8");
  g.addColorStop(1, "#ffffff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = "#16a34a";
  ctx.fillRect(0, 0, width, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 30px sans-serif";
  ctx.fillText(date, 40, 50);

  // Story box
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 60, 120, width - 120, 420, 20);
  ctx.fill();

  ctx.font = "700 28px sans-serif";
  ctx.fillStyle = "#0f172a";
  const lines = wrapText(ctx, text, width - 180);
  let y = 170;
  const lineHeight = 36;
  for (let i = 0; i < lines.length && i < 12; i++) {
    ctx.fillText(lines[i], 80, y);
    y += lineHeight;
  }

  // Footer
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Made with ❤️ Moofli Diary", 80, height - 40);

  // Save to tmp
  const framePath = path.join(os.tmpdir(), `moofli_frame_${Date.now()}_${index}.png`);
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(framePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", resolve);
    out.on("error", reject);
  });

  return framePath;
}

// ----------------------
// Create short mp4 clip from single image
// ----------------------
function imageToClip(imagePath, outPath, durationSec = 4) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      // correct usage: separate tokens
      .inputOptions(["-loop", "1"])
      .outputOptions([
        "-c:v", "libx264",
        "-t", String(durationSec),
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1280:720"
      ])
      .on("end", () => resolve(outPath))
      .on("error", (err) => reject(err))
      .save(outPath);
  });
}

// ----------------------
// Concatenate clips via concat demuxer (requires same codec/params)
// ----------------------
function concatClips(listFilePath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFilePath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c", "copy"])
      .on("end", () => resolve(outPath))
      .on("error", (err) => reject(err))
      .save(outPath);
  });
}

// ----------------------
// Merge video and audio (re-encode audio to aac if needed)
// ----------------------
function muxAudioVideo(videoPath, audioPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        "-c:v", "copy",
        "-c:a", "aac",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest"
      ])
      .on("end", () => resolve(outPath))
      .on("error", (err) => reject(err))
      .save(outPath);
  });
}

// ----------------------
// Main controller
// ----------------------
exports.generateStoryVideo = async (req, res) => {
  // NOTE: expects cloudinary to be configured and Diary model present.
  try {
    const userId = req.body.userId || (req.user && req.user._id);
    if (!userId) return res.status(400).json({ message: "userId required" });

    const entries = await Diary.find({ userId }).sort({ createdAt: 1 });
    if (!entries || entries.length === 0) {
      return res.status(400).json({ message: "No diary entries found" });
    }

    // Build scenes (limit to last 10 to keep video short)
    const scenes = entries.slice(-10).map(e => ({
      date: dayjs.utc(e.createdAt).format("YYYY-MM-DD"),
      text: e.content.trim()
    }));

    // Render PNG frames
    const framePaths = [];
    for (let i = 0; i < scenes.length; i++) {
      const fp = await renderFrame(scenes[i].text, scenes[i].date, i);
      framePaths.push(fp);
    }

    // Generate narration mp3 using gTTS
    const narrationText = scenes.map(s => `${s.date}. ${s.text}`).join(". ");
    const voicePath = path.join(os.tmpdir(), `moofli_voice_${Date.now()}.mp3`);
    await new Promise((resolve, reject) => {
      const gtts = new gTTS(narrationText, "en");
      gtts.save(voicePath, (err) => (err ? reject(err) : resolve()));
    });

    // Create short clips from frames
    const interDir = path.join(os.tmpdir(), `moofli_inter_${Date.now()}`);
    await fsPromises.mkdir(interDir, { recursive: true });
    const clipPaths = [];
    for (let i = 0; i < framePaths.length; i++) {
      const outClip = path.join(interDir, `clip_${i}.mp4`);
      // each clip 4 seconds
      await imageToClip(framePaths[i], outClip, 4);
      clipPaths.push(outClip);
    }

    // Build concat list file
    const concatListPath = path.join(interDir, "concat_list.txt");
    const concatContent = clipPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
    await fsPromises.writeFile(concatListPath, concatContent, "utf8");

    // Concat into single video (container copy)
    const concatOut = path.join(interDir, `concat_${Date.now()}.mp4`);
    await concatClips(concatListPath, concatOut);

    // Merge narration audio with video
    const finalTmp = path.join(os.tmpdir(), `moofli_final_${Date.now()}.mp4`);
    await muxAudioVideo(concatOut, voicePath, finalTmp);

    // Upload to Cloudinary (large upload)
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        finalTmp,
        { resource_type: "video", folder: "moofli_stories" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });

    // Cleanup - best-effort
    try {
      for (const fp of framePaths) if (fs.existsSync(fp)) fs.unlinkSync(fp);
      for (const cp of clipPaths) if (fs.existsSync(cp)) fs.unlinkSync(cp);
      if (fs.existsSync(concatOut)) fs.unlinkSync(concatOut);
      if (fs.existsSync(finalTmp)) fs.unlinkSync(finalTmp);
      if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
      // remove intermediate dir
      try { await fsPromises.rmdir(interDir); } catch (e) { }
    } catch (e) {
      // ignore cleanup errors
    }

    await StoryVideo.create({
      userId,
      videoUrl: uploadResult.secure_url
    });

    return res.json({ message: "done", videoUrl: uploadResult.secure_url });

  } catch (err) {
    console.error("Story generation error:", err);
    return res.status(500).json({ message: "Server error while generating story", details: err.message });
  }
};


exports.getUserVideos = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const videos = await StoryVideo.find({ userId }).sort({ createdAt: -1 });

    res.json({ videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching videos" });
  }
};


exports.getUserVideos = async (req, res) => {
  try {
    const { userId, page = 1, limit = 5 } = req.query;

    if (!userId) return res.status(400).json({ message: "userId required" });

    const skip = (page - 1) * limit;

    const videos = await StoryVideo.find({ userId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await StoryVideo.countDocuments({ userId });

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching videos" });
  }
};


exports.renameVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updated = await StoryVideo.findByIdAndUpdate(id, { title }, { new: true });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not rename video" });
  }
};


exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    await StoryVideo.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete video" });
  }
};
