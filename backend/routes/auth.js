const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route for user registration
router.post("/register", authController.registerUser);

// Route for user login
router.post("/login", authController.loginUser);

// Route for verifying two-factor authentication
router.post("/verify-2fa", authController.verifyTwoFactor);

module.exports = router;
