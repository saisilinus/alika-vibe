import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase, toObjectId, isValidObjectId } from "@/lib/database"
import type { Comment } from "@/lib/types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { content, isApproved } = body

    const db = await getDatabase()
    const commentsCollection = db.collection<Comment>("comments")
    const usersCollection = db.collection("users")

    // Get user info
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get existing comment
    const existingComment = await commentsCollection.findOne({ _id: toObjectId(id) })
    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check permissions (user can edit their own comment, admin can edit any)
    const canEdit = existingComment.userId?.toString() === user._id?.toString() || user.role === "admin"
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update comment
    const updates: any = {
      updatedAt: new Date(),
    }

    if (content !== undefined) {
      updates.content = content.trim()
    }

    if (isApproved !== undefined && user.role === "admin") {
      updates.isApproved = isApproved
    }

    const result = await commentsCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
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
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get existing comment
    const existingComment = await commentsCollection.findOne({ _id: toObjectId(id) })
    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check permissions (user can delete their own comment, admin can delete any)
    const canDelete = existingComment.userId?.toString() === user._id?.toString() || user.role === "admin"
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete comment
    await commentsCollection.deleteOne({ _id: toObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
