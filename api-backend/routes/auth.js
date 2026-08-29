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
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/register",
  register
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

router.post(
  "/login",
  login
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

router.get(
  "/me",
  authMiddleware,
  getMe
);

// Refresh access token
router.post(
  "/refresh",
  refreshAccessToken
);

// Logout
router.post(
  "/logout",
  logout
);

// Google OAuth
router.get(
  "/google",
  googleLogin
);

router.get(
  "/google/callback",
  googleCallback
);

// Protected admin test route
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
