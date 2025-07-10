import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/database"
import type { Campaign } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const campaigns = db.collection<Campaign>("campaigns")

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }
    if (category) {
      query.category = category
    }

    const [campaignList, total] = await Promise.all([
      campaigns.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      campaigns.countDocuments(query),
    ])

    return NextResponse.json({
      campaigns: campaignList,
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const campaigns = db.collection<Campaign>("campaigns")

    const body = await request.json()
    const { title, description, category, templateUrl, tags } = body

    if (!title || !description || !templateUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const campaign: Omit<Campaign, "_id"> = {
      title,
      description,
      category: category || "general",
      templateUrl,
      tags: tags || [],
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      downloadCount: 0,
      isActive: true,
    }

    const result = await campaigns.insertOne(campaign)
    const newCampaign = await campaigns.findOne({ _id: result.insertedId })

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
