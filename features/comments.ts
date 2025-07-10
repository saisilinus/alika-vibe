import api from "./api"
import type { Comment } from "@/lib/types"

export interface CommentResponse {
  comments: Array<
    Comment & {
      user: {
        name: string
        image?: string
      }
    }
  >
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
  parentId?: string
}

export interface UpdateCommentRequest {
  commentId: string
  content: string
}

export interface LikeCommentRequest {
  commentId: string
}

const apiWithCommentTags = api.enhanceEndpoints({ addTagTypes: ["Comment"] })

const commentApi = apiWithCommentTags.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<CommentResponse, { campaignId: string; page?: number; limit?: number }>({
      query: ({ campaignId, page = 1, limit = 10 }) => ({
        url: `comments`,
        method: "GET",
        params: { campaignId, page, limit },
      }),
      providesTags: (result, _error, { campaignId }) =>
        result?.comments
          ? [
              ...result.comments.map(({ _id }) => ({
                type: "Comment" as const,
                id: _id,
              })),
              { type: "Comment", id: `CAMPAIGN-${campaignId}` },
            ]
          : [{ type: "Comment", id: `CAMPAIGN-${campaignId}` }],
    }),

    createComment: builder.mutation<{ success: boolean; commentId: string }, CreateCommentRequest>({
      query: (body) => ({
        url: "comments",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { campaignId }) => [{ type: "Comment", id: `CAMPAIGN-${campaignId}` }],
    }),

    updateComment: builder.mutation<{ success: boolean }, UpdateCommentRequest>({
      query: ({ commentId, content }) => ({
        url: `comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { commentId }) => [{ type: "Comment", id: commentId }],
    }),

    deleteComment: builder.mutation<{ success: boolean }, string>({
      query: (commentId) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, commentId) => [{ type: "Comment", id: commentId }],
    }),

    likeComment: builder.mutation<{ success: boolean; likesCount: number }, LikeCommentRequest>({
      query: ({ commentId }) => ({
        url: `comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { commentId }) => [{ type: "Comment", id: commentId }],
    }),

    unlikeComment: builder.mutation<{ success: boolean; likesCount: number }, LikeCommentRequest>({
      query: ({ commentId }) => ({
        url: `comments/${commentId}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { commentId }) => [{ type: "Comment", id: commentId }],
    }),

    reportComment: builder.mutation<{ success: boolean }, { commentId: string; reason: string }>({
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
  useUnlikeCommentMutation,
  useReportCommentMutation,
} = commentApi

export default commentApi
