import mongoose from "mongoose"

export interface ICampaign {
  _id?: string
  title: string
  description: string
  category: string
  templateUrl?: string
  creatorId: string
  viewCount: number
  downloadCount: number
  isTrending: boolean
  isFeatured: boolean
  placeholderConfig: object
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const CampaignSchema = new mongoose.Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    templateUrl: {
      type: String,
    },
    creatorId: {
      type: String,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    placeholderConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

CampaignSchema.index({ category: 1 })
CampaignSchema.index({ isTrending: 1 })
CampaignSchema.index({ createdAt: -1 })
CampaignSchema.index({ viewCount: -1 })
CampaignSchema.index({ creatorId: 1 })

export default mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema)
