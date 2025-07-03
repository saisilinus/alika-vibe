import { type NextRequest, NextResponse } from "next/server"
import { getCampaignsCollection, getCommentsCollection, isValidObjectId, createObjectId } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const campaigns = await getCampaignsCollection()
    const comments = await getCommentsCollection()

    const campaign = await campaigns.findOne({ _id: createObjectId(id) })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Get comments for this campaign
    const campaignComments = await comments
      .find({ campaignId: createObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      campaign,
      comments: campaignComments,
    })
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}
