var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema(
	{
		
		email: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: String,
			required: false,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: "user", // Default role
			enum: ["user", "admin"], // Define allowed roles
		},
		otp: { type: String },
		canResetPassword: { type: Boolean, default: false },
		otpExpires: { type: Date },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
