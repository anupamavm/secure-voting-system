const crypto = require("crypto");

const algorithm = "aes-256-ctr";
// Securely store this key in an environment variable or secure location
const key = crypto
	.createHash("sha256")
	.update(String(process.env.ENCRYPTION_KEY || "default_secure_key"))
	.digest("base64")
	.substr(0, 32);

// Encrypt function
function encrypt(text) {
	const iv = crypto.randomBytes(16); // New IV for each encryption
	const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
	let encrypted = cipher.update(text.toString(), "utf-8", "hex");
	encrypted += cipher.final("hex");

	// Return an object containing both iv and encrypted data
	return {
		iv: iv.toString("hex"), // Convert IV to hex string for storage
		encryptedData: encrypted, // Store the encrypted data
	};
}

// Decrypt function
function decrypt(encryptedObj) {
	if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) {
		return "0"; // Return default 0 if invalid input
	}

	const { iv, encryptedData } = encryptedObj;
	const decipher = crypto.createDecipheriv(
		algorithm,
		Buffer.from(key),
		Buffer.from(iv, "hex")
	);
	let decrypted = decipher.update(encryptedData, "hex", "utf-8");
	decrypted += decipher.final("utf-8");
	return decrypted;
}

module.exports = {
	encrypt,
	decrypt,
};
