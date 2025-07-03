const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface Campaign {
  _id: string
  title: string
  description: string
  category: string
  templateUrl?: string
  creatorId: string
  viewCount: number
  downloadCount: number
  isTrending: boolean
  isFeatured: boolean
  placeholderConfig: Record<string, any>
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface GeneratedBanner {
  _id: string
  campaignId: string
  userName: string
  userPhotoUrl?: string
  generatedBannerUrl: string
  isPublic: boolean
  createdAt: string
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "An error occurred" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error occurred" }
    }
  }

  // Campaign methods
  async getCampaigns(params?: {
    category?: string
    search?: string
    sort?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ campaigns: Campaign[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/campaigns?${searchParams.toString()}`)
  }

  async getTrendingCampaigns(): Promise<ApiResponse<{ campaigns: Campaign[] }>> {
    return this.request("/campaigns/trending")
  }

  async getLatestCampaigns(): Promise<ApiResponse<{ campaigns: Campaign[] }>> {
    return this.request("/campaigns/latest")
  }

  async getCampaign(id: string): Promise<ApiResponse<{ campaign: Campaign; recentBanners: any[] }>> {
    return this.request(`/campaigns/${id}`)
  }

  async incrementCampaignViews(id: string): Promise<ApiResponse> {
    return this.request(`/campaigns/${id}/view`, { method: "POST" })
  }

  async generateBanner(
    campaignId: string,
    data: { userName: string; userPhoto?: string; isPublic?: boolean },
  ): Promise<ApiResponse<{ banner: GeneratedBanner; downloadUrl: string }>> {
    return this.request(`/campaigns/${campaignId}/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Admin methods
  async getAdminStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request("/admin/stats")
  }
}

export const api = new ApiClient()
