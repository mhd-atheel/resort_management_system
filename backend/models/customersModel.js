const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        address: {
            type: String,
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

const customer = mongoose.model("Customers", customerSchema);

module.exports = customer;