const express = require("express");

const {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  getMe,
  googleLogin,
  googleCallback,
  refreshAccessToken,
  logout,
  logoutAllSessions,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  authRateLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// --------------------------------------------------
// Registration & Email Verification
// --------------------------------------------------

router.post(
  "/register",
  authRateLimiter,
  register
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification",
  authRateLimiter,
  resendVerificationEmail
);

// --------------------------------------------------
// Local Authentication
// --------------------------------------------------

router.post(
  "/login",
  authRateLimiter,
  login
);

router.post(
  "/forgot-password",
  authRateLimiter,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  authRateLimiter,
  resetPassword
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

// --------------------------------------------------
// Current User
// --------------------------------------------------

router.get(
  "/me",
  authMiddleware,
  getMe
);

// --------------------------------------------------
// Refresh & Sessions
// --------------------------------------------------

router.post(
  "/refresh",
  refreshAccessToken
);

router.post(
  "/logout",
  logout
);

router.post(
  "/logout-all",
  authMiddleware,
  logoutAllSessions
);

// --------------------------------------------------
// Google OAuth
// --------------------------------------------------

router.get(
  "/google",
  authRateLimiter,
  googleLogin
);

router.get(
  "/google/callback",
  googleCallback
);

// --------------------------------------------------
// Protected Admin Test Route
// --------------------------------------------------

router.get(
  "/test-admin",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    return res.status(200).json({
      message: "Admin access granted.",
      user: req.user,
    });
  }
);

module.exports = router;
