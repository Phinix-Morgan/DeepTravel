const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // <--- 1. Import the Bouncer

// Your existing routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// <--- 2. Add the Protected VIP Route
// Notice how authMiddleware goes in the middle! It runs before getMe.
router.get("/me", authMiddleware, authController.getMe);

router.put("/profile", authMiddleware, authController.updateProfile);

module.exports = router;
