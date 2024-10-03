const express = require("express");
const { submitVote } = require("../controllers/voteController");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Submit vote route
router.post("/vote", verifyToken, submitVote);

module.exports = router;
