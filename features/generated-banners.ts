import api from "./api"
import type { GeneratedBanner, GenerateBannerRequest } from "@/lib/types"

export const generatedBannersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's generated banners
    getUserBanners: builder.query<GeneratedBanner[], { userId?: string }>({
      query: (params) => ({
        url: "/generated-banners",
        params,
      }),
      providesTags: ["GeneratedBanner"],
    }),

    // Get banner by ID
    getBannerById: builder.query<GeneratedBanner, string>({
      query: (id) => `/generated-banners/${id}`,
      providesTags: (result, error, id) => [{ type: "GeneratedBanner", id }],
    }),

    // Generate banner - uses existing campaign endpoint
    generateBanner: builder.mutation<{ banner: GeneratedBanner; imageUrl: string }, GenerateBannerRequest>({
      query: ({ campaignId, customizations }) => ({
        url: `/campaigns/${campaignId}/generate`,
        method: "POST",
        body: { customizations },
      }),
      invalidatesTags: ["GeneratedBanner", "Campaign"],
    }),

    // Delete banner
    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({
        url: `/generated-banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GeneratedBanner"],
    }),

    // Download banner (increment download count)
    downloadBanner: builder.mutation<{ downloadUrl: string }, string>({
      query: (id) => ({
        url: `/generated-banners/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "GeneratedBanner", id }],
    }),
  }),
})

export const {
  useGetUserBannersQuery,
  useGetBannerByIdQuery,
  useGenerateBannerMutation,
  useDeleteBannerMutation,
  useDownloadBannerMutation,
} = generatedBannersApi
