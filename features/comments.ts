import api from "./api"
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "@/lib/types"

export const commentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get comments for a campaign
    getComments: builder.query<
      Comment[],
      {
        campaignId: string
        sortBy?: "createdAt" | "likes"
        order?: "asc" | "desc"
      }
    >({
      query: ({ campaignId, sortBy = "createdAt", order = "desc" }) => ({
        url: "/comments",
        params: { campaignId, sortBy, order },
      }),
      providesTags: (result, error, { campaignId }) => [{ type: "Comment", id: `campaign-${campaignId}` }],
    }),

    // Create comment
    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: (comment) => ({
        url: "/comments",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (result, error, { campaignId }) => [{ type: "Comment", id: `campaign-${campaignId}` }],
    }),

    // Update comment
    updateComment: builder.mutation<
      Comment,
      {
        id: string
        updates: UpdateCommentRequest
      }
    >({
      query: ({ id, updates }) => ({
        url: `/comments/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Comment", id }],
    }),

    // Delete comment
    deleteComment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Comment", id }],
    }),

    // Like comment
    likeComment: builder.mutation<Comment, string>({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Comment", id }],
    }),

    // Unlike comment
    unlikeComment: builder.mutation<Comment, string>({
      query: (id) => ({
        url: `/comments/${id}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Comment", id }],
    }),
  }),
})

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = commentsApi
