const { MongoClient } = require("mongodb")

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

async function initDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("alika-platform")

    // Create indexes
    console.log("Creating indexes...")

    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("campaigns").createIndex({ category: 1 })
    await db.collection("campaigns").createIndex({ tags: 1 })
    await db.collection("campaigns").createIndex({ createdAt: -1 })
    await db.collection("campaigns").createIndex({ viewCount: -1 })
    await db.collection("generated_banners").createIndex({ campaignId: 1 })
    await db.collection("generated_banners").createIndex({ userId: 1 })
    await db.collection("comments").createIndex({ campaignId: 1 })

    console.log("Indexes created successfully")

    // Insert sample data
    console.log("Inserting sample data...")

    // Create admin user
    const adminUser = {
      name: "Admin User",
      email: "admin@alika.com",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").updateOne({ email: adminUser.email }, { $setOnInsert: adminUser }, { upsert: true })

    // Sample campaigns
    const sampleCampaigns = [
      {
        title: "Summer Sale Banner",
        description: "Bright and colorful summer sale banner template",
        imageUrl: "/placeholder.svg?height=400&width=800",
        category: "sales",
        tags: ["summer", "sale", "colorful"],
        createdBy: (await db.collection("users").findOne({ email: "admin@alika.com" }))._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 150,
        downloadCount: 45,
        isActive: true,
      },
      {
        title: "Tech Conference Banner",
        description: "Professional banner for technology conferences",
        imageUrl: "/placeholder.svg?height=400&width=800",
        category: "events",
        tags: ["tech", "conference", "professional"],
        createdBy: (await db.collection("users").findOne({ email: "admin@alika.com" }))._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 89,
        downloadCount: 23,
        isActive: true,
      },
      {
        title: "Food Delivery Promo",
        description: "Appetizing banner for food delivery promotions",
        imageUrl: "/placeholder.svg?height=400&width=800",
        category: "food",
        tags: ["food", "delivery", "promo"],
        createdBy: (await db.collection("users").findOne({ email: "admin@alika.com" }))._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 234,
        downloadCount: 67,
        isActive: true,
      },
    ]

    await db.collection("campaigns").insertMany(sampleCampaigns)

    console.log("Sample data inserted successfully")
    console.log("Database initialization completed!")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

initDatabase()
