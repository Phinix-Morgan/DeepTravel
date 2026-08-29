const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/RefreshToken");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

function generateAccessToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

async function createRefreshToken(user) {
  const rawToken = generateRefreshToken();

  const tokenHash = hashRefreshToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRES_IN_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge:
      REFRESH_TOKEN_EXPIRES_IN_DAYS *
      24 *
      60 *
      60 *
      1000,
    path: "/api/auth",
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    path: "/api/auth",
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  createRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};