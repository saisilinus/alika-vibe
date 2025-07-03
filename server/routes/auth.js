const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")
const { body, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match")
    }
    return true
  }),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "30m", // Default: 30 minutes
  })

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "24h", // Default: 24 hours
  })

  return { accessToken, refreshToken }
}

// Register new user
router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email, password } = req.body

    // Check if user already exists
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (email, password, role, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, "user", true],
    )

    const user = newUser.rows[0]

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Store refresh token in database
    await db.query(
      `UPDATE users SET refresh_tokens = 
       COALESCE(refresh_tokens, '[]'::jsonb) || $1::jsonb 
       WHERE id = $2`,
      [JSON.stringify([{ token: refreshToken, createdAt: new Date() }]), user.id],
    )

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login user
router.post("/login", loginValidation, (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }

  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err) {
        return res.status(500).json({ error: "Authentication error" })
      }

      if (!user) {
        return res.status(401).json({ error: info.message || "Invalid credentials" })
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id)

      // Store refresh token in database
      await db.query(
        `UPDATE users SET refresh_tokens = 
         COALESCE(refresh_tokens, '[]'::jsonb) || $1::jsonb 
         WHERE id = $2`,
        [JSON.stringify([{ token: refreshToken, createdAt: new Date() }]), user.id],
      )

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Login failed" })
    }
  })(req, res, next)
})

// Refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    // Check if refresh token exists in database
    const user = await db.query(
      `SELECT id, email, role, refresh_tokens 
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [decoded.userId],
    )

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    const userData = user.rows[0]
    const storedTokens = userData.refresh_tokens || []

    const tokenExists = storedTokens.some((t) => t.token === refreshToken)
    if (!tokenExists) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userData.id)

    // Replace old refresh token with new one
    const updatedTokens = storedTokens.filter((t) => t.token !== refreshToken)
    updatedTokens.push({ token: newRefreshToken, createdAt: new Date() })

    await db.query("UPDATE users SET refresh_tokens = $1 WHERE id = $2", [JSON.stringify(updatedTokens), userData.id])

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid refresh token" })
    }
    console.error("Token refresh error:", error)
    res.status(500).json({ error: "Token refresh failed" })
  }
})

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body
    const userId = req.user.id

    if (refreshToken) {
      // Remove specific refresh token
      const user = await db.query("SELECT refresh_tokens FROM users WHERE id = $1", [userId])

      if (user.rows.length > 0) {
        const tokens = user.rows[0].refresh_tokens || []
        const updatedTokens = tokens.filter((t) => t.token !== refreshToken)

        await db.query("UPDATE users SET refresh_tokens = $1 WHERE id = $2", [JSON.stringify(updatedTokens), userId])
      }
    }

    res.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db.query("SELECT id, email, role, is_active, created_at, updated_at FROM users WHERE id = $1", [
      req.user.id,
    ])

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user: user.rows[0] })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, [body("email").optional().isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email } = req.body
    const userId = req.user.id

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, userId])

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email already taken" })
      }
    }

    // Update user
    const updatedUser = await db.query(
      `UPDATE users 
       SET email = COALESCE($1, email), updated_at = NOW()
       WHERE id = $2 
       RETURNING id, email, role, created_at, updated_at`,
      [email, userId],
    )

    res.json({
      message: "Profile updated successfully",
      user: updatedUser.rows[0],
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Profile update failed" })
  }
})

// Change password
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match")
      }
      return true
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { currentPassword, newPassword } = req.body
      const userId = req.user.id

      // Get current password hash
      const user = await db.query("SELECT password FROM users WHERE id = $1", [userId])

      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password)
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" })
      }

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update password and clear all refresh tokens (force re-login)
      await db.query(
        `UPDATE users 
       SET password = $1, refresh_tokens = '[]'::jsonb, updated_at = NOW()
       WHERE id = $2`,
        [hashedNewPassword, userId],
      )

      res.json({ message: "Password changed successfully" })
    } catch (error) {
      console.error("Password change error:", error)
      res.status(500).json({ error: "Password change failed" })
    }
  },
)

module.exports = router
