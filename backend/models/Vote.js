const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
	voteEvent: {
		type: mongoose.Schema.Types.ObjectId, // Reference to the voting event
		ref: "VoteEvent",
		required: true,
	},
	voter: {
		type: mongoose.Schema.Types.ObjectId, // Reference to the user who voted
		ref: "User",
		required: true,
	},
	choice: {
		type: String, // The option chosen by the user
		required: true,
	},
});

module.exports = mongoose.model("Vote", VoteSchema);
