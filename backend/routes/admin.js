const express = require("express");
const router = express.Router();
const { createVoteEvent } = require("../controllers/adminController");

// Admin creates a new vote event
router.post("/create-event", createVoteEvent);

module.exports = router;
