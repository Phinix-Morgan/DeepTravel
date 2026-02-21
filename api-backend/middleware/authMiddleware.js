const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Grab the token from the request header
  const token = req.header("Authorization");

  // 2. If there's no token at all, reject them
  if (!token) {
    return res.status(401).json({ msg: "Access Denied: No token provided" });
  }

  try {
    // 3. Remove "Bearer " if it's attached to the token string
    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // 4. Verify the token using your secret key
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // 5. Attach the decoded ID to the request so the next function can use it
    req.user = decoded.id;

    // Pass control to the next function (the VIP Lounge)
    next();
  } catch (err) {
    res.status(401).json({ msg: "Access Denied: Invalid token" });
  }
};
