const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message:
          "Authentication service is not properly configured.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while logging in.",
    });
  }
}




async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while retrieving your account.",
    });
  }
}




async function googleLogin(req, res) {
  try {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_CALLBACK_URL
    ) {
      console.error(
        "Google OAuth environment variables are not configured."
      );

      return res.status(500).json({
        message:
          "Google authentication is not properly configured.",
      });
    }

    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",

      scope: [
        "openid",
        "email",
        "profile",
      ],

      prompt: "select_account",
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error(
      "Google OAuth start error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while starting Google sign-in.",
    });
  }
}

async function googleCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message:
          "Google authorization code is missing.",
      });
    }

    const { tokens } =
      await googleClient.getToken(code);

    if (!tokens.id_token) {
      return res.status(401).json({
        message:
          "Google did not return a valid identity token.",
      });
    }

    googleClient.setCredentials(tokens);

    const ticket =
      await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message:
          "Unable to verify Google account.",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      email_verified: emailVerified,
    } = payload;

    if (!googleId || !email) {
      return res.status(400).json({
        message:
          "Google account did not provide the required information.",
      });
    }

    if (!emailVerified) {
      return res.status(403).json({
        message:
          "Your Google email address has not been verified.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    let user = await User.findOne({
      $or: [
        { googleId },
        { email: normalizedEmail },
      ],
    });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        password: null,
        googleId,
        authProvider: "google",
        emailVerified: true,
        role: "user",
      });
    } else {
      if (
        user.authProvider === "local" &&
        !user.googleId
      ) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Please sign in using your email and password.",
        });
      }

      if (
        user.googleId &&
        user.googleId !== googleId
      ) {
        return res.status(409).json({
          message:
            "This email is already associated with another Google account.",
        });
      }

      user.googleId = googleId;
      user.authProvider = "google";
      user.emailVerified = true;

      if (name && !user.name) {
        user.name = name;
      }

      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message:
          "Authentication service is not properly configured.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Google login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while signing in with Google.",
    });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  getMe,
  googleLogin,
  googleCallback,
};
