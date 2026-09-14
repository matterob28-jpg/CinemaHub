const express = require("express");
const router = express.Router();
const cinemaController = require("../controllers/cinemaController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// listing and viewing a cinema are public, anyone can browse them without logging in
router.get("/", cinemaController.list);
router.get("/:id", cinemaController.detail);

// creating, editing and deleting need both middlewares to pass first, so the user has to
// be logged in and have the admin role before the controller below even runs
router.post("/", requireAuth, requireAdmin, cinemaController.create);
router.put("/:id", requireAuth, requireAdmin, cinemaController.update);
router.delete("/:id", requireAuth, requireAdmin, cinemaController.remove);

module.exports = router;
