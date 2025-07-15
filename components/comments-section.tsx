"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageCircle, Send } from "lucide-react"
import { useGetCommentsQuery, useCreateCommentMutation, useLikeCommentMutation } from "@/features"

interface CommentsSectionProps {
  campaignId: string
}

export function CommentsSection({ campaignId }: CommentsSectionProps) {
  const { toast } = useToast()
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes">("newest")

  // RTK Query hooks
  const { data: comments, isLoading } = useGetCommentsQuery({
    campaignId,
    sortBy,
  })
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation()
  const [likeComment] = useLikeCommentMutation()

  const handleSubmitComment = async () => {
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
      }).unwrap()

      setNewComment("")
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment. Please try again.",
      })
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId).unwrap()
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments ({comments?.length || 0})
            </CardTitle>
            <CardDescription>Share your thoughts about this campaign</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant={sortBy === "newest" ? "default" : "outline"} size="sm" onClick={() => setSortBy("newest")}>
              Newest
            </Button>
            <Button variant={sortBy === "likes" ? "default" : "outline"} size="sm" onClick={() => setSortBy("likes")}>
              Popular
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <div className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={isCreating || !newComment.trim()}>
              {isCreating ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <Loading text="Loading comments..." />
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id?.toString()} className="flex space-x-4 p-4 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{comment.author?.name?.[0] || comment.author?.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{comment.author?.name || "Anonymous"}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment._id?.toString() || "")}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {comment.likes || 0}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CommentsSection
