import { NextResponse } from "next/server"
import { getCampaignsCollection } from "@/lib/database"

export async function GET() {
  try {
    const campaigns = await getCampaignsCollection()

    const latestCampaigns = await campaigns.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).toArray()

    return NextResponse.json({ campaigns: latestCampaigns })
  } catch (error) {
    console.error("Error fetching latest campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch latest campaigns" }, { status: 500 })
  }
}
