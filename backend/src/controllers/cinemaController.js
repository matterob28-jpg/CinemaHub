const Cinema = require("../models/cinema");
const Screening = require("../models/screening");
const Reservation = require("../models/reservation");

// Lists all cinemas, or only the ones matching a search query if one was sent
async function list(req, res) {
  const { search } = req.query;

  try {
    const filter = search ? { $text: { $search: search } } : {};
    const cinemas = await Cinema.find(filter);
    res.json(cinemas);
  } catch (err) {
    console.error("Error listing cinemas:", err.message);
    res.status(500).json({ error: "Error retrieving cinemas" });
  }
}

// Returns one cinema together with its screenings for a given day, defaults to today
async function detail(req, res) {
  const {id} = req.params;
  const {date} = req.query; 

  try {
    const cinema = await Cinema.findById(id);
    if (!cinema) {
      return res.status(404).json({ error: "Cinema not found" });
    }

    // setHours mutates day and returns its new timestamp
    const day = date ? new Date(date) : new Date();
    const startOfDay = new Date(day.setHours(0, 0, 0));
    const endOfDay = new Date(day.setHours(23, 59, 59));

    const screenings = await Screening.find({
      cinemaId: id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ cinema, screenings });
  } catch (error) {
    console.error("Error cinema details:", error.message);
    res.status(500).json({ error: "Error retrieving cinema" });
  }
}

// Creates a new cinema. Admin authorization is already checked at the routing level, not here
async function create(req, res) {
  const { name, address, city, phone, rooms } = req.body;

  if (!name || !address || !city) {
    return res.status(400).json({ error: "name, address and city are required" });
  }

  try {
    const cinema = await Cinema.create({ name, address, city, phone, rooms });
    res.status(201).json(cinema);
  } catch (error) {
    console.error("Error creating cinema:", error.message);
    res.status(500).json({ error: "Error creating cinema" });
  }
}

// Updates a cinema. Only the fields sent get changed; rooms is always replaced whole, not merged item by item
async function update(req, res) {
  const { id } = req.params;
  const { name, address, city, phone, rooms } = req.body;

  try {
    const cinema = await Cinema.findById(id);
    if (!cinema) {
      return res.status(404).json({ error: "Cinema not found" });
    }

    if (name !== undefined) cinema.name = name;
    if (address !== undefined) cinema.address = address;
    if (city !== undefined) cinema.city = city;
    if (phone !== undefined) cinema.phone = phone;
    if (rooms !== undefined) cinema.rooms = rooms;

    await cinema.save();
    res.json(cinema);
  } catch (error) {
    console.error("Error updating cinema:", error.message);
    res.status(500).json({ error: "Error updating cinema" });
  }
}

// Deletes a cinema. Cancels (not delete) the active reservations tied to its screenings,
// so they stay visible in history,then removes the screenings themselves
async function remove(req, res) {
  const { id } = req.params;

  try {
    const cinema = await Cinema.findByIdAndDelete(id);
    if (!cinema) {
      return res.status(404).json({ error: "Cinema not found" });
    }

    // Only pulls back the _id field since that's all we need here
    const linkedScreenings = await Screening.find({ cinemaId: id }, "_id");
    const screeningIds = linkedScreenings.map((item) => item._id);

    if (screeningIds.length > 0) {
      await Reservation.updateMany(
        { screeningId: { $in: screeningIds }, status: "active" },
        { status: "cancelled" }
      );
      await Screening.deleteMany({ cinemaId: id });
    }

    res.json({ message: "Cinema deleted", deletedScreenings: screeningIds.length });
  } catch (error) {
    console.error("Error deleting cinema:", error.message);
    res.status(500).json({ error: "Error deleting cinema" });
  }
}

module.exports = { list, detail, create, update, remove };
