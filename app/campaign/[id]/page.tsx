"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loading } from "@/components/ui/loading"
import { PhotoUpload } from "@/components/photo-upload"
import { BannerPreview } from "@/components/banner-preview"
import { CommentsSection } from "@/components/comments-section"
import { useToast } from "@/hooks/use-toast"
import { Eye, Download, Heart, Share2, Calendar, User, Tag, Sparkles, ArrowLeft, ExternalLink } from "lucide-react"
import {
  useGetCampaignByIdQuery,
  useTrackCampaignViewMutation,
  useGenerateBannerMutation,
  useGetSimilarCampaignsQuery,
} from "@/features"

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { toast } = useToast()

  // State for banner customization
  const [userName, setUserName] = useState("")
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [generatedBanner, setGeneratedBanner] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // RTK Query hooks
  const { data: campaign, isLoading, error } = useGetCampaignByIdQuery(campaignId)
  const { data: similarCampaigns } = useGetSimilarCampaignsQuery({
    campaignId,
    limit: 4,
  })
  const [trackView] = useTrackCampaignViewMutation()
  const [generateBanner] = useGenerateBannerMutation()

  // Track view when component mounts
  useEffect(() => {
    if (campaignId) {
      trackView(campaignId)
    }
  }, [campaignId, trackView])

  const handlePhotoUpload = (photoUrl: string) => {
    setUserPhoto(photoUrl)
  }

  const handleGenerateBanner = async () => {
    if (!userName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name to generate the banner.",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateBanner({
        campaignId,
        customizations: {
          text: userName,
          photo: userPhoto,
        },
      }).unwrap()

      setGeneratedBanner(result.imageUrl)
      toast({
        title: "Banner generated successfully!",
        description: "Your personalized banner is ready for download.",
      })
    } catch (error) {
      console.error("Banner generation error:", error)
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate banner. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadBanner = () => {
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
        console.log("Share cancelled")
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Loading campaign..." />
        </div>
      </div>
    )
  }

  if (error || !campaign) {
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
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Info */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative rounded-t-lg overflow-hidden">
                  <img
                    src={campaign.templateUrl || campaign.imageUrl || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white border-white/30">{campaign.category}</Badge>
                      <div className="flex items-center space-x-4 text-white text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {campaign.viewCount?.toLocaleString() || 0}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {campaign.downloadCount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                      <p className="text-gray-600 text-lg">{campaign.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {campaign.creator?.name || "Anonymous"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {campaign.tags && campaign.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-6">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {campaign.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-3">About this template</h3>
                    <p className="text-gray-600">
                      This template is perfect for creating professional banners for your campaigns. Customize it with
                      your own photo and text to make it uniquely yours.
                    </p>
                  </div>
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
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Your Banner
                </CardTitle>
                <CardDescription>Personalize this template with your own content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <PhotoUpload onPhotoUpload={handlePhotoUpload} onPhotoSelect={setUserPhoto} currentPhoto={userPhoto} />

                <Button onClick={handleGenerateBanner} disabled={isGenerating || !userName.trim()} className="w-full">
                  {isGenerating ? "Generating..." : "Generate Banner"}
                </Button>

                {generatedBanner && (
                  <div className="space-y-4">
                    <BannerPreview imageUrl={generatedBanner} title="Your Generated Banner" />
                    <Button onClick={handleDownloadBanner} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Banner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="font-semibold">{campaign.viewCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Downloads</span>
                  <span className="font-semibold">{campaign.downloadCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="secondary">{campaign.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Campaigns */}
            {similarCampaigns && similarCampaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Templates</CardTitle>
                  <CardDescription>You might also like these</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarCampaigns.map((similar) => (
                    <div key={similar._id?.toString()} className="flex items-center space-x-3">
                      <img
                        src={similar.templateUrl || similar.imageUrl || "/placeholder.svg"}
                        alt={similar.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{similar.title}</p>
                        <p className="text-xs text-gray-500">{similar.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/campaign/${similar._id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
