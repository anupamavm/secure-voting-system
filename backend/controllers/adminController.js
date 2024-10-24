const VoteEvent = require("../models/VoteEvent");
const User = require("../models/User");
const { encrypt } = require("./encryption"); // Import your encryption functions

// Create a new vote event (admin only)
exports.createVoteEvent = async (req, res) => {
	try {
		const { name, description, options, startTime, endTime } = req.body;

		// Check if the user is an admin
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied. Admins only." });
		}

		// Check if startTime and endTime are in the future
		const currentTime = new Date();
		const start = new Date(startTime);
		const end = new Date(endTime);

		// Validate that startTime and endTime are in the future
		if (start <= currentTime) {
			return res
				.status(400)
				.json({ message: "Start time must be in the future." });
		}
		if (end <= currentTime) {
			return res
				.status(400)
				.json({ message: "End time must be in the future." });
		}
		if (end <= start) {
			return res
				.status(400)
				.json({ message: "End time must be after the start time." });
		}

		// Create a new vote event
		const newVoteEvent = new VoteEvent({
			name,
			description,
			options: options.map((opt) => ({
				optionName: opt,
				votes: encrypt("0"), // Encrypt the initial vote count as "0"
			})),
			createdBy: req.user.id, // Admin's ID
			startTime: start,
			endTime: end,
		});

		// Save the vote event
		await newVoteEvent.save();

		res
			.status(201)
			.json({ message: "Vote event created successfully", newVoteEvent });
	} catch (error) {
		console.error("Error creating vote event:", error);
		res.status(500).json({ message: "Server error" });
	}
};
