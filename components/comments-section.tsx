"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, Send } from "lucide-react"

interface CommentsSectionProps {
  campaignId: number
}

// Mock comments data
const mockComments = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: true,
    },
    content: "This is such a great campaign! The design looks amazing and the concept is really helpful for students.",
    timestamp: "2 hours ago",
    likes: 12,
    replies: [],
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: false,
    },
    content: "Just generated my banner and it looks fantastic! Thanks for creating this.",
    timestamp: "5 hours ago",
    likes: 8,
    replies: [
      {
        id: 3,
        user: {
          name: "Tech University",
          avatar: "/placeholder.svg?height=32&width=32",
          verified: true,
        },
        content: "So glad you liked it! Feel free to share it with your friends.",
        timestamp: "4 hours ago",
        likes: 3,
      },
    ],
  },
  {
    id: 4,
    user: {
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: false,
    },
    content: "The photo upload feature works perfectly. Very smooth experience overall!",
    timestamp: "1 day ago",
    likes: 15,
    replies: [],
  },
]

export default function CommentsSection({ campaignId }: CommentsSectionProps) {
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const comment = {
      id: Date.now(),
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        verified: false,
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
    setIsSubmitting(false)
  }

  const handleLike = (commentId: number) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
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
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-sm">{comment.user.name}</p>
                    {comment.user.verified && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                      className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-11 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={reply.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-xs">{reply.user.name}</p>
                          {reply.user.verified && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{reply.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-700 mb-1">{reply.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto p-1 text-gray-500 hover:text-blue-600"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {reply.likes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="ghost" className="text-blue-600">
            Load more comments
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
