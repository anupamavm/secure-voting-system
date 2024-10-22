const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { authenticate } = require("../middleware/authMiddleware");

// Route to get all vote events (protected)
router.get("/all-vote-events", authenticate, voteController.getAllVoteEvents);

// Route to cast a vote (protected, user needs to be authenticated)
// Note: The eventId is now part of the URL parameters
router.post("/castvote/:eventId", authenticate, voteController.castVote); // eventId in URL

// Route to view results of a vote event after the voting period ends (protected)
router.get("/results/:eventId", authenticate, voteController.viewResults);

module.exports = router;
