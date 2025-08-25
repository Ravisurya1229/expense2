// server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");

dotenv.config();
["JWT_SECRET", "MONGO_URI"].forEach((k) => {
  if (!process.env[k]) {
    console.error(`Missing ${k} in .env`);
    process.exit(1);
  }
});

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false,
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Fallback JSON parser for weird clients
app.use((req, res, next) => {
  const ct = (req.headers["content-type"] || "").toLowerCase();
  const methods = ["POST", "PUT", "PATCH"];
  const looksJson = ct.includes("application/json") || (ct.includes("application/") && ct.includes("+json"));
  const alreadyParsed = req.body && typeof req.body === "object" && Object.keys(req.body).length > 0;

  if (!methods.includes(req.method) || alreadyParsed || !looksJson) return next();

  let raw = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    try {
      if (raw && !alreadyParsed) {
        req.body = JSON.parse(raw);
      }
    } catch (_) {
      // ignore; controllers will send 400 if needed
    }
    next();
  });
});

// Rate limit just the login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
});
app.use("/api/auth/login", loginLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);

// Error handler LAST
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON", details: err.message });
  }
  console.error("[UNCAUGHT ERROR]", err);
  res.status(500).json({ error: "Server Error", details: err.message });
});

// DB & server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
