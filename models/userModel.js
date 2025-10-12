const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
        type: String,
        enum: ["admin","receptionist"],
        default: "receptionist",
        required: true,
    },
    otp: { 
      type: String,
      required: false 
    },
    otpExpires: { 
      type: Date, 
      required: false
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const user = mongoose.model("Users", userSchema);

module.exports = user;