const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

const { requireAuth } = require("../middleware/auth");

// requireAuth applied once to the whole router instead of repeating it on every route
router.use(requireAuth);

router.get("/me", reservationController.myReservations);
router.post("/", reservationController.create);
router.get("/:id", reservationController.detail);
router.delete("/:id", reservationController.cancel);

module.exports = router;
