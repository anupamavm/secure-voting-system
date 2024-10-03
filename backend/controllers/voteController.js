const Vote = require("../models/Vote");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");

// RSA keys (for simplicity, store securely in production)
const key = new NodeRSA({ b: 512 });
const privateKey = key.exportKey("private");
const publicKey = key.exportKey("public");

// Helper function to hash vote
function hashVote(vote) {
	return crypto.createHash("sha256").update(vote).digest("hex");
}

// Submit vote controller
exports.submitVote = async (req, res) => {
	const { vote } = req.body;
	try {
		// Encrypt the vote
		const encryptedVote = key.encrypt(vote, "base64");
		const voteHash = hashVote(vote);

		const newVote = new Vote({
			voterId: req.user.id,
			encryptedVote,
			voteHash,
		});

		await newVote.save();
		res.status(201).json({ message: "Vote submitted successfully" });
	} catch (error) {
		res.status(400).json({ error: "Error submitting vote" });
	}
};
