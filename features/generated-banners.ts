import api from "./api"
import type { GeneratedBanner } from "@/lib/types"

export interface GeneratedBannerResponse {
  banners: GeneratedBanner[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateGeneratedBannerRequest {
  campaignId: string
  customizations: Record<string, any>
}

export interface UpdateGeneratedBannerRequest {
  bannerId: string
  customizations: Record<string, any>
}

const apiWithGeneratedBannerTags = api.enhanceEndpoints({ addTagTypes: ["GeneratedBanner"] })

const generatedBannerApi = apiWithGeneratedBannerTags.injectEndpoints({
  endpoints: (builder) => ({
    getGeneratedBanners: builder.query<GeneratedBannerResponse, { page?: number; limit?: number; userId?: string }>({
      query: (params) => ({
        url: "generated-banners",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.banners
          ? [
              ...result.banners.map(({ _id }) => ({
                type: "GeneratedBanner" as const,
                id: _id,
              })),
              { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
            ]
          : [{ type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" }],
    }),

    getGeneratedBannerById: builder.query<GeneratedBanner, string>({
      query: (id) => ({
        url: `generated-banners/${id}`,
        method: "GET",
      }),
      providesTags: (result) => (result ? [{ type: "GeneratedBanner", id: result._id }] : ["GeneratedBanner"]),
    }),

    getUserGeneratedBanners: builder.query<GeneratedBannerResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "generated-banners/user",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "GeneratedBanner", id: "USER-BANNERS" }],
    }),

    createGeneratedBanner: builder.mutation<
      { success: boolean; bannerId: string; imageUrl: string },
      CreateGeneratedBannerRequest
    >({
      query: (body) => ({
        url: "generated-banners",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
        { type: "GeneratedBanner", id: "USER-BANNERS" },
      ],
    }),

    updateGeneratedBanner: builder.mutation<{ success: boolean }, UpdateGeneratedBannerRequest>({
      query: ({ bannerId, customizations }) => ({
        url: `generated-banners/${bannerId}`,
        method: "PATCH",
        body: { customizations },
      }),
      invalidatesTags: (_result, _error, { bannerId }) => [
        { type: "GeneratedBanner", id: bannerId },
        { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
        { type: "GeneratedBanner", id: "USER-BANNERS" },
      ],
    }),

    deleteGeneratedBanner: builder.mutation<{ success: boolean }, string>({
      query: (bannerId) => ({
        url: `generated-banners/${bannerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, bannerId) => [
        { type: "GeneratedBanner", id: bannerId },
        { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
        { type: "GeneratedBanner", id: "USER-BANNERS" },
      ],
    }),

    downloadGeneratedBanner: builder.mutation<{ success: boolean; downloadUrl: string }, string>({
      query: (bannerId) => ({
        url: `generated-banners/${bannerId}/download`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, bannerId) => [{ type: "GeneratedBanner", id: bannerId }],
    }),

    shareGeneratedBanner: builder.mutation<
      { success: boolean; shareUrl: string },
      { bannerId: string; isPublic: boolean }
    >({
      query: ({ bannerId, isPublic }) => ({
        url: `generated-banners/${bannerId}/share`,
        method: "POST",
        body: { isPublic },
      }),
      invalidatesTags: (_result, _error, { bannerId }) => [{ type: "GeneratedBanner", id: bannerId }],
    }),
  }),
})

export const {
  useGetGeneratedBannersQuery,
  useGetGeneratedBannerByIdQuery,
  useGetUserGeneratedBannersQuery,
  useCreateGeneratedBannerMutation,
  useUpdateGeneratedBannerMutation,
  useDeleteGeneratedBannerMutation,
  useDownloadGeneratedBannerMutation,
  useShareGeneratedBannerMutation,
} = generatedBannerApi

export default generatedBannerApi
