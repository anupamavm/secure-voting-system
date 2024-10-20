const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// Route for creating a new vote event (protected, only accessible by admin)
router.post(
	"/create-vote-event",
	authenticate,
	isAdmin,
	adminController.createVoteEvent
);

module.exports = router;
