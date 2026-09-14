const Reservation = require("../models/reservation");
const Screening = require("../models/screening");

// Returns the logged in user's own bookings, populating screeningId and cinemaId so the frontend gets everything in one request
async function myReservations(req, res) {
    try {
        const reservations = await Reservation.find({ userId: req.user.id })
        // nested populate: resolves cinemaId inside the already-populated screeningId
        .populate({
            path: "screeningId",
            populate: { path: "cinemaId" },
        }).sort({createdAt:-1}); // newest booking first

        res.json(reservations);

    } catch (error) {
        console.error("Error fetching reservations:", error.message);
        res.status(500).json({ error: "Error fetching reservations" });
    }
}

// Books tickets for a screening, checking the chosen showtime is one of its real showtimes to prevent bookings with made-up times
async function create(req,res) {
    const { screeningId, showtime, ticketCount } = req.body;

    if (!screeningId || !showtime || !ticketCount) {
        return res.status(400).json({ error: "screeningId, showtime and ticketCount are required" });
    }
    if (ticketCount < 1) {
        return res.status(400).json({ error: "ticketCount must be at least 1" });
    }
    try {
        const screening = await Screening.findById(screeningId);
        if (!screening) {
            return res.status(404).json({ error: "Screening not found" });
        }

        if (!screening.showtimes.includes(showtime)) {
            return res.status(400).json({ error: "This showtime is not available for the selected screening" });
        }

        const seats = generateSeats(ticketCount);

        const reservation = await Reservation.create({
            userId: req.user.id,
            screeningId,
            showtime,
            ticketCount,
            seats,
        });

        res.status(201).json(reservation);
    } catch (error) {

        console.error("Error creating reservation:", error.message);
        res.status(500).json({ error: "Error creating reservation" });
    }
}

// Returns one booking's full details, checking it belongs to whoever is requesting it, otherwise guessing an id could expose someone else's ticket
async function detail(req, res) {
    const { id } = req.params;
    try {
        // nested populate: resolves cinemaId inside the already-populated screeningId
        const reservation = await Reservation.findById(id).populate({
            path: "screeningId",
            populate: { path: "cinemaId" },
        });

        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        if (reservation.userId.toString() !== req.user.id) { // userId is an ObjectId, req.user.id is a plain string from the JWT
            return res.status(403).json({ error: "You can only view your own reservations" });
        }

        res.json(reservation);
    } catch (error) {
        console.error("Error fetching reservation:", error.message);
        res.status(500).json({ error: "Error fetching reservation" });
    }
}

// Cancels a booking by flipping its status instead of deleting it, so it stays visible in history. Same ownership check as detail
async function cancel(req, res) {
    const { id } = req.params;
    try{
        const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.userId.toString() !== req.user.id) { // userId is an ObjectId, req.user.id is a plain string from the JWT
      return res.status(403).json({ error: "You can only cancel your own reservations" });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json(reservation);
    }catch(error){
        console.error("Error cancelling reservation:", error.message);
    res.status(500).json({ error: "Error cancelling reservation" });
    }
}


// Generates random seats for a booking, since there's no real seat map in this project (row letter + starting number, then consecutive)
function generateSeats(ticketCount) {
  const rows = "ABCDEFGHIJ";
  const row = rows[Math.floor(Math.random() * rows.length)];
  const startNumber = Math.floor(Math.random() * 15) + 1;

  const seats = [];
  for (let i = 0; i < ticketCount; i++) {
    seats.push(row + (startNumber + i));
  }

  return seats;
}

module.exports = { myReservations, create, detail, cancel};
