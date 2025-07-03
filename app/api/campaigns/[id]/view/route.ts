import { type NextRequest, NextResponse } from "next/server"
import { getCampaignsCollection, isValidObjectId, createObjectId } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const campaigns = await getCampaignsCollection()

    const result = await campaigns.updateOne({ _id: createObjectId(id) }, { $inc: { viewCount: 1 } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating view count:", error)
    return NextResponse.json({ error: "Failed to update view count" }, { status: 500 })
  }
}
