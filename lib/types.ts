import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId | string
  name: string
  email: string
  image?: string
  role: "user" | "admin" | "moderator"
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Campaign {
  _id?: ObjectId | string
  title: string
  description: string
  imageUrl: string
  templateUrl?: string // For backward compatibility
  category: string
  tags: string[]
  createdBy: string | ObjectId
  createdAt: Date
  updatedAt: Date
  viewCount: number
  downloadCount: number
  isActive: boolean
  isTrending?: boolean
  isFeatured?: boolean
  placeholderConfig?: {
    textAreas: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      placeholder: string
    }>
    imageAreas: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      placeholder: string
    }>
  }
  creator?: {
    name: string
    image?: string
  }
}

export interface GeneratedBanner {
  _id?: ObjectId | string
  campaignId: string | ObjectId
  userId: string | ObjectId
  imageUrl: string
  customizations: {
    text?: string
    photo?: string
    colors?: string[]
    fonts?: string[]
    positioning?: {
      textX?: number
      textY?: number
      photoX?: number
      photoY?: number
    }
  }
  createdAt: Date
  downloadCount: number
}

export interface Comment {
  _id?: ObjectId | string
  campaignId: string | ObjectId
  userId: string | ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
  isApproved: boolean
  likes: number
  likedBy: (string | ObjectId)[]
  user?: {
    name: string
    image?: string
  }
}

// Request types for API operations
export interface CreateCampaignRequest {
  title: string
  description: string
  imageUrl: string
  category: string
  tags: string[]
  templateData?: {
    width: number
    height: number
    elements: any[]
  }
}

export interface UpdateCampaignRequest {
  title?: string
  description?: string
  imageUrl?: string
  category?: string
  tags?: string[]
  isActive?: boolean
  templateData?: {
    width: number
    height: number
    elements: any[]
  }
}

export interface CreateUserRequest {
  name: string
  email: string
  image?: string
  role?: "user" | "admin" | "moderator"
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  image?: string
  role?: "user" | "admin" | "moderator"
  isActive?: boolean
}

export interface CreateCommentRequest {
  campaignId: string
  content: string
}

export interface UpdateCommentRequest {
  content?: string
  isApproved?: boolean
}

export interface GenerateBannerRequest {
  campaignId: string
  customizations: {
    text?: string
    photo?: string
    colors?: string[]
    fonts?: string[]
    positioning?: {
      textX?: number
      textY?: number
      photoX?: number
      photoY?: number
    }
  }
}

// Admin response types
export interface AdminStats {
  totalUsers: number
  totalCampaigns: number
  totalDownloads: number
  totalViews: number
  totalGeneratedBanners: number
  monthlyGrowth: {
    users: number
    campaigns: number
    downloads: number
    views: number
  }
}

export interface AdminStatsResponse {
  stats: AdminStats
}

export interface AdminUsersResponse {
  users: User[]
  total: number
}

export interface AdminCampaignsResponse {
  campaigns: Campaign[]
  total: number
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Database collections
export interface DatabaseCollections {
  users: "users"
  campaigns: "campaigns"
  generatedBanners: "generatedBanners"
  comments: "comments"
  accounts: "accounts"
  sessions: "sessions"
  verificationTokens: "verificationTokens"
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
