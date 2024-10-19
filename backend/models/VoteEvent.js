const mongoose = require("mongoose");

const VoteEventSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	options: {
		type: [String], // Array of voting options
		required: true,
	},
	startTime: {
		type: Date, // Start time of the voting event
		required: true,
	},
	endTime: {
		type: Date, // End time of the voting event
		required: true,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId, // Reference to the admin who created the event
		ref: "User",
		required: true,
	},
});

module.exports = mongoose.model("VoteEvent", VoteEventSchema);
