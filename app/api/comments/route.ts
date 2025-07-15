import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase, toObjectId, isValidObjectId } from "@/lib/database"
import type { Comment } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    if (!isValidObjectId(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const commentsCollection = db.collection<Comment>("comments")
    const usersCollection = db.collection("users")

    // Build sort object
    const sortObject: any = {}
    if (sortBy === "likes") {
      sortObject.likes = order === "asc" ? 1 : -1
    } else {
      sortObject.createdAt = order === "asc" ? 1 : -1
    }

    // Get comments with user information
    const comments = await commentsCollection
      .aggregate([
        {
          $match: {
            campaignId: toObjectId(campaignId),
            isApproved: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            user: {
              name: "$user.name",
              image: "$user.image",
            },
          },
        },
        {
          $sort: sortObject,
        },
      ])
      .toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, content } = body

    if (!campaignId || !content) {
      return NextResponse.json({ error: "Campaign ID and content are required" }, { status: 400 })
    }

    if (!isValidObjectId(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const commentsCollection = db.collection<Comment>("comments")
    const usersCollection = db.collection("users")

    // Get user info
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create comment
    const comment: Omit<Comment, "_id"> = {
      campaignId: toObjectId(campaignId),
      userId: user._id,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: true, // Auto-approve for now
      likes: 0,
      likedBy: [],
    }

    const result = await commentsCollection.insertOne(comment)

    // Return comment with user info
    const newComment = {
      ...comment,
      _id: result.insertedId,
      user: {
        name: user.name,
        image: user.image,
      },
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
