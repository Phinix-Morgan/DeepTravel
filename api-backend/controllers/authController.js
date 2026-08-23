const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      emailVerified: false,
      role: "user",
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await EmailVerification.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    const verificationUrl =
      `${req.protocol}://${req.get("host")}` +
      `/api/auth/verify-email/${rawToken}`;

    return res.status(201).json({
      message:
        "Account created successfully. Please verify your email.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        role: user.role,
      },

      verificationUrl,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while creating the account.",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const verification =
      await EmailVerification.findOne({
        tokenHash,
      });

    if (!verification) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    if (verification.expiresAt < new Date()) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    const user = await User.findById(
      verification.user
    );

    if (!user) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(404).json({
        message: "User account not found.",
      });
    }

    user.emailVerified = true;

    await user.save();

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while verifying your email.",
    });
  }
}

module.exports = {
  register,
  verifyEmail,
};
