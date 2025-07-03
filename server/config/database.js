const { Pool } = require("pg")

// Supabase connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test database connection
pool.on("connect", () => {
  console.log("📊 Connected to Supabase PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("❌ Supabase database connection error:", err)
})

// Test the connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log("✅ Supabase database connection successful")
    client.release()
  } catch (err) {
    console.error("❌ Failed to connect to Supabase:", err.message)
  }
}

testConnection()

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
