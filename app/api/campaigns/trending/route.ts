import { NextResponse } from "next/server"
import { getCampaignsCollection } from "@/lib/database"

export async function GET() {
  try {
    const campaigns = await getCampaignsCollection()

    // Get trending campaigns based on view count and recent activity
    const results = await campaigns.find({ status: "active" }).sort({ viewCount: -1, createdAt: -1 }).limit(6).toArray()

    return NextResponse.json({ campaigns: results })
  } catch (error) {
    console.error("Error fetching trending campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch trending campaigns" }, { status: 500 })
  }
}
