import { type NextRequest, NextResponse } from "next/server"
import { getCampaignsCollection, isValidObjectId, toObjectId } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const campaigns = await getCampaignsCollection()

    await campaigns.updateOne({ _id: toObjectId(id) }, { $inc: { viewCount: 1 } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating view count:", error)
    return NextResponse.json({ error: "Failed to update view count" }, { status: 500 })
  }
}
