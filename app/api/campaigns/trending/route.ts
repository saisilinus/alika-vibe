import { NextResponse } from "next/server"
import { getCampaignsCollection } from "@/lib/database"

export async function GET() {
  try {
    const campaigns = await getCampaignsCollection()

    const trendingCampaigns = await campaigns
      .find({ isActive: true })
      .sort({ viewCount: -1, downloadCount: -1 })
      .limit(8)
      .toArray()

    return NextResponse.json({ campaigns: trendingCampaigns })
  } catch (error) {
    console.error("Error fetching trending campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch trending campaigns" }, { status: 500 })
  }
}
