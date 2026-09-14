const express = require("express");
const router = express.Router();
const filmController = require("../controllers/filmController");

// Public: these just proxy TMDB without requiring an account
router.get("/search", filmController.search);
router.get("/:tmdbId", filmController.detail);

module.exports = router;
