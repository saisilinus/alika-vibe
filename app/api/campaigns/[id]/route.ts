import { type NextRequest, NextResponse } from "next/server"
import {
  getCampaignsCollection,
  getCommentsCollection,
  getUsersCollection,
  isValidObjectId,
  toObjectId,
} from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const campaigns = await getCampaignsCollection()
    const comments = await getCommentsCollection()
    const users = await getUsersCollection()

    const campaign = await campaigns.findOne({
      _id: toObjectId(id),
      isActive: true,
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Get campaign comments with user info
    const campaignComments = await comments
      .aggregate([
        { $match: { campaignId: toObjectId(id), isApproved: true } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            content: 1,
            createdAt: 1,
            "user.name": 1,
            "user.image": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
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
