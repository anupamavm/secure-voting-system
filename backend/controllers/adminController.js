const VoteEvent = require("../models/VoteEvent");
const User = require("../models/User");

// Create a new vote event (admin only)
exports.createVoteEvent = async (req, res) => {
	try {
		const { name, description, options, startTime, endTime } = req.body;

		// Check if the user is an admin
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied. Admins only." });
		}

		// Create a new vote event
		const newVoteEvent = new VoteEvent({
			name,
			description,
			options: options.map((opt) => ({ optionName: opt })),
			createdBy: req.user.id, // Admin's ID
			startTime,
			endTime,
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
