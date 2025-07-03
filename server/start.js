const { spawn } = require("child_process")
const path = require("path")

console.log("🚀 Starting Alika Backend Setup...")
console.log("=".repeat(50))

// Function to run a command and show output
function runCommand(command, args = [], description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}`)
    console.log(`Running: ${command} ${args.join(" ")}`)
    console.log("-".repeat(30))

    const process = spawn(command, args, {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
    })

    process.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully!`)
        resolve()
      } else {
        console.log(`❌ ${description} failed with code ${code}`)
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    process.on("error", (error) => {
      console.log(`❌ Error running ${description}:`, error.message)
      reject(error)
    })
  })
}

async function setup() {
  try {
    // Step 1: Install dependencies
    await runCommand("npm", ["install"], "Installing dependencies")

    // Step 2: Check database connection
    await runCommand("node", ["scripts/check-database.js"], "Checking database connection")

    // Step 3: Initialize database (if needed)
    console.log("\n🤔 Do you want to initialize the database with sample data?")
    console.log("This will create tables and add sample campaigns.")

    // For now, we'll skip the interactive part and just run it
    await runCommand("node", ["scripts/init-database.js"], "Initializing database")

    // Step 4: Start the server
    console.log("\n🎉 Setup complete! Starting the server...")
    await runCommand("npm", ["run", "dev"], "Starting development server")
  } catch (error) {
    console.error("\n💥 Setup failed:", error.message)
    console.log("\n💡 You can also run these commands manually:")
    console.log("1. npm install")
    console.log("2. node scripts/check-database.js")
    console.log("3. node scripts/init-database.js")
    console.log("4. npm run dev")
  }
}

setup()
