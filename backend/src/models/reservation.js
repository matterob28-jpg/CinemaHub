const mongoose = require("mongoose");
const reservationData =new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        screeningId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "screening",
            required: true,
        },
        showtime: { type: String, required: true },
        ticketCount: { type: Number, required: true, min: 1 },
        seats: { type: [String], default: [] },
        status: {
            type: String,
            enum: ["active", "cancelled"],
            default: "active",
        },
    },
    {timestamps: true}
);
reservationData.index({userId:1,status:1}); // speeds up queries 
module.exports=mongoose.model("reservation",reservationData);
