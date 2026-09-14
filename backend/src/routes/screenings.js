const express=require("express");
const router=express.Router();
const screeningController = require("../controllers/screeningController");

const{requireAuth,requireAdmin}=require("../middleware/auth");

// listing screenings is public, but creating, editing and deleting all require an admin
// to be logged in first
router.get("/",screeningController.list);

router.post("/",requireAuth,requireAdmin,screeningController.create);
router.put("/:id",requireAuth,requireAdmin,screeningController.update);
router.delete("/:id",requireAuth,requireAdmin,screeningController.remove);


module.exports=router;
