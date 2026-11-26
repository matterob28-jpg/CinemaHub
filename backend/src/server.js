require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB= require("./config/db");
const cinemaRoutes = require("./routes/cinemas");
const screeningRoutes = require("./routes/screenings");
const authRoutes=require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const filmRoutes = require("./routes/films");


const app=express();

app.use(cors());
app.use(express.json());

connectDB();

// /api/v1 is explicit versioning: a future v2 wouldn't break a frontend still calling v1
app.use("/api/v1/cinemas", cinemaRoutes);
app.use("/api/v1/screenings",screeningRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/films", filmRoutes);


// Health check endpoint to verify the server is up and responding
app.get("/api/v1/health", (req,res)=>{
    res.json({status: "ok", timestamp: new Date().toISOString()})
});

const PORT= process.env.PORT || 5000;

app.listen( PORT, () =>{
    console.log("server running on port "+ PORT);
})
