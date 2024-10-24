const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
	voteEvent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "VoteEvent",
		required: true,
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Vote", voteSchema);
