const mongoose = require("mongoose");

// The film itself is never stored in our db: we only keep the tmdbId and ask TMDB for the rest when needed
const screeningData=new mongoose.Schema(
    {
        tmdbId:{type: Number,required:true},
        cinemaId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "cinema",
            required: true,
        },
        room: { type: mongoose.Schema.Types.ObjectId, required: true }, //it's the _id of a room embedded in the cinema's own rooms array, not a separate collection, so it can't be populated

        date: { type: Date, required: true },
        showtimes: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => arr.length > 0,
                message: "There must be at least one showtime",
            },
        },
    },
    {timestamps: true}
);
screeningData.index({ tmdbId: 1 }); // speeds up lookups by film in tmdbId
screeningData.index({ cinemaId: 1, date: 1 }); // speeds up the lookups by cinema and date, which is what most of the queries in this app actually use

module.exports = mongoose.model("screening", screeningData);
