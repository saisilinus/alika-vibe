const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Alika Backend Setup")
console.log("=".repeat(40))

// Check if .env file exists
const envPath = path.join(__dirname, ".env")
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env file...")
  const envContent = `# Supabase Database
DATABASE_URL=postgresql://postgres.cudsuspbbdavehxkpfnr:NHRILkxuAOSyuUEB@aws-0-eu-central-2.pooler.supabase.com:6543/postgres

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT Configuration (generate your own secrets in production)
JWT_ACCESS_SECRET=alika_super_secret_access_key_for_development_only_please_change_in_production
JWT_REFRESH_SECRET=alika_super_secret_refresh_key_for_development_only_please_change_in_production
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=24h
`
  fs.writeFileSync(envPath, envContent)
  console.log("✅ .env file created!")
}

function runStep(command, description) {
  console.log(`\n📋 ${description}`)
  console.log(`Running: ${command}`)
  console.log("-".repeat(30))

  try {
    execSync(command, {
      stdio: "inherit",
      cwd: __dirname,
      encoding: "utf8",
    })
    console.log(`✅ ${description} completed!`)
    return true
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message)
    return false
  }
}

// Run setup steps
async function main() {
  console.log("Step 1: Installing dependencies...")
  if (!runStep("npm install", "Install dependencies")) {
    console.log("💡 Try running: npm install")
    return
  }

  console.log("\nStep 2: Checking database connection...")
  if (!runStep("node scripts/check-database.js", "Database connection check")) {
    console.log("💡 Database connection failed. Check your DATABASE_URL")
  }

  console.log("\nStep 3: Setting up database...")
  if (!runStep("node scripts/init-database.js", "Database initialization")) {
    console.log("💡 Database setup failed. You can try running the SQL manually in Supabase")
  }

  console.log("\nStep 4: Starting server...")
  console.log("🎉 Setup complete! Starting development server...")
  console.log("📱 Frontend will be available at: http://localhost:3000")
  console.log("🔗 Backend API will be available at: http://localhost:5000")
  console.log("🔐 Admin login: admin@alika.com / admin123")
  console.log("\nPress Ctrl+C to stop the server")

  runStep("npm run dev", "Start development server")
}

main().catch(console.error)
