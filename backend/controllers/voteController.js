const Vote = require("../models/Vote");
const VoteEvent = require("../models/VoteEvent");

// Cast a vote
exports.castVote = async (req, res) => {
	try {
		const { eventId, optionName } = req.body;

		// Find the event
		const voteEvent = await VoteEvent.findById(eventId);

		if (!voteEvent) {
			return res.status(404).json({ message: "Vote event not found" });
		}

		// Check if the voting period is active
		const currentTime = new Date();
		if (currentTime < voteEvent.startTime || currentTime > voteEvent.endTime) {
			return res.status(400).json({ message: "Voting period is not active" });
		}

		// Find the option and increment the vote count
		const option = voteEvent.options.find(
			(opt) => opt.optionName === optionName
		);
		if (!option) {
			return res.status(400).json({ message: "Invalid voting option" });
		}

		option.votes += 1;

		// Save the updated vote event
		await voteEvent.save();

		res.status(200).json({ message: "Vote cast successfully", voteEvent });
	} catch (error) {
		console.error("Error casting vote:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// View results after voting period is over
exports.viewResults = async (req, res) => {
	try {
		const { eventId } = req.params;

		// Find the voting event
		const voteEvent = await VoteEvent.findById(eventId);
		if (!voteEvent) {
			return res.status(404).json({ message: "Vote event not found" });
		}

		// Check if the voting period has ended
		const currentTime = new Date();
		if (currentTime <= voteEvent.endTime) {
			return res.status(403).json({
				message: "Results are not available until the voting period ends",
			});
		}

		// Get all votes for the event
		const votes = await Vote.find({ voteEvent: eventId });

		// Tally the results
		const resultTally = {};
		votes.forEach((vote) => {
			resultTally[vote.choice] = (resultTally[vote.choice] || 0) + 1;
		});

		res.status(200).json({ message: "Vote results", results: resultTally });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
