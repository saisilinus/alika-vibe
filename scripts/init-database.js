#!/usr/bin/env node

const { MongoClient } = require("mongodb")
require("dotenv").config()

async function initializeDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("alika")

    // Create indexes
    console.log("Creating indexes...")

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    // Campaigns collection indexes
    await db.collection("campaigns").createIndex({ status: 1 })
    await db.collection("campaigns").createIndex({ category: 1 })
    await db.collection("campaigns").createIndex({ createdAt: -1 })
    await db.collection("campaigns").createIndex({ viewCount: -1 })
    await db.collection("campaigns").createIndex({
      title: "text",
      description: "text",
      tags: "text",
    })

    // Generated banners collection indexes
    await db.collection("generated_banners").createIndex({ campaignId: 1 })
    await db.collection("generated_banners").createIndex({ userId: 1 })
    await db.collection("generated_banners").createIndex({ createdAt: -1 })

    // Comments collection indexes
    await db.collection("comments").createIndex({ campaignId: 1 })
    await db.collection("comments").createIndex({ createdAt: -1 })

    console.log("Indexes created successfully")

    // Insert sample data
    console.log("Inserting sample data...")

    const sampleCampaigns = [
      {
        title: "Cracking the Code 1.0",
        description:
          "Join us for an exciting coding bootcamp where you'll learn the fundamentals of programming and web development.",
        category: "Education",
        templateImageUrl: "/placeholder.jpg",
        creatorId: null,
        creatorEmail: "admin@alika.com",
        status: "active",
        viewCount: 1250,
        downloadCount: 89,
        tags: ["coding", "education", "bootcamp"],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        title: "Summer Music Festival",
        description: "Experience the best summer music festival with top artists from around the world.",
        category: "Music",
        templateImageUrl: "/placeholder.jpg",
        creatorId: null,
        creatorEmail: "admin@alika.com",
        status: "active",
        viewCount: 890,
        downloadCount: 45,
        tags: ["music", "festival", "summer"],
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-12"),
      },
      {
        title: "Tech Conference 2024",
        description: "The biggest tech conference of the year featuring the latest innovations and industry leaders.",
        category: "Technology",
        templateImageUrl: "/placeholder.jpg",
        creatorId: null,
        creatorEmail: "admin@alika.com",
        status: "active",
        viewCount: 2100,
        downloadCount: 156,
        tags: ["technology", "conference", "innovation"],
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
      },
    ]

    // First create admin user
    const adminUser = await db.collection("users").findOneAndUpdate(
      { email: "admin@alika.com" },
      {
        $set: {
          name: "Admin User",
          email: "admin@alika.com",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    )

    // Update campaigns with correct creator ID
    const campaignsWithCreatorId = sampleCampaigns.map((campaign) => ({
      ...campaign,
      creatorId: adminUser.value._id,
    }))

    await db.collection("campaigns").insertMany(campaignsWithCreatorId)

    console.log("Sample data inserted successfully")
    console.log("Database initialization completed!")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

initializeDatabase()
