const Screening= require ("../models/screening");
const Reservation = require("../models/reservation");
const { getFilmDuration } = require("./filmController");


// Lists screenings, optionally filtered by movie or date; filters are optional because
// this list is reused by multiple pages (film, cinema, admin)
async function list(req,res){
    try {
        const{film,date}=req.query;
        const filter={};

        if (film){
            filter.tmdbId=Number(film); // query params arrive as strings, tmdbId in the schema is a Number
        }
        if (date){
            // setHours mutates day and returns its new timestamp, reused here to build both bounds of the day
            const day= new Date(date);
            const startOfDay = new Date(day.setHours(0, 0, 0));
            const endOfDay = new Date(day.setHours(23, 59, 59));
            filter.date = { $gte: startOfDay, $lte: endOfDay };

        }
        const screenings=await Screening.find(filter).populate("cinemaId");
        res.json(screenings);

    } catch (error) {
        console.error("Error fetching screenings: ",error.message);
        res.status(500).json({error: "Error fetching screenings:"});
    }
}

// Creates a new screening after checking for conflicts with other screenings in the room,
// and overlaps between the showtimes entered in the same form
async function create(req, res) {
  const { tmdbId, cinemaId, room, date, showtimes,} = req.body;

  if (!tmdbId || !cinemaId || !room || !date || !showtimes?.length) {
    return res.status(400).json({ error:"tmdbId, cinemaId, room, date and showtimes are required" });
  }

  try {
    const { conflict, message } = await findOverlap({cinemaId,room,date,showtimes,tmdbId});

    if (conflict) {
      return res.status(409).json({ error: message });
    }

    const { duration } = await getFilmDuration(tmdbId);
    const internalOverlap = findInternalOverlap(showtimes, duration);
    if (internalOverlap) {
      return res.status(409).json({ error: internalOverlap });
    }


    const screening = await Screening.create({tmdbId,cinemaId,room,date,showtimes});
    res.status(201).json(screening);
  } catch (error) {
    console.error("Error creating screening:", error.message);
    res.status(500).json({ error: "Error creating screening" });
  }
}

// Updates a screening, running the exact same conflict checks as create so an
// edit cannot accidentally create a room clash either
async function update(req, res) {
  const { id } = req.params;
  const { cinemaId, room, date, showtimes} = req.body;

  try {
    const screening = await Screening.findById(id);
    if (!screening) {
      return res.status(404).json({ error: "Screening not found" });
    }
    // Temporary values: we don't touch the real document until findOverlap has passed
    const tmpCinemaId = cinemaId !== undefined ? cinemaId : screening.cinemaId;
    const tmpRoom = room !== undefined ? room : screening.room;
    const tmpDate = date !== undefined ? date : screening.date;
    const tmpShowtimes = showtimes !== undefined ? showtimes : screening.showtimes;

    const { conflict, message } = await findOverlap({
      cinemaId: tmpCinemaId,
      room: tmpRoom,
      date: tmpDate,
      showtimes: tmpShowtimes,
      tmdbId: screening.tmdbId,
      excludeId: id,
    });

    if (conflict) {
      return res.status(409).json({ error: message });
    }

    const { duration } = await getFilmDuration(screening.tmdbId);
    const internalOverlap = findInternalOverlap(tmpShowtimes, duration);
    if (internalOverlap) {
      return res.status(409).json({ error: internalOverlap });
    }

    if (cinemaId !== undefined) screening.cinemaId = cinemaId;
    if (room !== undefined) screening.room = room;
    if (date !== undefined) screening.date = date;
    if (showtimes !== undefined) screening.showtimes = showtimes;


    await screening.save();
    res.json(screening);
  } catch (error) {
    console.error("Error updating screening:", error.message);
    res.status(500).json({ error: "Error updating screening" });
  }
}

// Checks whether the given screening would clash with an existing one in the same room, by
// comparing the [start,end] interval of each existing showtime (using the film's duration)
// against the new ones
async function findOverlap({ cinemaId, room, date, showtimes, tmdbId, excludeId }) {
  // setHours mutates its argument and returns a timestamp; wrapping in "new Date(day)" first keeps "day" itself untouched
  const day = new Date(date);
  const startOfDay = new Date(new Date(day).setHours(0, 0, 0));
  const endOfDay = new Date(new Date(day).setHours(23, 59, 59));

  const filter = {cinemaId,room,date: { $gte: startOfDay, $lte: endOfDay },};

  // excludeId keeps a screening being edited from conflicting with itself 
  if (excludeId){
     filter._id = { $ne: excludeId };
  }

  const existingScreenings = await Screening.find(filter);
  if (existingScreenings.length === 0) {
      return { conflict: false };
  }
  const { duration: newDuration } = await getFilmDuration(tmdbId);

  for (const existing of existingScreenings) {
    const { duration: existingDuration, title: existingTitle } = await getFilmDuration(existing.tmdbId);
    for (const existingTime of existing.showtimes) {
      const existingStart = timeToMinutes(existingTime);
      const existingEnd = existingStart + existingDuration;

      for (const newTime of showtimes) {
        const newStart = timeToMinutes(newTime);
        const newEnd = newStart + newDuration;

        // Classic interval overlap test: two ranges clash if each one starts before the other ends
        if (newStart < existingEnd && existingStart < newEnd) {
          return {
            conflict: true,
            message: "Room conflict: " +existingTitle+ " occupies the room starting at "+existingTime+ " ("+existingDuration+" min), which clashes with "+newTime
          };
        }
      }
    }
  }

  return { conflict: false };
}

// Checks that the showtimes entered together in the same form don't overlap each other
function findInternalOverlap(showtimes, duration) {
  for (let i = 0; i < showtimes.length; i++) {
    for (let j = i + 1; j < showtimes.length; j++) {
      const startA = timeToMinutes(showtimes[i]);
      const startB = timeToMinutes(showtimes[j]);
      const endA = startA + duration;
      const endB = startB + duration;
      // Same interval overlap test as findOverlap above; checked both directions since the array isn't sorted
      if (startA < endB && startB < endA) {
        return "The times "+showtimes[i]+" and " +showtimes[j] +" entered together overlap with each other";
      }
    }
  }
  return null;
}

// Deletes a screening and cancels (doesn't delete) its active reservations
async function remove(req, res) {
  const { id } = req.params;

  try {
    const screening = await Screening.findByIdAndDelete(id);
    if (!screening) {
      return res.status(404).json({ error: "Screening not found" });
    }

    await Reservation.updateMany(
      { screeningId: id, status: "active" },
      { status: "cancelled" }
    );

    res.json({ message: "Screening deleted" });
  } catch (error) {
    console.error("Error deleting screening:", error.message);
    res.status(500).json({ error: "Error deleting screening" });
  }
}

// Converts "HH:MM" into total minutes to compare/add times without juggling hours and minutes separately
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

module.exports = { list, create, update, remove };
