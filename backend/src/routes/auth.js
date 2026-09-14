const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// both routes here are public since they are the login and register endpoints, there is
// no way to require a login before letting someone log in
router.post("/register", authController.registration);
router.post("/login", authController.login);

module.exports=router;
