const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres.cudsuspbbdavehxkpfnr:NHRILkxuAOSyuUEB@aws-0-eu-central-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

async function checkDatabase() {
  let client

  try {
    console.log("🔍 Checking database connection...")

    client = await pool.connect()
    console.log("✅ Successfully connected to Supabase!")

    // Test basic query
    const timeResult = await client.query("SELECT NOW() as current_time")
    console.log(`⏰ Database time: ${timeResult.rows[0].current_time}`)

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log("\n📊 Tables in database:")
    if (tablesResult.rows.length === 0) {
      console.log("   ❌ No tables found - run 'npm run init-db' to create them")
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`   ✅ ${row.table_name}`)
      })
    }

    // Check for admin user
    try {
      const userResult = await client.query("SELECT email, role FROM users WHERE email = 'admin@alika.com' LIMIT 1")
      if (userResult.rows.length > 0) {
        console.log(`\n👤 Admin user: ${userResult.rows[0].email} (${userResult.rows[0].role})`)
      } else {
        console.log("\n❌ Admin user not found")
      }
    } catch (err) {
      console.log("\n❌ Users table not found")
    }

    console.log("\n🎉 Database check completed!")
  } catch (error) {
    console.error("❌ Database check failed:")
    console.error("Error:", error.message)
    console.error("\n💡 Troubleshooting:")
    console.error("1. Check your DATABASE_URL in .env file")
    console.error("2. Make sure Supabase project is active")
    console.error("3. Verify network connection")
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

checkDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
