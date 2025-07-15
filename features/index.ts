// Export all API slices and hooks
export * from "./api"
export * from "./campaigns"
export * from "./admin"
export * from "./auth"
export * from "./comments"
export * from "./generated-banners"

// Re-export commonly used hooks for convenience
export {
  // Campaign hooks
  useGetCampaignsQuery,
  useGetTrendingCampaignsQuery,
  useGetLatestCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetSimilarCampaignsQuery,
  useCreateCampaignMutation,
  useTrackCampaignViewMutation,
  useGenerateBannerMutation,
  // Admin hooks
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCampaignsQuery,
  // Comment hooks
  useGetCommentsQuery,
  useCreateCommentMutation,
  useLikeCommentMutation,
  // Generated banner hooks
  useGetUserBannersQuery,
  useDownloadBannerMutation,
} from "./campaigns"
