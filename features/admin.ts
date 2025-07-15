import api from "./api"
import type { AdminStatsResponse, AdminUsersResponse, AdminCampaignsResponse, User, Campaign } from "@/lib/types"

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin statistics - uses existing endpoint
    getAdminStats: builder.query<AdminStatsResponse, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),

    // Get all users for admin - would need to be implemented
    getAdminUsers: builder.query<AdminUsersResponse, void>({
      query: () => "/admin/users",
      providesTags: ["AdminUsers"],
    }),

    // Get all campaigns for admin - would need to be implemented
    getAdminCampaigns: builder.query<AdminCampaignsResponse, void>({
      query: () => "/admin/campaigns",
      providesTags: ["AdminCampaigns"],
    }),

    // Update user role - would need to be implemented
    updateUserRole: builder.mutation<
      User,
      {
        userId: string
        role: string
      }
    >({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Delete user - would need to be implemented
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Update campaign status - would need to be implemented
    updateCampaignStatus: builder.mutation<
      Campaign,
      {
        campaignId: string
        status: string
      }
    >({
      query: ({ campaignId, status }) => ({
        url: `/admin/campaigns/${campaignId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["AdminCampaigns", "Campaign"],
    }),

    // Delete campaign (admin) - would need to be implemented
    deleteAdminCampaign: builder.mutation<void, string>({
      query: (campaignId) => ({
        url: `/admin/campaigns/${campaignId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminCampaigns", "Campaign"],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCampaignsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUpdateCampaignStatusMutation,
  useDeleteAdminCampaignMutation,
} = adminApi
