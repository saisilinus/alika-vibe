import { toast } from "@/hooks/use-toast"

// API client with built-in toast notifications
class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`

        // Show error toast
        toast({
          variant: "destructive",
          title: "API Error",
          description: errorMessage,
        })

        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      // Show network error toast
      if (error instanceof TypeError) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Unable to connect to the server. Please check your internet connection.",
        })
      }
      throw error
    }
  }

  // Campaign methods with toast notifications
  async getCampaigns(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)

    const query = searchParams.toString()
    const endpoint = `/campaigns${query ? `?${query}` : ""}`

    return this.request(endpoint)
  }

  async createCampaign(data: {
    title: string
    description: string
    category?: string
    templateUrl: string
    tags?: string[]
  }) {
    const result = await this.request("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    })

    // Show success toast
    toast({
      title: "Success!",
      description: "Campaign created successfully.",
    })

    return result
  }

  async generateBanner(campaignId: string, photoUrl: string) {
    const result = await this.request(`/campaigns/${campaignId}/generate`, {
      method: "POST",
      body: JSON.stringify({ photoUrl }),
    })

    // Show success toast
    toast({
      title: "Banner Generated!",
      description: "Your banner has been created successfully.",
    })

    return result
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Utility functions that can be used anywhere
export const showApiSuccess = (message: string) => {
  toast({
    title: "Success!",
    description: message,
  })
}

export const showApiError = (message: string) => {
  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  })
}

// Example usage in any file:
export const handleFileUpload = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const result = await response.json()

    // Show success toast from outside React component
    toast({
      title: "Upload Successful!",
      description: `File "${file.name}" has been uploaded.`,
    })

    return result
  } catch (error) {
    // Show error toast from outside React component
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: error instanceof Error ? error.message : "An error occurred during upload.",
    })
    throw error
  }
}
