const jwt = require("jsonwebtoken")
const db = require("../config/database")

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    // Get user from database
    const user = await db.query("SELECT id, email, role, is_active FROM users WHERE id = $1 AND is_active = true", [
      decoded.userId,
    ])

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = user.rows[0]
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    console.error("Authentication error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}

// Middleware to require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: allowedRoles,
        current: userRole,
      })
    }

    next()
  }
}

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await db.query("SELECT id, email, role, is_active FROM users WHERE id = $1 AND is_active = true", [
      decoded.userId,
    ])

    req.user = user.rows.length > 0 ? user.rows[0] : null
    next()
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null
    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
}
