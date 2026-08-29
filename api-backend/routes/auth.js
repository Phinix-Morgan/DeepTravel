const express = require("express");

const {
  register,
  verifyEmail,
  login,
  googleLogin,
  googleCallback,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/register", register);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post("/login", login);

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
