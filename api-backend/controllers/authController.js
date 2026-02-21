const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    res.status(201).json({ msg: "Registered", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in user profile (Protected Route)
exports.getMe = async (req, res) => {
  try {
    // req.user contains the ID we extracted from the token in the middleware!
    // We use .select("-password") to ensure we NEVER send the password hash to the frontend
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in getMe:", err.message);
    res.status(500).send("Server Error");
  }
};

// Update user profile (Protected Route)
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, location } = req.body;

    // Find the user by the ID hidden inside their VIP token, and update their info
    // { new: true } tells MongoDB to send us back the UPDATED user, not the old one
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { username, email, bio, location },
      { new: true },
    ).select("-password"); // Never send the password back!

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).send("Server Error");
  }
};
