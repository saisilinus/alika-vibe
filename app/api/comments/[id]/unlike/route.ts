import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase, toObjectId, isValidObjectId } from "@/lib/database"
import type { Comment } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const commentsCollection = db.collection<Comment>("comments")
    const usersCollection = db.collection("users")

    // Get user info
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user._id

    // Unlike - remove user from likedBy array and decrement likes
    const result = await commentsCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $pull: { likedBy: userId },
        $inc: { likes: -1 },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Get user info for response
    const commentUser = await usersCollection.findOne({ _id: result.userId })

    const updatedComment = {
      ...result,
      user: commentUser
        ? {
            name: commentUser.name,
            image: commentUser.image,
          }
        : undefined,
    }

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("Error unliking comment:", error)
    return NextResponse.json({ error: "Failed to unlike comment" }, { status: 500 })
  }
}
