const VoteEvent = require("../models/VoteEvent");

// Admin creates a new vote event
exports.createVoteEvent = async (req, res) => {
	try {
		const { title, description, options, startTime, endTime } = req.body;
		const adminId = req.user.id;

		// Check if the end time is after the start time
		if (new Date(startTime) >= new Date(endTime)) {
			return res
				.status(400)
				.json({ message: "End time must be after start time" });
		}

		// Create a new vote event
		const newVoteEvent = new VoteEvent({
			title,
			description,
			options,
			startTime,
			endTime,
			createdBy: adminId,
		});

		// Save the vote event
		await newVoteEvent.save();

		res.status(201).json({
			message: "Vote event created successfully",
			voteEvent: newVoteEvent,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
