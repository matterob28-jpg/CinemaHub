require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user");

// Promotes a user to admin by email, since there's no button in the app to do that
// Run it from the backend folder like this:
// node src/scripts/promoteAdmin.js email@example.com
async function promote() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node src/scripts/promoteAdmin.js email@example.com");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error("No user found with email " +email);
  } else {
    console.log(user.name+" "+user.email+" is now an admin");
  }

  await mongoose.disconnect();
}

promote();
