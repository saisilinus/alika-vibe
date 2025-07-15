"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

interface BannerPreviewProps {
  imageUrl: string
  title?: string
  onDownload?: () => void
  onShare?: () => void
}

export function BannerPreview({ imageUrl, title = "Generated Banner", onDownload, onShare }: BannerPreviewProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{title}</h3>
            <div className="flex space-x-2">
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              {onDownload && (
                <Button size="sm" onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BannerPreview
