const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if the user is authenticated
exports.authenticate = (req, res, next) => {
	const token = req.headers["authorization"];
	if (!token) {
		return res
			.status(401)
			.json({ message: "No token provided, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};

// Middleware to check if the authenticated user is an admin
exports.isAdmin = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);
		if (user && user.role === "admin") {
			next();
		} else {
			return res.status(403).json({ message: "Access denied, admin only" });
		}
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};
