"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, Send } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/hooks/use-toast"
import { useGetCommentsQuery, useCreateCommentMutation, useLikeCommentMutation } from "@/features"

interface CommentsSectionProps {
  campaignId: string
}

export default function CommentsSection({ campaignId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // RTK Query hooks
  const { data: commentsData, isLoading: commentsLoading } = useGetCommentsQuery({ campaignId, sortBy })

  // Mutations
  const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation()
  const [likeComment] = useLikeCommentMutation()

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      await createComment({
        campaignId,
        content: newComment,
      }).unwrap()

      toast({
        title: "Success!",
        description: "Comment posted successfully.",
      })

      setNewComment("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment.",
      })
    }
  }

  const handleLike = async (commentId: string) => {
    try {
      await likeComment({ commentId }).unwrap()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like comment.",
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Comments ({commentsData?.total || 0})</h3>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="popular">Most popular</option>
          </select>
        </div>

        {/* Comment Input */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Be respectful and constructive in your comments</p>
                <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {commentsLoading ? (
          <Loading text="Loading comments..." />
        ) : (
          <div className="space-y-6">
            {commentsData?.comments?.map((comment) => (
              <div key={comment._id?.toString()} className="space-y-3">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm">{comment.user?.name || "Anonymous"}</p>
                      {comment.user?.verified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment._id?.toString() || "")}
                        className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id?.toString()} className="flex space-x-3">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={reply.user?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{reply.user?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-xs">{reply.user?.name || "Anonymous"}</p>
                            {reply.user?.verified && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                ✓
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 mb-1">{reply.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {reply.likes || 0}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {commentsData?.hasMore && (
          <div className="text-center mt-6">
            <Button variant="ghost" className="text-blue-600">
              Load more comments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
