import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCampaignsCollection, getGeneratedBannersCollection, isValidObjectId, createObjectId } from "@/lib/database"
import type { GeneratedBanner } from "@/lib/types"
import sharp from "sharp"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const formData = await request.formData()
    const photoFile = formData.get("photo") as File

    if (!photoFile) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 })
    }

    // Get campaign details
    const campaigns = await getCampaignsCollection()
    const campaign = await campaigns.findOne({ _id: createObjectId(id) })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Process the uploaded photo
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer())

    // Resize and optimize the photo
    const processedPhoto = await sharp(photoBuffer).resize(800, 600, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer()

    // For demo purposes, we'll create a simple banner by overlaying text
    // In a real implementation, you'd use the campaign template
    const bannerBuffer = await sharp(processedPhoto)
      .resize(1200, 630, { fit: "cover" })
      .composite([
        {
          input: Buffer.from(`
            <svg width="1200" height="630">
              <rect width="1200" height="100" fill="rgba(0,0,0,0.7)" y="530"/>
              <text x="50" y="580" font-family="Arial" font-size="36" fill="white" font-weight="bold">
                ${campaign.title}
              </text>
            </svg>
          `),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer()

    // In a real implementation, you'd save these to a cloud storage service
    // For now, we'll create data URLs
    const photoDataUrl = `data:image/jpeg;base64,${processedPhoto.toString("base64")}`
    const bannerDataUrl = `data:image/png;base64,${bannerBuffer.toString("base64")}`

    // Save the generated banner record
    const generatedBanners = await getGeneratedBannersCollection()

    const newBanner: GeneratedBanner = {
      campaignId: createObjectId(id),
      userId: session?.user?.id ? createObjectId(session.user.id) : undefined,
      userEmail: session?.user?.email || undefined,
      photoUrl: photoDataUrl,
      bannerUrl: bannerDataUrl,
      downloadCount: 0,
      createdAt: new Date(),
    }

    const result = await generatedBanners.insertOne(newBanner)

    // Update campaign download count
    await campaigns.updateOne({ _id: createObjectId(id) }, { $inc: { downloadCount: 1 } })

    return NextResponse.json({
      success: true,
      bannerId: result.insertedId,
      bannerUrl: bannerDataUrl,
      photoUrl: photoDataUrl,
    })
  } catch (error) {
    console.error("Error generating banner:", error)
    return NextResponse.json({ error: "Failed to generate banner" }, { status: 500 })
  }
}
