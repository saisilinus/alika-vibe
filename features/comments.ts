import api from "./api"
import type { Comment } from "@/lib/types"

export interface CommentQueryParams {
  campaignId: string
  page?: number
  limit?: number
  sortBy?: "createdAt" | "likes"
  sortOrder?: "asc" | "desc"
}

export interface CommentResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateCommentRequest {
  campaignId: string
  content: string
}

export interface UpdateCommentRequest {
  commentId: string
  content: string
}

export interface LikeCommentRequest {
  commentId: string
}

export interface ReportCommentRequest {
  commentId: string
  reason: string
}

const apiWithCommentTags = api.enhanceEndpoints({
  addTagTypes: ["Comment"],
})

const commentApi = apiWithCommentTags.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<CommentResponse, CommentQueryParams>({
      query: ({ campaignId, ...params }) => ({
        url: `campaigns/${campaignId}/comments`,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.comments
          ? [
              ...result.comments.map(({ _id }) => ({
                type: "Comment" as const,
                id: _id?.toString(),
              })),
              { type: "Comment", id: "PARTIAL-COMMENT-LIST" },
            ]
          : [{ type: "Comment", id: "PARTIAL-COMMENT-LIST" }],
    }),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: ({ campaignId, content }) => ({
        url: `campaigns/${campaignId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: [{ type: "Comment", id: "PARTIAL-COMMENT-LIST" }],
    }),

    updateComment: builder.mutation<Comment, UpdateCommentRequest>({
      query: ({ commentId, content }) => ({
        url: `comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { commentId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: "PARTIAL-COMMENT-LIST" },
      ],
    }),

    deleteComment: builder.mutation<{ success: boolean }, string>({
      query: (commentId) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, commentId) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: "PARTIAL-COMMENT-LIST" },
      ],
    }),

    likeComment: builder.mutation<{ success: boolean; liked: boolean }, LikeCommentRequest>({
      query: ({ commentId }) => ({
        url: `comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { commentId }) => [{ type: "Comment", id: commentId }],
    }),

    reportComment: builder.mutation<{ success: boolean }, ReportCommentRequest>({
      query: ({ commentId, reason }) => ({
        url: `comments/${commentId}/report`,
        method: "POST",
        body: { reason },
      }),
    }),
  }),
})

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useReportCommentMutation,
} = commentApi

export default commentApi
