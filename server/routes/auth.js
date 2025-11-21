const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendVerificationCode = require("../utils/sendEmail");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// store verification codes in memory (you can use DB or Redis for production)
const verificationCodes = {};

// SIGNUP
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ firstName, lastName, email, password: hashedPassword });

    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };

    await sendVerificationCode(email, code);

    res.json({ msg: "Account created. Check your email for the code." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// VERIFY EMAIL
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  const record = verificationCodes[email];

  if (!record) return res.status(400).json({ msg: "No verification code found" });
  if (record.expires < Date.now()) return res.status(400).json({ msg: "Code expired" });
  if (record.code !== code) return res.status(400).json({ msg: "Invalid code" });

  await User.updateOne({ email }, { verified: true });
  delete verificationCodes[email];

  res.json({ msg: "Email verified successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });
    if (!user.verified) return res.status(400).json({ msg: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res
      .cookie("token", token, { httpOnly: true })
      .json({ user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ msg: "Logged out" });
});

// PROTECTED HOME
router.get("/home", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
