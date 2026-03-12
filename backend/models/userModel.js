const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    stfID: {
      type: String,
      required: true,
    },
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
    contact: {
      type: String,
      required: true,
    },

    userType: {
      type: String,
      enum: ["admin", "receptionist"],
      default: "receptionist",
      required: true,
    },
    workType: {
      type: String,
      enum: ["full time", "part time"],
      default: "full time",
      required: true,
    },
    dateJoined: {
      type: Date,
      required: false
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
      
    },
  },
  { timestamps: true }
);

const user = mongoose.model("Users", userSchema);

module.exports = user;