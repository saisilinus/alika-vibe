import api from "./api"
import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  GenerateBannerRequest,
  GeneratedBanner,
} from "@/lib/types"

export const campaignsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all campaigns with filters
    getCampaigns: builder.query<
      Campaign[],
      {
        category?: string
        tags?: string[]
        search?: string
        limit?: number
        page?: number
        sortBy?: "newest" | "popular" | "trending"
      }
    >({
      query: (params) => ({
        url: "/campaigns",
        params,
      }),
      providesTags: ["Campaign"],
    }),

    // Get trending campaigns
    getTrendingCampaigns: builder.query<Campaign[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: "/campaigns/trending",
        params: { limit },
      }),
      providesTags: ["Campaign"],
    }),

    // Get latest campaigns
    getLatestCampaigns: builder.query<Campaign[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: "/campaigns/latest",
        params: { limit },
      }),
      providesTags: ["Campaign"],
    }),

    // Get campaign by ID
    getCampaignById: builder.query<Campaign, string>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),

    // Get similar campaigns
    getSimilarCampaigns: builder.query<
      Campaign[],
      {
        campaignId: string
        limit?: number
      }
    >({
      query: ({ campaignId, limit = 4 }) => ({
        url: `/campaigns/${campaignId}/similar`,
        params: { limit },
      }),
      providesTags: ["Campaign"],
    }),

    // Track campaign view
    trackCampaignView: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/${id}/view`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),

    // Generate banner for campaign
    generateBanner: builder.mutation<GeneratedBanner, GenerateBannerRequest>({
      query: ({ campaignId, customizations }) => ({
        url: `/campaigns/${campaignId}/generate`,
        method: "POST",
        body: { customizations },
      }),
      invalidatesTags: ["GeneratedBanner"],
    }),

    // Create campaign (requires admin/creator role)
    createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
      query: (campaign) => ({
        url: "/campaigns",
        method: "POST",
        body: campaign,
      }),
      invalidatesTags: ["Campaign"],
    }),

    // Update campaign (requires admin/creator role)
    updateCampaign: builder.mutation<
      Campaign,
      {
        id: string
        updates: UpdateCampaignRequest
      }
    >({
      query: ({ id, updates }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Campaign", id }, "Campaign"],
    }),

    // Delete campaign (requires admin role)
    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
  }),
})

export const {
  useGetCampaignsQuery,
  useGetTrendingCampaignsQuery,
  useGetLatestCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetSimilarCampaignsQuery,
  useTrackCampaignViewMutation,
  useGenerateBannerMutation,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignsApi
