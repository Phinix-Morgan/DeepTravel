const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message:
          "Authentication service is not properly configured.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Authentication token has expired.",
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "SyntaxError"
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while authenticating the request.",
    });
  }
}

module.exports = authMiddleware;
