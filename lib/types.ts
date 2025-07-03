import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name?: string | null
  email?: string | null
  image?: string | null
  role: "user" | "admin" | "moderator"
  emailVerified?: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  _id?: ObjectId
  title: string
  description: string
  category: string
  templateImageUrl: string
  creatorId: ObjectId
  creatorEmail: string
  status: "active" | "draft" | "archived"
  viewCount: number
  downloadCount: number
  isTrending: boolean
  isFeatured: boolean
  placeholderConfig: Record<string, any>
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedBanner {
  _id?: ObjectId
  campaignId: ObjectId
  userId?: ObjectId
  userEmail?: string
  photoUrl: string
  bannerUrl: string
  downloadCount: number
  isPublic: boolean
  createdAt: Date
}

export interface Comment {
  _id?: ObjectId
  campaignId: ObjectId
  userId?: ObjectId
  userEmail?: string
  userName?: string
  content: string
  likesCount: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseCollections {
  users: "users"
  campaigns: "campaigns"
  generatedBanners: "generatedBanners"
  comments: "comments"
}

export interface DatabaseStats {
  totalCampaigns: number
  totalUsers: number
  totalViews: number
  totalDownloads: number
  monthlyGrowth: {
    campaigns: number
    users: number
    views: number
    downloads: number
  }
}

export const COLLECTIONS: DatabaseCollections = {
  users: "users",
  campaigns: "campaigns",
  generatedBanners: "generatedBanners",
  comments: "comments",
}
