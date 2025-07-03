#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Setting up Alika Platform with MongoDB...\n")

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath) {
  return fs.existsSync(filePath)
}

function copyEnvFile(source, destination) {
  if (!checkFile(destination)) {
    if (checkFile(source)) {
      fs.copyFileSync(source, destination)
      log(`✅ Created ${destination}`, "green")
      return true
    } else {
      log(`❌ Source file ${source} not found`, "red")
      return false
    }
  } else {
    log(`⚠️  ${destination} already exists, skipping`, "yellow")
    return true
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, "blue")
    execSync(command, { stdio: "inherit" })
    log(`✅ ${description} completed`, "green")
    return true
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, "red")
    return false
  }
}

async function main() {
  log("📋 Setup Checklist:", "bright")

  // 1. Check Node.js version
  log("\n1. Checking Node.js version...", "cyan")
  const nodeVersion = process.version
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} is supported`, "green")
  } else {
    log(`❌ Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 18+`, "red")
    process.exit(1)
  }

  // 2. Install dependencies
  log("\n2. Installing dependencies...", "cyan")
  if (!runCommand("pnpm install", "Dependency installation")) {
    log("❌ Failed to install dependencies", "red")
    process.exit(1)
  }

  // 3. Setup environment files
  log("\n3. Setting up environment files...", "cyan")
  const envCreated = copyEnvFile(".env.example", ".env.local")

  // 4. Create necessary directories
  log("\n4. Creating necessary directories...", "cyan")
  const directories = ["public/uploads", "public/generated"]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      log(`✅ Created directory: ${dir}`, "green")
    } else {
      log(`⚠️  Directory already exists: ${dir}`, "yellow")
    }
  })

  // 5. Setup summary
  log("\n🎉 Setup completed!", "bright")
  log("\n📝 Next Steps:", "cyan")

  if (envCreated) {
    log("\n🔧 Environment Configuration:", "yellow")
    log("   1. Edit .env.local and update:", "yellow")
    log("      - MONGODB_URI (your MongoDB Atlas connection string)", "yellow")
    log("      - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)", "yellow")
    log("      - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET", "yellow")
    log("      - EMAIL_SERVER_* variables for email authentication", "yellow")
  }

  log("\n🗄️  Database Setup:", "cyan")
  log("   1. Create a MongoDB Atlas cluster at https://cloud.mongodb.com", "cyan")
  log("   2. Get your connection string from Atlas", "cyan")
  log("   3. Update MONGODB_URI in .env.local", "cyan")
  log("   4. The database will be automatically initialized on first run", "cyan")

  log("\n🔐 Authentication Setup:", "magenta")
  log("   1. Set up Google OAuth at https://console.developers.google.com", "magenta")
  log("   2. Configure email provider (Gmail, SendGrid, etc.)", "magenta")
  log("   3. Update authentication variables in .env.local", "magenta")

  log("\n🚀 Start Development:", "green")
  log("   1. Start development server: pnpm dev", "green")
  log("   2. Open http://localhost:3000", "green")

  log("\n📚 Documentation:", "blue")
  log("   - README.md for detailed setup instructions", "blue")
  log("   - Visit /admin for admin dashboard (after authentication)", "blue")

  log("\n✨ Happy coding!", "bright")
}

// Run setup
main().catch((error) => {
  log(`❌ Setup failed: ${error.message}`, "red")
  process.exit(1)
})
