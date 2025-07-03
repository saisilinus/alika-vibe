import mongoose from "mongoose"

export interface IComment {
  _id?: string
  campaignId: string
  userId?: string
  parentId?: string
  content: string
  likesCount: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    campaignId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    parentId: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

CommentSchema.index({ campaignId: 1 })
CommentSchema.index({ parentId: 1 })
CommentSchema.index({ createdAt: -1 })

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
