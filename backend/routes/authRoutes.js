// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");

// // POST /api/auth/signup {name,email,phone,password}
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;
//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const existing = await User.findOne({ $or: [{ email }, { name }] });
//     if (existing) return res.status(400).json({ error: "User with same email or name exists" });

//     const user = new User({ name, email, phone, password });
//     await user.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/auth/login {name,password}
// router.post("/login", async (req, res) => {
//   try {
//     const { name, password } = req.body;
//     if (!name || !password) return res.status(400).json({ error: "Name and password are required" });

//     const user = await User.findOne({ name });
//     if (!user) return res.status(400).json({ error: "Invalid name or password" });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ error: "Invalid name or password" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
//----------------------------------------------------------

router.post("/signup", async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    // 1) Basic validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2) Normalize inputs
    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    phone = String(phone).trim();

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email and phone cannot be empty" });
    }

    // (Optional) phone/email regex checks
    // if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Invalid email" });
    // if (!/^\+?[0-9\- ]{7,15}$/.test(phone)) return res.status(400).json({ error: "Invalid phone" });

    // 3) Check duplicates explicitly
    const existing = await User.findOne({
      $or: [{ email }, { name }]
    }).select("_id name email");

    if (existing) {
      return res.status(400).json({ error: "User with same email or name exists" });
    }

    // 4) Create user (schema should hash password in pre-save)
    const user = new User({ name, email, phone, password });
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    // If unique index throws an E11000, bubble a clean message
    if (err && err.code === 11000) {
      const key = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({ error: `Duplicate ${key}` });
    }
    return res.status(500).json({ error: err.message || "Server error" });
  }
});
