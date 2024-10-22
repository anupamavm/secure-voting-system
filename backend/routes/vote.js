const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/all-vote-events", authenticate, voteController.getAllVoteEvents);

// Route to cast a vote (protected, user needs to be authenticated)
router.post("/vote", authenticate, voteController.castVote); // No eventId in URL

// Route to view results of a vote event after the voting period ends (protected)
router.get("/results/:eventId", authenticate, voteController.viewResults);

module.exports = router;
