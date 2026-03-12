const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
    {
        roomID: {
            type: String,
            required: true,
            unique: true,
        },
        roomType: {
            type: String,
            enum: ["normal", "luxury","ultra"],
            default: "normal",
            required: false,
        },
        amount: {
            type: Number,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
            required: true,
        },

    },
    { timestamps: true }
);

const room = mongoose.model("Rooms", roomSchema);

module.exports = room;