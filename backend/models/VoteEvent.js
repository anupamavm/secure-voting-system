const mongoose = require("mongoose");

const VoteEventSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	options: [
		{
			optionName: { type: String, required: true },
			votes: { type: Number, default: 0 }, // To count votes for each option
		},
	],

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Reference to the admin who created the event
		required: true,
	},
	startTime: {
		type: Date,
		required: true,
	},
	endTime: {
		type: Date,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
});

module.exports = mongoose.model("VoteEvent", VoteEventSchema);
