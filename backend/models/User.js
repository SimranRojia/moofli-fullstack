const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    googleId: { type: String, default: null },
    profilePicture: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

  },
  { timestamps: true }
);

// 🔹 Hash password before saving
userSchema.pre("save", async function (next) {
  // If user is Google user and no password provided, create one
  if (!this.password) {
    this.password = crypto.randomBytes(16).toString("hex"); // random password
  }

  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare passwords (for normal login)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 Static helper: find or create Google user
userSchema.statics.findOrCreateGoogleUser = async function (googleProfile) {
  // <-- CHANGED: Destructure 'picture' from the profile
  const { id, email, name, picture } = googleProfile;
  let user = await this.findOne({ email });

  if (!user) {
    // Create user with random password for Google auth
    const randomPassword = crypto.randomBytes(16).toString("hex");
    user = await this.create({
      username: name || email.split("@")[0],
      email,
      password: randomPassword,
      googleId: id,
      profilePicture: picture, // <-- NEW: Save the picture on creation
    });
  } else {
    // User already exists. Let's update their Google ID and picture,
    // just in case they are logging in with Google for the first time
    // or their picture has changed.
    user.googleId = id;
    if (!user.profilePicture) {
      user.profilePicture = picture;  // only set if no photo exists
    }
    await user.save();
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);