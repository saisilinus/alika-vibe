"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Calendar, ThumbsUp } from "lucide-react"
import { useGetCommentsQuery, useCreateCommentMutation, useLikeCommentMutation } from "@/features"

interface CommentsSectionProps {
  campaignId: string
}

export default function CommentsSection({ campaignId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // RTK Query hooks
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useGetCommentsQuery({
    campaignId,
    sortBy,
  })

  const [createComment, { isLoading: createLoading }] = useCreateCommentMutation()
  const [likeComment, { isLoading: likeLoading }] = useLikeCommentMutation()

  const handleSubmitComment = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to post a comment.",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment required",
        description: "Please enter a comment before submitting.",
      })
      return
    }

    try {
      await createComment({
        campaignId,
        content: newComment.trim(),
        userId: (session.user as any)?.id,
      }).unwrap()

      setNewComment("")
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to post comment",
        description: "Please try again later.",
      })
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to like comments.",
      })
      return
    }

    try {
      await likeComment({
        commentId,
        userId: (session.user as any)?.id,
      }).unwrap()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to like comment",
        description: "Please try again later.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({comments?.length || 0})
          </CardTitle>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {session ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts about this campaign..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSubmitComment} disabled={createLoading || !newComment.trim()} size="sm">
                    {createLoading ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Please log in to post a comment</p>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <Loading text="Loading comments..." />
        ) : commentsError ? (
          <div className="text-center py-4">
            <p className="text-red-600">Error loading comments</p>
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div key={comment._id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.image || ""} />
                  <AvatarFallback>{comment.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.user?.name || "Anonymous"}</span>
                    {comment.user?.role === "admin" && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                    {comment.user?.role === "moderator" && (
                      <Badge variant="outline" className="text-xs">
                        Moderator
                      </Badge>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment._id)}
                      disabled={likeLoading}
                      className="h-6 px-2 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {comment.likes?.length || 0}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
