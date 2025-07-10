import api from "./api"
import type { Campaign } from "@/lib/types"

export interface CampaignQueryParams {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export interface CampaignResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CampaignDetailsResponse {
  campaign: Campaign
  comments: Array<{
    _id: string
    content: string
    createdAt: string
    user: {
      name: string
      image?: string
    }
  }>
}

export interface CreateCampaignRequest {
  title: string
  description: string
  imageUrl: string
  category: string
  tags?: string[]
  templateData?: {
    width: number
    height: number
    elements: any[]
  }
}

const apiWithCampaignTags = api.enhanceEndpoints({ addTagTypes: ["Campaign"] })

const campaignApi = apiWithCampaignTags.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<CampaignResponse, CampaignQueryParams>({
      query: (params) => ({
        url: "campaigns",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.campaigns
          ? [
              ...result.campaigns.map(({ _id }) => ({
                type: "Campaign" as const,
                id: _id?.toString(),
              })),
              { type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" },
            ]
          : [{ type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" }],
    }),

    getTrendingCampaigns: builder.query<{ campaigns: Campaign[] }, void>({
      query: () => ({
        url: "campaigns/trending",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.campaigns
          ? [
              ...result.campaigns.map(({ _id }) => ({
                type: "Campaign" as const,
                id: _id?.toString(),
              })),
              { type: "Campaign", id: "TRENDING-LIST" },
            ]
          : [{ type: "Campaign", id: "TRENDING-LIST" }],
    }),

    getLatestCampaigns: builder.query<{ campaigns: Campaign[] }, void>({
      query: () => ({
        url: "campaigns/latest",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.campaigns
          ? [
              ...result.campaigns.map(({ _id }) => ({
                type: "Campaign" as const,
                id: _id?.toString(),
              })),
              { type: "Campaign", id: "LATEST-LIST" },
            ]
          : [{ type: "Campaign", id: "LATEST-LIST" }],
    }),

    getCampaignById: builder.query<CampaignDetailsResponse, string>({
      query: (id) => ({
        url: `campaigns/${id}`,
        method: "GET",
      }),
      providesTags: (result) => (result ? [{ type: "Campaign", id: result.campaign._id?.toString() }] : ["Campaign"]),
    }),

    createCampaign: builder.mutation<{ success: boolean; campaignId: string }, CreateCampaignRequest>({
      query: (body) => ({
        url: "campaigns",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" },
        { type: "Campaign", id: "TRENDING-LIST" },
        { type: "Campaign", id: "LATEST-LIST" },
      ],
    }),

    incrementCampaignViews: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `campaigns/${id}/view`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Campaign", id },
        { type: "Campaign", id: "TRENDING-LIST" },
      ],
    }),

    generateBanner: builder.mutation<
      { success: boolean; bannerId: string; imageUrl: string },
      { campaignId: string; customizations: Record<string, any> }
    >({
      query: ({ campaignId, customizations }) => ({
        url: `campaigns/${campaignId}/generate`,
        method: "POST",
        body: { customizations },
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [{ type: "Campaign", id: campaignId }, "GeneratedBanner"],
    }),
  }),
})

export const {
  useGetCampaignsQuery,
  useGetTrendingCampaignsQuery,
  useGetLatestCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useIncrementCampaignViewsMutation,
  useGenerateBannerMutation,
} = campaignApi

export default campaignApi
