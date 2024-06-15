const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = crypto.randomBytes(3).toString('hex');
  const otpExpiry = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes

  const newUser = new User({ username, email, password: hashedPassword, otp, otpExpiry });
  await newUser.save();

  // Send OTP Email
  const transporter = nodemailer.createTransport({ /* SMTP Configuration */ });
  const mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}`,
  };
  transporter.sendMail(mailOptions);

  res.status(201).send('User registered. Check your email for OTP.');
});

// OTP-based login endpoint
router.post('/login', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp, otpExpiry: { $gte: new Date() } });

  if (user) {
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.status(200).json({ token });
  } else {
    res.status(401).send('Invalid or expired OTP');
  }
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
};

// Fetch user profile endpoint
router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.status(200).json(user);
});

// Update user profile endpoint
router.put('/profile', authenticate, async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user.userId, { username, email }, { new: true });
  res.status(200).json(user);
});

module.exports = router;
