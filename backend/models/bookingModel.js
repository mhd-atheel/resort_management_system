const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
    {
        roomID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rooms',
            required: true,
        },
        customerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customers',
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date, 
            required: true,
        },
        payment: {
            type: String,
            enum: ["pending", "paid",],
            default: "panding",
            required: false,
        },

    },
    { timestamps: true }
);

const booking = mongoose.model("Bookings", bookingSchema);

module.exports = booking;