// Real cinema data for Parma and Reggio Emilia (checked online) to populate the dev db
// before the admin panel was ready; rooms and counts are placeholders
//
// Run with: npm run seed

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Cinema = require("../models/cinema");
const Screening = require("../models/screening");

const CINEMA_DATA = [
  {
    name: "Cinema D'Azeglio",
    address: "Strada Massimo D'Azeglio, 33",
    city: "Parma",
    phone: "0521281138",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Astra",
    address: "Piazza Alessandro Volta, 3",
    city: "Parma",
    phone: "0521200618",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Cristal",
    address: "Via Galaverna, 36",
    city: "Collecchio (PR)",
    phone: "0521805333",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "The Space Cinema Campus",
    address: "Largo Sergio Leone, 7/A",
    city: "Parma",
    phone: "0521993084",
    rooms: [
      { name: "Room 1", capacity: 200 },
      { name: "Room 2", capacity: 150 },
      { name: "Room 3", capacity: 150 },
    ],
  },
  {
    name: "The Space Cinema Barilla",
    address: "Largo Fausto Bocchi, 29/A",
    city: "Parma",
    phone: "0521246911",
    rooms: [
      { name: "Room 1", capacity: 200 },
      { name: "Room 2", capacity: 150 },
    ],
  },

  // --- Reggio Emilia province ---
  {
    name: "UCI Cinemas Reggio Emilia",
    address: "Piazzale Atleti Azzurri d'Italia, 1",
    city: "Reggio Emilia",
    phone: "0522278511",
    rooms: [
      { name: "Room 1", capacity: 250 },
      { name: "Room 2", capacity: 200 },
    ],
  },
  {
    name: "Cinema Olimpia",
    address: "Via Tassoni, 4",
    city: "Reggio Emilia",
    phone: "0522292694",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Al Corso",
    address: "Corso Garibaldi",
    city: "Reggio Emilia",
    phone: "0522436617",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Novecento",
    address: "Via del Cristo, 5",
    city: "Cavriago (RE)",
    phone: "0522371801",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Gualtieri (Multisala Cinecentrum)",
    address: "Via Matteotti, Centro Commerciale Ligabue",
    city: "Gualtieri (RE)",
    phone: "0522828081",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Boiardo",
    address: "Viale XXV Aprile, 3",
    city: "Scandiano (RE)",
    phone: "0522854355",
    rooms: [{ name: "Main room", capacity: 302 }],
  },
  {
    name: "Cinema Apollo",
    address: "Via Morandi, 1/D",
    city: "Albinea (RE)",
    phone: "0522347361",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
  {
    name: "Cinema Eden",
    address: "Piazza Gramsci, 8/1",
    city: "Quattro Castella (RE)",
    phone: "0522887052",
    rooms: [{ name: "Main room", capacity: 150 }],
  },
];

// Wipes the cinemas and screenings collections, then repopulates cinemas from CINEMA_DATA
async function seed() {
  await connectDB();

  console.log("Clearing collections...");
  await Cinema.deleteMany({});
  await Screening.deleteMany({});

  console.log("Creating "+CINEMA_DATA.length+ " real cinemas...");
  await Cinema.insertMany(CINEMA_DATA);

  console.log("Seed completed successfully.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error while seeding:", err);
  process.exit(1);
});