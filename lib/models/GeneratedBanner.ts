import mongoose from "mongoose"

export interface IGeneratedBanner {
  _id?: string
  campaignId: string
  userName: string
  userPhotoUrl?: string
  generatedBannerUrl: string
  isPublic: boolean
  createdAt: Date
}

const GeneratedBannerSchema = new mongoose.Schema<IGeneratedBanner>(
  {
    campaignId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhotoUrl: {
      type: String,
    },
    generatedBannerUrl: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

GeneratedBannerSchema.index({ campaignId: 1 })
GeneratedBannerSchema.index({ createdAt: -1 })
GeneratedBannerSchema.index({ isPublic: 1 })

export default mongoose.models.GeneratedBanner ||
  mongoose.model<IGeneratedBanner>("GeneratedBanner", GeneratedBannerSchema)
