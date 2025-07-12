// backend/src/routes/Auth.forgotPassword.js
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user.models'); // Your User model
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Create the email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.FORGET_PASSWORD_EMAIL,
    pass: process.env.FORGET_PASSWORD_PASS,
  },
});

// Forget Password (Send Reset Email)
router.post('/', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1200000; // Token expires in 20 mins

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    // Send email
    const mailOptions = {
      from: process.env.FORGET_PASSWORD_EMAIL,
      to: user.email,
      subject: 'LabStockEase: Password Reset Request',
      html: `<p>You requested for password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// Validate Token
router.get('/reset-password/:token', async (req, res) => {
  try {
    console.log("RESET");
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ error: 'Error validating token' });
  }
});

// Update Password
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Store new password as plaintext (Not recommended)
    user.password = password;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating password' });
  }
});

module.exports = router;
