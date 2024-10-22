const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

app.use(cors());
// Middleware
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");
const adminRoutes = require("./routes/admin");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("Database connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Nodemailer test

// var nodemailer = require("nodemailer");

// var transporter = nodemailer.createTransport({
// 	service: "gmail",
// 	auth: {
// 		user: "thenunof@gmail.com",
// 		pass: "eqdrfedeseoxvocq",
// 	},
// });

// var mailOptions = {
// 	from: "thenunof@gmail.com",
// 	to: "anupamamorapitiya97@gmail.com",
// 	subject: "Sending Email using Node.js",
// 	text: "That was easy!",
// };

// transporter.sendMail(mailOptions, function (error, info) {
// 	if (error) {
// 		console.log(error);
// 	} else {
// 		console.log("Email sent: " + info.response);
// 	}
// });
