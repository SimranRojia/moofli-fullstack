const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize the Google Auth client with your Client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generates a JSON Web Token for a given user ID.
 * @param {string} id - The user's MongoDB document ID.
 * @returns {string} - A signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// --- Standard Authentication ---

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with that email" });
    }

    // 3. Create new user (password will be hashed by 'pre-save' hook)
    const user = await User.create({ username, email, password });

    // 4. Generate token and send response
    const token = generateToken(user._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * @desc    Authenticate a user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check user and password
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate token and send response
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc    Logout user (dummy endpoint)
 * @route   POST /api/auth/logout
 * @access  Private (should be)
 */
exports.logoutUser = async (req, res) => {
  // Note: For JWT, logout is typically handled on the client-side
  // by deleting the token from localStorage or cookies.
  // This endpoint is often just for acknowledgment.
  try {
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Google OAuth ---

/**
 * @desc    Authenticate or register a user using a Google ID token
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
  try {
    // 1. Get the Google ID token from the request body
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // 2. Verify the token with Google's servers
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 3. Get the verified user data (payload) from the ticket
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google token did not provide an email" });
    }

    // 4. Find or create the user in your database
    const user = await User.findOrCreateGoogleUser({
      id: googleId,
      email: email,
      name: name,
      picture: picture,
    });

    // 5. Generate your application's own JWT token
    const appToken = generateToken(user._id);

    // 6. Send the token and user data back to the client
    res.status(200).json({
      message: "Google login successful",
      token: appToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error("Google Login Error:", err.message);
    
    // 4. Handle specific token verification errors
    if (err.message.includes("Invalid ID token") || err.message.includes("audience")) {
      return res.status(401).json({ message: "Invalid Google token" });
    }
    
    // 5. Handle all other errors
    res.status(500).json({ message: "Server error during Google login" });
  }
};

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     // Generate Reset Token
//     const token = crypto.randomBytes(32).toString("hex");

//     // Save token + expiry (1 hour)
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//     // Reset URL
//     const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

//     // Email Transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Email Template
//     const mailOptions = {
//       to: user.email,
//       from: `Moofli Diary <${process.env.EMAIL_USER}>`,
//       subject: "Reset Your Moofli Password",
//       html: `
//         <h2>Password Reset Requested</h2>
//         <p>Click the button below to reset your password:</p>
//         <a href="${resetURL}"
//           style="
//             display:inline-block;
//             background:#16a34a;
//             padding:10px 20px;
//             color:white;
//             border-radius:8px;
//             text-decoration:none;
//             margin:20px 0;
//           "
//         >
//           Reset Password
//         </a>
//         <p>This link is valid for 1 hour.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     return res.json({ message: "Password reset link sent!" });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: "Moofli Diary <support@moofli.co.in>",
    to: email,
    subject: "Moofli Password Reset",
    html: `
  <div style="font-family:Arial, sans-serif; color:#333; padding:20px; line-height:1.6;">
    
    <h2 style="color:#16a34a; margin-bottom:10px;">Moofli Password Reset Request</h2>

    <p>Hi there,</p>

    <p>
      We received a request to reset the password for your Moofli account.
      If you made this request, simply click the button below to choose a new password.
    </p>

    <div style="margin:30px 0;">
      <a href="${resetURL}"
        style="
          background:#16a34a;
          color:#fff;
          padding:12px 22px;
          border-radius:8px;
          text-decoration:none;
          font-size:16px;
          display:inline-block;
        "
      >
        Reset Your Password
      </a>
    </div>

    <p>
      This reset link will expire in <strong>1 hour</strong> for security reasons.
      If you did <strong>not</strong> request a password reset, you can safely ignore this email — 
      your account will remain secure.
    </p>

    <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;" />

    <p style="font-size:14px; color:#666;">
      Moofli Diary<br/>
      Your personal space to write, organize and grow.
    </p>

    <p style="font-size:13px; color:#999; margin-top:10px;">
      Need help? Contact us at 
      <a href="mailto:moofli.diary@gmail.com" style="color:#16a34a;">support@moofli.co.in</a>
    </p>

  </div>
  `,
  });

  res.json({ message: "Password reset email sent" });
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset link" });

    // Update password
    user.password = newPassword; // hashed by your pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({ message: "Password reset successful!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

