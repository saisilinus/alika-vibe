"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { Eye, Download, Calendar, Share2, Heart, ArrowLeft, Palette, ImageIcon } from "lucide-react"
import PhotoUpload from "@/components/photo-upload"
import CommentsSection from "@/components/comments-section"
import {
  useGetCampaignByIdQuery,
  useIncrementCampaignViewsMutation,
  useGenerateBannerMutation,
  useGetTrendingCampaignsQuery,
} from "@/features"

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { toast } = useToast()

  const [userName, setUserName] = useState("")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBanner, setGeneratedBanner] = useState<string | null>(null)

  // RTK Query hooks
  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useGetCampaignByIdQuery(campaignId)

  const { data: trendingCampaigns } = useGetTrendingCampaignsQuery({ limit: 4 })

  const [incrementViews] = useIncrementCampaignViewsMutation()
  const [generateBanner] = useGenerateBannerMutation()

  // Increment view count when component mounts
  useEffect(() => {
    if (campaignId) {
      incrementViews(campaignId)
    }
  }, [campaignId, incrementViews])

  const handleGenerateBanner = async () => {
    if (!userName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name to generate a banner.",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateBanner({
        campaignId,
        customizations: {
          text: userName,
          // Add other customizations as needed
        },
      }).unwrap()

      setGeneratedBanner(result.imageUrl)
      toast({
        title: "Banner generated successfully!",
        description: "Your personalized banner is ready for download.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate banner. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedBanner) {
      const link = document.createElement("a")
      link.href = generatedBanner
      link.download = `${campaign?.title || "banner"}-${userName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your banner is being downloaded.",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Campaign link copied to clipboard.",
      })
    }
  }

  if (campaignLoading) {
    return <Loading text="Loading campaign..." />
  }

  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h1>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{campaign.category}</Badge>
                      {campaign.isTrending && (
                        <Badge variant="default" className="bg-red-500">
                          Trending
                        </Badge>
                      )}
                      {campaign.isFeatured && (
                        <Badge variant="default" className="bg-blue-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {campaign.viewCount || 0} views
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {campaign.downloadCount || 0} downloads
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Template Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <img
                    src={campaign.templateUrl || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentsSection campaignId={campaignId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Banner Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Generate Your Banner
                </CardTitle>
                <CardDescription>Personalize this template with your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Profile Photo (Optional)</Label>
                  <PhotoUpload onPhotoSelect={setUserPhoto} currentPhoto={userPhoto} />
                </div>

                <Separator />

                {generatedBanner ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={generatedBanner || "/placeholder.svg"}
                        alt="Generated banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleDownload} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => setGeneratedBanner(null)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleGenerateBanner} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Generate Banner
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Similar Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Campaigns</CardTitle>
                <CardDescription>You might also like these</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingCampaigns?.slice(0, 3).map((similarCampaign) => (
                  <div key={similarCampaign._id?.toString()} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={similarCampaign.templateUrl || "/placeholder.svg"}
                        alt={similarCampaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{similarCampaign.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{similarCampaign.description}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3 mr-1" />
                        {similarCampaign.viewCount || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Campaign Creator</div>
                    <div className="text-sm text-gray-500">Platform Member</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Campaigns Created</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Downloads</span>
                    <span className="font-medium">{campaign.downloadCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
