const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route for initial user registration (sending 2FA code to email)
router.post("/register", authController.registerUser);

// Route for user login
router.post("/login", authController.loginUser);

// Route for verifying two-factor authentication during login
router.post("/verify-2fa", authController.verifyTwoFactorEmailCode);

module.exports = router;
