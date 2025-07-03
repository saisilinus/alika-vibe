const { createClient } = require("@supabase/supabase-js")

// Supabase configuration (optional - for using Supabase features beyond just PostgreSQL)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  console.log("🔗 Supabase client initialized")
} else {
  console.log("ℹ️  Supabase client not initialized (using direct PostgreSQL connection)")
}

module.exports = supabase
