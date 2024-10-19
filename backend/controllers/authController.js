const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy"); // For 2FA
const qrcode = require("qrcode"); // For generating 2FA QR codes
const nodemailer = require("nodemailer"); // For sending emails

// Register a new user
exports.registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Check if the user already exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Create a new user
		const newUser = new User({
			username,
			email,
			password,
		});

		// Save the user to the database
		await newUser.save();

		// Generate 2FA secret
		const secret = speakeasy.generateSecret({
			name: `VotingApp (${newUser.email})`,
		});
		newUser.twoFactorSecret = secret.base32;
		newUser.twoFactorEnabled = true;

		// Send QR code for 2FA setup
		const qrCodeURL = await qrcode.toDataURL(secret.otpauth_url);

		// Save the updated user
		await newUser.save();

		// Return success and the QR code to the client
		res
			.status(201)
			.json({ message: "User registered successfully", qrCodeURL });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Login user
exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check if the password is correct
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check if two-factor authentication is enabled
		if (user.twoFactorEnabled) {
			return res
				.status(200)
				.json({
					message: "2FA required",
					twoFactorEnabled: true,
					userId: user._id,
				});
		}

		// Generate JWT token
		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		res.status(200).json({ message: "Logged in successfully", token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Verify 2FA token
exports.verifyTwoFactor = async (req, res) => {
	try {
		const { userId, token } = req.body;

		// Find the user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ message: "Invalid user" });
		}

		// Verify the 2FA token
		const verified = speakeasy.totp.verify({
			secret: user.twoFactorSecret,
			encoding: "base32",
			token,
		});

		if (!verified) {
			return res.status(400).json({ message: "Invalid 2FA token" });
		}

		// Generate JWT token
		const jwtToken = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		res.status(200).json({ message: "2FA verified", token: jwtToken });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
