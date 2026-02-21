const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    // req.user holds the ID we extracted in authMiddleware!
    const user = await User.findById(req.user);

    // If the user doesn't exist, or their role isn't "admin", kick them out
    if (!user || user.role !== "admin") {
      return res.status(403).json({ msg: "Access Denied: Admins Only" });
    }

    // If they ARE an admin, pass control to the next function
    next();
  } catch (err) {
    console.error("Admin middleware error:", err.message);
    res.status(500).json({ msg: "Server Error verifying admin status" });
  }
};
