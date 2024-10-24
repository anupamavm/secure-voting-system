const Vote = require("../models/Vote");
const VoteEvent = require("../models/VoteEvent");
const { encrypt, decrypt } = require("./encryption"); // Assuming encrypt returns { iv, encryptedData }

// Get all vote events
exports.getAllVoteEvents = async (req, res) => {
	try {
		// Fetch all vote events from the database
		const voteEvents = await VoteEvent.find();

		// Return the list of vote events
		res.status(200).json({
			message: "Vote events retrieved successfully",
			voteEvents,
		});
	} catch (error) {
		console.error("Error retrieving vote events:", error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.castVote = async (req, res) => {
	try {
		const { optionIndex } = req.body;
		const eventId = req.params.eventId.trim();

		// Prevent admin from voting
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
		if (currentTime < voteEvent.startTime || currentTime > voteEvent.endTime) {
			return res.status(400).json({ message: "Voting period is not active" });
		}

		if (optionIndex < 0 || optionIndex >= voteEvent.options.length) {
			return res.status(400).json({ message: "Invalid voting option index" });
		}

		const userId = req.user.id;

		// Check if the user has already voted
		const existingVote = await Vote.findOne({
			voteEvent: eventId,
			user: userId,
		});
		if (existingVote) {
			return res
				.status(400)
				.json({ message: "You have already voted for this event" });
		}

		// Create a new vote
		const newVote = new Vote({
			voteEvent: eventId,
			user: userId,
		});

		await newVote.save();

		// Decrypt the current votes for the selected option
		const { iv, encryptedData } = voteEvent.options[optionIndex].votes;
		let currentVotes = decrypt({ iv, encryptedData });

		// Ensure currentVotes is a number
		currentVotes = parseInt(currentVotes, 10);
		if (isNaN(currentVotes)) currentVotes = 0; // Default to 0 if NaN

		// Increment the vote count
		const updatedVotes = encrypt((currentVotes + 1).toString()); // Encrypt the updated votes

		// Update the vote event with the new vote count
		voteEvent.options[optionIndex].votes = updatedVotes;
		await voteEvent.save();

		res.status(200).json({ message: "Vote cast successfully", voteEvent });
	} catch (error) {
		console.error("Error casting vote:", error);
		res.status(500).json({ message: "Server error" });
	}
};

exports.viewResults = async (req, res) => {
	try {
		const eventId = req.params.eventId.trim();

		const voteEvent = await VoteEvent.findById(eventId);
		if (!voteEvent) {
			return res.status(404).json({ message: "Vote event not found" });
		}

		// Check if the event has ended by comparing the current time with the endTime
		const currentTime = new Date();
		if (currentTime < voteEvent.endTime) {
			return res.status(403).json({
				message: "Results are not available yet. The event is still ongoing.",
			});
		}

		const results = {};

		// Decrypt the votes for each option
		voteEvent.options.forEach((option) => {
			const { iv, encryptedData } = option.votes;
			const decryptedVotes = decrypt({ iv, encryptedData });

			// Ensure decryptedVotes is a number
			const parsedVotes = parseInt(decryptedVotes, 10);
			results[option.optionName] = isNaN(parsedVotes) ? 0 : parsedVotes; // Default to 0 if NaN
		});

		res.status(200).json({
			message: "Vote results",
			eventId: voteEvent._id, // Include event ID
			eventName: voteEvent.eventName, // Include event name
			results: results,
		});
	} catch (error) {
		console.error("Error retrieving vote results:", error);
		res.status(500).json({ message: "Server error" });
	}
};
