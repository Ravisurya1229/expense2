const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { signup, login, getMe } = require("../controllers/authController");

// Public
router.post("/signup", signup);
router.post("/login", login);

// Private
router.get("/me", auth, getMe);

module.exports = router;
