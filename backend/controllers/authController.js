const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy"); // For 2FA
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

		// Save the updated user
		await newUser.save();

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Function to generate a 6-digit 2FA code
function generate2FACode() {
	const code = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
	return code.toString();
}

// Send 2FA code to user
async function send2FACode(userEmail, code) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: userEmail,
		subject: "Your 2FA Code",
		text: `Your 2FA code is: ${code}. This code will expire in 5 minutes.`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("2FA code sent to email:", userEmail);
	} catch (error) {
		console.error("Error sending 2FA code:", error);
	}
}

// Login user
exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid email credentials" });
		}

		// Check if the password is correct
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid password credentials" });
		}

		// Generate a 2FA code
		const twoFACode = generate2FACode();

		user.twoFACode = twoFACode;
		user.twoFACodeExpires = Date.now() + 300000; // Code expires in 5 minutes
		await user.save();

		// Send the 2FA code to the user's email
		await send2FACode(user.email, twoFACode);

		// Prompt the user to enter their 2FA code
		res.status(200).json({
			message: "2FA code sent to your email. Please enter the code.",
			twoFactorEnabled: true,
			userId: user._id,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.verifyTwoFactorEmailCode = async (req, res) => {
	console.log("Request received in verifyTwoFactorEmailCode");
	console.log("Request body:", req.body);

	try {
		const { userId, code } = req.body;

		console.log("Request body:", req.body);

		// Check if userId and code are provided
		if (!userId || !code) {
			console.log("Missing userId or code");
			return res.status(400).json({ message: "userId and code are required" });
		}

		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			console.log("Invalid user, userId not found:", userId);
			return res.status(400).json({ message: "Invalid user" });
		}

		// Check if the code matches and is not expired
		if (user.twoFACode !== code || user.twoFACodeExpires < Date.now()) {
			console.log("Invalid or expired 2FA code");
			return res.status(400).json({ message: "Invalid or expired 2FA code" });
		}

		// Generate a JWT token after successful 2FA verification
		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// Clear the 2FA code after successful verification
		user.twoFACode = undefined;
		user.twoFACodeExpires = undefined;
		await user.save();

		console.log("2FA verified, token generated:", token);

		res.status(200).json({ message: "2FA verified", token });
	} catch (error) {
		console.error("Error in verifyTwoFactorEmailCode:", error);
		res.status(500).json({ message: "Server error" });
	}
};
