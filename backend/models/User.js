const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	twoFactorSecret: String, // Used for storing the secret for two-factor authentication (if using app-based 2FA)
	twoFactorEnabled: {
		type: Boolean,
		default: false,
	},
	twoFACode: String, // Used for storing the email-based 2FA code
	twoFACodeExpires: Date, // Used to store the expiration time for the 2FA code
	role: {
		type: String,
		enum: ["user", "admin"], // User roles: 'user' and 'admin'
		default: "user",
	},
});

// Pre-save hook to hash the password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Method to compare entered password with stored hashed password
UserSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
