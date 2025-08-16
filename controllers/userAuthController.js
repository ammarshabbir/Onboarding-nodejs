const User = require('../models/user');
const bcrypt = require("bcryptjs");
const transporter = require("../config/email");
const jwt = require("jsonwebtoken"); // Add this at the top

require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    // Case 1: User exists and is verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const hashPassword = await bcrypt.hash(password, 10);

    let user;
    if (existingUser) {
      // Case 2: User exists but not verified → update OTP, password
      existingUser.name = name; // optional
      existingUser.password = hashPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
      user = existingUser;
    } else {
      // Case 3: Create new user
      user = new User({
        name,
        email,
        password: hashPassword,
        otp,
        otpExpires,
        isVerified: false,
      });
      await user.save();
    }

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your account",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(201).json({
      status: true,
      message: existingUser
        ? "You are not verified. OTP sent again. Please check your email."
        : "User registered successfully. Please verify your email.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      status: true,
      message: "Account verified successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        token,
      },
    });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const isExist = await User.findOne({ email });
    if (!isExist) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Update user with new OTP
    await User.findOneAndUpdate(isExist._id, { otp, otpExpires });

    // Send OTP Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your account",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(201).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Account not verified. Please check your email for verification instructions.",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      status: true,
      message: "Login Successfully",
      User: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes

    // Update OTP and expiration in DB
    await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpires });

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json({
      status: true,
      message: "OTP sent to your email for password reset",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create a short-lived reset token (valid for 15 min)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      resetToken, // frontend will use this to reset password
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.resendForgotOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const isExist = await User.findOne({ email });
    if (!isExist) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Update user with new OTP
    await User.findOneAndUpdate(
      { _id: isExist._id },
      { otp, otpExpires },
      { new: true } // optional, returns updated doc
    );
    // Send OTP Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your account",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Optional: Ensure the user already verified OTP before changing password
    if (!user.isVerified) {
      return res.status(400).json({ message: "OTP verification required before changing password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password & reset verification status
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password changed successfully. You can now log in with your new password.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


