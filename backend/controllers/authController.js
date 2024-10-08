const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Register new user (voter)
exports.registerUser = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const user = new User({ username, email, password });
		await user.save();
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(400).json({ error: "Error registering user" });
	}
};

// Login user and generate JWT
exports.loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user || !(await user.matchPassword(password))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});
		res.json({ token });
	} catch (error) {
		res.status(400).json({ error: "Error logging in" });
	}
};
