const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const bcrypt = require("bcryptjs")
const db = require("./database")

// Local Strategy for email/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await db.query("SELECT * FROM users WHERE email = $1 AND is_active = true", [email.toLowerCase()])

        if (user.rows.length === 0) {
          return done(null, false, { message: "Invalid email or password" })
        }

        const userData = user.rows[0]

        // Check password
        const isValidPassword = await bcrypt.compare(password, userData.password)
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" })
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = userData
        return done(null, userWithoutPassword)
      } catch (error) {
        return done(error)
      }
    },
  ),
)

// JWT Strategy for token authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    },
    async (payload, done) => {
      try {
        // Find user by ID from token payload
        const user = await db.query(
          "SELECT id, email, role, is_active, created_at FROM users WHERE id = $1 AND is_active = true",
          [payload.userId],
        )

        if (user.rows.length === 0) {
          return done(null, false)
        }

        return done(null, user.rows[0])
      } catch (error) {
        return done(error, false)
      }
    },
  ),
)

module.exports = passport
