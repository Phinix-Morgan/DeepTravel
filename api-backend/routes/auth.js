const express = require("express");

const {
  register,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.get(
  "/verify-email/:token",
  verifyEmail
);

module.exports = router;
