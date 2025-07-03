const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const passport = require("passport")
const cookieParser = require("cookie-parser")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const campaignRoutes = require("./routes/campaigns")
const adminRoutes = require("./routes/admin")
const uploadRoutes = require("./routes/upload")

// Import passport configuration
require("./config/passport")

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting
app.use("/api/auth", authLimiter)
app.use("/api", generalLimiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Passport middleware
app.use(passport.initialize())

// Static files
app.use("/uploads", express.static("uploads"))
app.use("/templates", express.static("templates"))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation error", details: err.message })
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized access" })
  }

  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`🔐 JWT Access Token Expiry: ${process.env.JWT_ACCESS_EXPIRES_IN || "30m (default)"}`)
  console.log(`🔄 JWT Refresh Token Expiry: ${process.env.JWT_REFRESH_EXPIRES_IN || "24h (default)"}`)
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? "Supabase Connected" : "Not configured"}`)
})

module.exports = app
