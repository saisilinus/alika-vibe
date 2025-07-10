import api from "./api"
import type { GeneratedBanner } from "@/lib/types"

export interface GeneratedBannerQueryParams {
  page?: number
  limit?: number
  userId?: string
  campaignId?: string
  sortBy?: "createdAt" | "downloadCount"
  sortOrder?: "asc" | "desc"
}

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
  customizations: {
    text?: string
    colors?: string[]
    fonts?: string[]
  }
}

export interface UpdateGeneratedBannerRequest {
  bannerId: string
  customizations: {
    text?: string
    colors?: string[]
    fonts?: string[]
  }
}

export interface ShareGeneratedBannerRequest {
  bannerId: string
  isPublic: boolean
}

const apiWithGeneratedBannerTags = api.enhanceEndpoints({
  addTagTypes: ["GeneratedBanner"],
})

const generatedBannerApi = apiWithGeneratedBannerTags.injectEndpoints({
  endpoints: (builder) => ({
    getGeneratedBanners: builder.query<GeneratedBannerResponse, GeneratedBannerQueryParams>({
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
                id: _id?.toString(),
              })),
              { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
            ]
          : [{ type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" }],
    }),

    getUserGeneratedBanners: builder.query<GeneratedBannerResponse, { userId: string } & GeneratedBannerQueryParams>({
      query: ({ userId, ...params }) => ({
        url: `users/${userId}/generated-banners`,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.banners
          ? [
              ...result.banners.map(({ _id }) => ({
                type: "GeneratedBanner" as const,
                id: _id?.toString(),
              })),
              { type: "GeneratedBanner", id: "USER-BANNER-LIST" },
            ]
          : [{ type: "GeneratedBanner", id: "USER-BANNER-LIST" }],
    }),

    createGeneratedBanner: builder.mutation<GeneratedBanner, CreateGeneratedBannerRequest>({
      query: (body) => ({
        url: "generated-banners",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
        { type: "GeneratedBanner", id: "USER-BANNER-LIST" },
      ],
    }),

    updateGeneratedBanner: builder.mutation<GeneratedBanner, UpdateGeneratedBannerRequest>({
      query: ({ bannerId, customizations }) => ({
        url: `generated-banners/${bannerId}`,
        method: "PATCH",
        body: { customizations },
      }),
      invalidatesTags: (_result, _error, { bannerId }) => [
        { type: "GeneratedBanner", id: bannerId },
        { type: "GeneratedBanner", id: "PARTIAL-BANNER-LIST" },
        { type: "GeneratedBanner", id: "USER-BANNER-LIST" },
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
        { type: "GeneratedBanner", id: "USER-BANNER-LIST" },
      ],
    }),

    downloadGeneratedBanner: builder.mutation<{ downloadUrl: string }, string>({
      query: (bannerId) => ({
        url: `generated-banners/${bannerId}/download`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, bannerId) => [{ type: "GeneratedBanner", id: bannerId }],
    }),

    shareGeneratedBanner: builder.mutation<{ success: boolean }, ShareGeneratedBannerRequest>({
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
  useGetUserGeneratedBannersQuery,
  useCreateGeneratedBannerMutation,
  useUpdateGeneratedBannerMutation,
  useDeleteGeneratedBannerMutation,
  useDownloadGeneratedBannerMutation,
  useShareGeneratedBannerMutation,
} = generatedBannerApi

export default generatedBannerApi
