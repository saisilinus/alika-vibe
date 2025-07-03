"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, Facebook, Twitter, Linkedin, Download, ArrowLeft } from "lucide-react"
import PhotoUpload from "@/components/photo-upload"
import BannerPreview from "@/components/banner-preview"
import CommentsSection from "@/components/comments-section"

// Mock campaign data - replace with real API call
const campaignData = {
  id: 1,
  title: "Cracking the Code 1.0",
  description:
    "University Life Career Launch & Beyond - Join us for an intensive workshop designed to help students transition from university life to successful careers. This comprehensive program covers resume building, interview skills, networking strategies, and industry insights from leading professionals.",
  category: "Education",
  creator: {
    name: "Tech University",
    avatar: "/placeholder.svg?height=40&width=40",
    verified: true,
  },
  viewCount: 1250,
  downloadCount: 890,
  createdAt: "2024-01-15",
  templateUrl: "/placeholder.svg?height=400&width=600",
  placeholderConfig: {
    photoArea: { x: 450, y: 150, width: 120, height: 120, shape: "circle" },
    textArea: { x: 200, y: 300, width: 200, height: 40 },
  },
  tags: ["Education", "Career", "University", "Workshop"],
  isTrending: true,
}

const trendingCampaigns = [
  {
    id: 2,
    title: "Summer Music Festival",
    thumbnail: "/placeholder.svg?height=150&width=200",
    viewCount: 890,
    category: "Music",
  },
  {
    id: 3,
    title: "Tech Conference 2024",
    thumbnail: "/placeholder.svg?height=150&width=200",
    viewCount: 2100,
    category: "Technology",
  },
  {
    id: 4,
    title: "Business Networking",
    thumbnail: "/placeholder.svg?height=150&width=200",
    viewCount: 650,
    category: "Business",
  },
  {
    id: 5,
    title: "Art Exhibition",
    thumbnail: "/placeholder.svg?height=150&width=200",
    viewCount: 420,
    category: "Art",
  },
]

export default function CampaignDetailPage() {
  const [userName, setUserName] = useState("")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newComment, setNewComment] = useState("")

  const handlePhotoUpload = (photoUrl: string) => {
    setUserPhoto(photoUrl)
  }

  const handleGenerateBanner = async () => {
    if (!userName.trim()) {
      alert("Please enter your name")
      return
    }

    setIsGenerating(true)

    // Simulate banner generation
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // In real implementation, this would call the backend API
      const generatedBannerUrl = `/generated/banner-${Date.now()}.png`

      // Trigger download
      const link = document.createElement("a")
      link.href = generatedBannerUrl
      link.download = `${campaignData.title.toLowerCase().replace(/\s+/g, "-")}-${userName.toLowerCase().replace(/\s+/g, "-")}.png`
      link.click()

      alert("Banner generated successfully!")
    } catch (error) {
      alert("Failed to generate banner. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Check out this amazing campaign: ${campaignData.title}`

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Campaign Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* Campaign Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {campaignData.category}
                  </Badge>
                  {campaignData.isTrending && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Trending
                    </Badge>
                  )}
                </div>

                {/* Campaign Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{campaignData.title}</h1>

                {/* Creator Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={campaignData.creator.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{campaignData.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{campaignData.creator.name}</p>
                    <p className="text-sm text-gray-500">Campaign Creator</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {campaignData.viewCount.toLocaleString()} views
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {campaignData.downloadCount} downloads
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(campaignData.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About this Campaign</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{campaignData.description}</p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaignData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Social Sharing */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Share this Campaign</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleShare("facebook")} className="flex-1">
                      <Facebook className="h-4 w-4 mr-1" />
                      Facebook
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare("twitter")} className="flex-1">
                      <Twitter className="h-4 w-4 mr-1" />
                      Twitter
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare("linkedin")} className="flex-1">
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Area - Banner Customization */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                {/* Banner Preview */}
                <div className="mb-6">
                  <BannerPreview
                    templateUrl={campaignData.templateUrl}
                    userPhoto={userPhoto}
                    userName={userName}
                    placeholderConfig={campaignData.placeholderConfig}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Upload Your Photo</h3>
                  <PhotoUpload onPhotoUpload={handlePhotoUpload} />
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Name</h3>
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Generate Button */}
                <div className="mb-6">
                  <Button
                    onClick={handleGenerateBanner}
                    disabled={isGenerating || !userName.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating your DP...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Generate my DP
                      </>
                    )}
                  </Button>
                </div>

                {/* Public Display Checkbox */}
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <label htmlFor="public" className="text-sm text-gray-600">
                    Display my name and campaign publicly
                  </label>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center">
                  Not sure how to create your personalized DP?{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    View tutorial
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentsSection campaignId={campaignData.id} />

            {/* Trending Section */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Campaigns</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingCampaigns.map((campaign) => (
                    <Card
                      key={campaign.id}
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={campaign.thumbnail || "/placeholder.svg"}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">{campaign.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{campaign.category}</span>
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {campaign.viewCount}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
