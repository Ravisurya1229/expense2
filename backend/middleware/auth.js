const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("name email phone");
    if (!user) return res.status(401).json({ error: "Invalid user" });

    req.user = user; // { _id, name, email, phone }
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
