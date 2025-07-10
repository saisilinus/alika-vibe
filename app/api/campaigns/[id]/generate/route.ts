import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  getCampaignsCollection,
  getGeneratedBannersCollection,
  getUsersCollection,
  isValidObjectId,
  toObjectId,
} from "@/lib/database"
import sharp from "sharp"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const body = await request.json()
    const { customizations } = body

    const users = await getUsersCollection()
    const campaigns = await getCampaignsCollection()
    const generatedBanners = await getGeneratedBannersCollection()

    const user = await users.findOne({ email: session.user.email })
    const campaign = await campaigns.findOne({ _id: toObjectId(id) })

    if (!user || !campaign) {
      return NextResponse.json({ error: "User or campaign not found" }, { status: 404 })
    }

    // Simple banner generation (in a real app, you'd use more sophisticated image processing)
    const bannerBuffer = await sharp({
      create: {
        width: 800,
        height: 400,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer()

    // In a real app, you'd save this to a file storage service
    const imageUrl = `/api/generated-banners/${Date.now()}.png`

    const generatedBanner = {
      campaignId: toObjectId(id),
      userId: user._id!,
      imageUrl,
      customizations: customizations || {},
      createdAt: new Date(),
      downloadCount: 0,
    }

    const result = await generatedBanners.insertOne(generatedBanner)

    // Update campaign download count
    await campaigns.updateOne({ _id: toObjectId(id) }, { $inc: { downloadCount: 1 } })

    return NextResponse.json({
      success: true,
      bannerId: result.insertedId,
      imageUrl,
    })
  } catch (error) {
    console.error("Error generating banner:", error)
    return NextResponse.json({ error: "Failed to generate banner" }, { status: 500 })
  }
}
