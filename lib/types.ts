import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name?: string | null
  email?: string | null
  image?: string | null
  role: "user" | "admin" | "moderator"
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  _id?: ObjectId
  title: string
  description: string
  imageUrl: string
  category: string
  tags: string[]
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
  viewCount: number
  downloadCount: number
  isActive: boolean
  templateData?: {
    width: number
    height: number
    elements: any[]
  }
}

export interface GeneratedBanner {
  _id?: ObjectId
  campaignId: ObjectId
  userId: ObjectId
  imageUrl: string
  customizations: {
    text?: string
    colors?: string[]
    fonts?: string[]
  }
  createdAt: Date
  downloadCount: number
}

export interface Comment {
  _id?: ObjectId
  campaignId: ObjectId
  userId: ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
  isApproved: boolean
}

export interface Account {
  _id?: ObjectId
  userId: ObjectId
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
}

export interface Session {
  _id?: ObjectId
  sessionToken: string
  userId: ObjectId
  expires: Date
}

export interface VerificationToken {
  _id?: ObjectId
  identifier: string
  token: string
  expires: Date
}

export interface DatabaseCollections {
  users: "users"
  campaigns: "campaigns"
  generatedBanners: "generatedBanners"
  comments: "comments"
  accounts: "accounts"
  sessions: "sessions"
  verificationTokens: "verificationTokens"
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
  accounts: "accounts",
  sessions: "sessions",
  verificationTokens: "verificationTokens",
}
