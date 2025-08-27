// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const axios = require("axios"); // NEW
// const User = require("../models/User");

// const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// // Never-throw POST (so auth flow never breaks because of n8n)
// async function safePost(url, payload) {
//   if (!url) return;
//   try {
//     await axios.post(url, payload, { timeout: 5000 });
//   } catch (_) {
//     // swallow; do not block auth
//   }
// }

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     if (!name || !email || !password || !phone) {
//       return res
//         .status(400)
//         .json({ error: "Name, email, password and phone are required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     const user = new User({ name, email, password, phone });
//     await user.save();

//     // fire-and-forget to n8n
//     safePost(process.env.N8N_SIGNUP_WEBHOOK_URL, {
//       event: "user_signup",
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       ts: new Date().toISOString(),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//     });
//   } catch (err) {
//     return res.status(500).json({ error: "Server Error", message: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     // small constant-time-ish delay
//     await new Promise((r) => setTimeout(r, 200));

//     if (!user) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }

//     const token = signToken(user._id);

//     // fire-and-forget to n8n
//     safePost(process.env.N8N_LOGIN_WEBHOOK_URL, {
//       event: "user_login",
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       phone: user.phone, // the key bit
//       ts: new Date().toISOString(),
//     });

//     return res.json({
//       success: true,
//       token,
//       user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
//     });
//   } catch (err) {
//     return res.status(500).json({ error: "Server Error", message: err.message });
//   }
// };

// exports.getMe = async (req, res) => {
//   try {
//     return res.json({
//       success: true,
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         phone: req.user.phone, // include phone here too
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ error: "Server Error", message: err.message });
//   }
// };

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/User");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

/**
 * Safe POST to n8n (never throws).
 * Auth = NONE (Webhook node Authentication set to "None").
 * Optional: send a shared secret header if you add an IF check in n8n.
 */
async function safePost(url, payload) {
  if (!url) return;
  const headers = { "Content-Type": "application/json" };
  if (process.env.N8N_SHARED_SECRET) headers["x-webhook-secret"] = process.env.N8N_SHARED_SECRET;

  try {
    const r = await axios.post(url, payload, { timeout: 7000, headers });
    if (process.env.DEBUG_N8N) console.log("[n8n] OK", r.status, url);
  } catch (e) {
    if (process.env.DEBUG_N8N) {
      console.error("[n8n] FAIL", url, e.response?.status || "no-status", e.message);
    }
  }
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Name, email, password and phone are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, password, phone });
    await user.save();

    // Notify n8n (signup)
    safePost(process.env.N8N_SIGNUP_WEBHOOK_URL, {
      event: "user_signup",
      ts: new Date().toISOString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    await new Promise((r) => setTimeout(r, 200)); // tiny timing defense
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = signToken(user._id);

    // Build a rich payload for n8n
    const fwd = req.headers["x-forwarded-for"];
    const clientIp = Array.isArray(fwd)
      ? fwd[0]
      : (fwd || "").split(",")[0].trim() || req.socket?.remoteAddress || null;

    safePost(process.env.N8N_LOGIN_WEBHOOK_URL, {
      event: "user_login",
      ts: new Date().toISOString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      client: {
        ip: clientIp,
        userAgent: req.headers["user-agent"] || null,
        origin: req.headers.origin || null,
        referer: req.headers.referer || null,
      },
      app: {
        env: process.env.NODE_ENV || "development",
        version: process.env.APP_VERSION || null,
      },
    });

    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone || null },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", message: err.message });
  }
};
