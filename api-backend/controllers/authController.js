const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const RefreshToken = require("../models/RefreshToken");
const PasswordResetToken = require("../models/PasswordResetToken");

const {
  generateAccessToken,
  createRefreshToken,
  hashRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/authTokens");

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

    const accessToken = generateAccessToken(user);

    const refreshToken =
      await createRefreshToken(user);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful.",

      token: accessToken,

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
    const user = await User.findById(
      req.user.userId
    ).select("-password");

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
    const { OAuth2Client } = require(
      "google-auth-library"
    );

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    const authUrl =
      googleClient.generateAuthUrl({
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
    const { OAuth2Client } = require(
      "google-auth-library"
    );

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

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

    const accessToken =
      generateAccessToken(user);

    const refreshToken =
      await createRefreshToken(user);

    setRefreshTokenCookie(
      res,
      refreshToken
    );

    return res.status(200).json({
      message: "Google login successful.",

      token: accessToken,

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

async function refreshAccessToken(req, res) {
  try {
    const rawRefreshToken =
      req.cookies.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        message: "Refresh token required.",
      });
    }

    const tokenHash =
      hashRefreshToken(rawRefreshToken);

    const storedToken =
      await RefreshToken.findOne({
        tokenHash,
      });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token.",
      });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(401).json({
        message: "Refresh token has expired.",
      });
    }

    const user = await User.findById(
      storedToken.user
    );

    if (!user) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(404).json({
        message: "User account not found.",
      });
    }

    await RefreshToken.deleteOne({
      _id: storedToken._id,
    });

    const newAccessToken =
      generateAccessToken(user);

    const newRefreshToken =
      await createRefreshToken(user);

    setRefreshTokenCookie(
      res,
      newRefreshToken
    );

    return res.status(200).json({
      message:
        "Access token refreshed successfully.",
      token: newAccessToken,
    });
  } catch (error) {
    console.error(
      "Refresh token error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while refreshing the access token.",
    });
  }
}

async function logout(req, res) {
  try {
    const rawRefreshToken =
      req.cookies.refreshToken;

    if (rawRefreshToken) {
      const tokenHash =
        hashRefreshToken(rawRefreshToken);

      await RefreshToken.deleteOne({
        tokenHash,
      });
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    clearRefreshTokenCookie(res);

    return res.status(500).json({
      message:
        "Something went wrong while logging out.",
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const genericResponse = {
      message:
        "If an account with that email exists, a password reset link has been generated.",
    };

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether the account exists.
    if (!user) {
      return res.status(200).json(
        genericResponse
      );
    }

    // Google-only accounts do not have a local password.
    if (
      user.authProvider !== "local" ||
      !user.password
    ) {
      return res.status(200).json(
        genericResponse
      );
    }

    // Invalidate any previous reset tokens.
    await PasswordResetToken.deleteMany({
      user: user._id,
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    const resetUrl =
      `${req.protocol}://${req.get("host")}` +
      `/api/auth/reset-password/${rawToken}`;

    // Development-only response.
    // In production, this URL should be sent by email
    // instead of being returned by the API.
    return res.status(200).json({
      ...genericResponse,
      resetUrl,
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while processing the password reset request.",
    });
  }
}




async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Password reset token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await PasswordResetToken.findOne({
        tokenHash,
      });

    if (!resetToken) {
      return res.status(400).json({
        message: "Invalid or expired password reset token.",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return res.status(400).json({
        message: "Invalid or expired password reset token.",
      });
    }

    const user = await User.findById(
      resetToken.user
    );

    if (!user) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.authProvider = "local";
    user.emailVerified = true;

    await user.save();

    // Invalidate the reset token so it cannot be reused.
    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    // Revoke all existing refresh-token sessions.
    await RefreshToken.deleteMany({
      user: user._id,
    });

    return res.status(200).json({
      message:
        "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while resetting your password.",
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
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
