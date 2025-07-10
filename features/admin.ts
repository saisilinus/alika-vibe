import api from "./api"
import type { Campaign, User } from "@/lib/types"

export interface AdminStats {
  totalUsers: number
  totalCampaigns: number
  totalGeneratedBanners: number
  totalViews: number
  totalDownloads: number
}

export interface AdminStatsResponse {
  stats: AdminStats
  recentCampaigns: Campaign[]
}

export interface AdminUsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AdminCampaignsResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UpdateUserRoleRequest {
  userId: string
  role: "user" | "admin" | "moderator"
}

export interface UpdateCampaignRequest {
  campaignId: string
  updates: Partial<Campaign>
}

const apiWithAdminTags = api.enhanceEndpoints({
  addTagTypes: ["AdminStats", "AdminUsers", "AdminCampaigns"],
})

const adminApi = apiWithAdminTags.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsResponse, void>({
      query: () => ({
        url: "admin/stats",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.recentCampaigns
          ? [
              ...result.recentCampaigns.map(({ _id }) => ({
                type: "Campaign" as const,
                id: _id?.toString(),
              })),
              "AdminStats",
            ]
          : ["AdminStats"],
    }),

    getAdminUsers: builder.query<AdminUsersResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "admin/users",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ _id }) => ({
                type: "AdminUsers" as const,
                id: _id?.toString(),
              })),
              { type: "AdminUsers", id: "PARTIAL-USERS-LIST" },
            ]
          : [{ type: "AdminUsers", id: "PARTIAL-USERS-LIST" }],
    }),

    getAdminCampaigns: builder.query<AdminCampaignsResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "admin/campaigns",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.campaigns
          ? [
              ...result.campaigns.map(({ _id }) => ({
                type: "AdminCampaigns" as const,
                id: _id?.toString(),
              })),
              { type: "AdminCampaigns", id: "PARTIAL-ADMIN-CAMPAIGNS-LIST" },
            ]
          : [{ type: "AdminCampaigns", id: "PARTIAL-ADMIN-CAMPAIGNS-LIST" }],
    }),

    updateUserRole: builder.mutation<{ success: boolean }, UpdateUserRoleRequest>({
      query: ({ userId, role }) => ({
        url: `admin/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "AdminUsers", id: userId },
        { type: "AdminUsers", id: "PARTIAL-USERS-LIST" },
        "AdminStats",
      ],
    }),

    updateCampaign: builder.mutation<{ success: boolean }, UpdateCampaignRequest>({
      query: ({ campaignId, updates }) => ({
        url: `admin/campaigns/${campaignId}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        { type: "AdminCampaigns", id: campaignId },
        { type: "AdminCampaigns", id: "PARTIAL-ADMIN-CAMPAIGNS-LIST" },
        { type: "Campaign", id: campaignId },
        { type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" },
        "AdminStats",
      ],
    }),

    deleteCampaign: builder.mutation<{ success: boolean }, string>({
      query: (campaignId) => ({
        url: `admin/campaigns/${campaignId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, campaignId) => [
        { type: "AdminCampaigns", id: campaignId },
        { type: "AdminCampaigns", id: "PARTIAL-ADMIN-CAMPAIGNS-LIST" },
        { type: "Campaign", id: campaignId },
        { type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" },
        "AdminStats",
      ],
    }),

    toggleCampaignStatus: builder.mutation<{ success: boolean }, { campaignId: string; isActive: boolean }>({
      query: ({ campaignId, isActive }) => ({
        url: `admin/campaigns/${campaignId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [
        { type: "AdminCampaigns", id: campaignId },
        { type: "AdminCampaigns", id: "PARTIAL-ADMIN-CAMPAIGNS-LIST" },
        { type: "Campaign", id: campaignId },
        { type: "Campaign", id: "PARTIAL-CAMPAIGN-LIST" },
        "AdminStats",
      ],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCampaignsQuery,
  useUpdateUserRoleMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useToggleCampaignStatusMutation,
} = adminApi

export default adminApi
