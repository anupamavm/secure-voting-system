const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
	voterId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	encryptedVote: {
		type: String,
		required: true,
	},
	voteHash: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Vote", voteSchema);
