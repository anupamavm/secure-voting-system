const Vote = require("../models/Vote");
const VoteEvent = require("../models/VoteEvent");

// Get all vote events
exports.getAllVoteEvents = async (req, res) => {
	try {
		// Fetch all vote events from the database
		const voteEvents = await VoteEvent.find();

		// Return the list of vote events
		res
			.status(200)
			.json({ message: "Vote events retrieved successfully", voteEvents });
	} catch (error) {
		console.error("Error retrieving vote events:", error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.castVote = async (req, res) => {
	console.log("User Info:", req.user); // Confirm user details

	try {
		const { optionIndex } = req.body;
		const eventId = req.params.eventId.trim(); // Ensure eventId is trimmed

		if (req.user.role === "admin") {
			return res
				.status(403)
				.json({ message: "Admins are not allowed to vote" });
		}

		const voteEvent = await VoteEvent.findById(eventId);
		if (!voteEvent) {
			return res.status(404).json({ message: "Vote event not found" });
		}

		const currentTime = new Date();
		console.log("Current Time:", currentTime);
		console.log("Voting Start Time:", voteEvent.startTime);
		console.log("Voting End Time:", voteEvent.endTime);

		// Check if the voting period is active
		if (currentTime < voteEvent.startTime || currentTime > voteEvent.endTime) {
			return res.status(400).json({ message: "Voting period is not active" });
		}

		if (optionIndex < 0 || optionIndex >= voteEvent.options.length) {
			return res.status(400).json({ message: "Invalid voting option index" });
		}

		const userId = req.user.id; // Change this line to access `id` instead of `_id`
		console.log("User ID:", userId); // Log the user ID

		// Check if the user has already voted
		const existingVote = await Vote.findOne({
			voteEvent: eventId,
			user: userId, // Now should correctly reference the user ID
		});

		if (existingVote) {
			return res
				.status(400)
				.json({ message: "You have already voted for this event" });
		}

		// Create a new vote
		const newVote = new Vote({
			voteEvent: eventId,
			user: userId, // Should now correctly reference the user ID
			choice: optionIndex,
		});

		console.log("New Vote Object:", newVote); // Log the new vote object

		await newVote.save(); // Save the new vote

		// Increment the vote count for the selected option
		voteEvent.options[optionIndex].votes += 1;
		await voteEvent.save();

		res.status(200).json({ message: "Vote cast successfully", voteEvent });
	} catch (error) {
		console.error("Error casting vote:", error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.viewResults = async (req, res) => {
	try {
		const eventId = req.params.eventId.trim(); // Ensure eventId is trimmed

		// Find the vote event by ID
		const voteEvent = await VoteEvent.findById(eventId);
		if (!voteEvent) {
			return res.status(404).json({ message: "Vote event not found" });
		}

		// Prepare the results mapping
		const results = {};

		// Map the votes to option names
		voteEvent.options.forEach((option, index) => {
			results[option.optionName] = option.votes; // Use option name as key and votes as value
		});

		res.status(200).json({
			message: "Vote results",
			results: results,
		});
	} catch (error) {
		console.error("Error retrieving vote results:", error);
		res.status(500).json({ message: "Server error" });
	}
};
