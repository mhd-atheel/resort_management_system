const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        nic: {
            type: String,
            required: false,
        },
        roomID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rooms',
            required: false,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
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