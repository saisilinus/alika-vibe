import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCampaignsCollection, createObjectId } from "@/lib/database"
import type { Campaign } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const campaigns = await getCampaignsCollection()

    // Build query
    const query: any = { status: "active" }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Get total count
    const total = await campaigns.countDocuments(query)

    // Get campaigns with pagination
    const results = await campaigns
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      campaigns: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin or moderator
    if (session.user.role !== "admin" && session.user.role !== "moderator") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, templateImageUrl, tags = [] } = body

    if (!title || !description || !category || !templateImageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const campaigns = await getCampaignsCollection()

    const newCampaign: Campaign = {
      title,
      description,
      category,
      templateImageUrl,
      creatorId: createObjectId(session.user.id),
      creatorEmail: session.user.email,
      status: "active",
      viewCount: 0,
      downloadCount: 0,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await campaigns.insertOne(newCampaign)

    return NextResponse.json({
      success: true,
      campaignId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
