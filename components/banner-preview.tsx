"use client"

import { useEffect, useRef } from "react"

interface BannerPreviewProps {
  templateUrl: string
  userPhoto: string | null
  userName: string
  placeholderConfig: {
    photoArea: { x: number; y: number; width: number; height: number; shape: string }
    textArea: { x: number; y: number; width: number; height: number }
  }
}

export default function BannerPreview({ templateUrl, userPhoto, userName, placeholderConfig }: BannerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load and draw template
    const templateImg = new Image()
    templateImg.crossOrigin = "anonymous"
    templateImg.onload = () => {
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height)

      // Draw user photo if available
      if (userPhoto) {
        const userImg = new Image()
        userImg.crossOrigin = "anonymous"
        userImg.onload = () => {
          const { photoArea } = placeholderConfig

          ctx.save()

          if (photoArea.shape === "circle") {
            // Create circular clipping path
            ctx.beginPath()
            ctx.arc(
              photoArea.x + photoArea.width / 2,
              photoArea.y + photoArea.height / 2,
              photoArea.width / 2,
              0,
              2 * Math.PI,
            )
            ctx.clip()
          }

          ctx.drawImage(userImg, photoArea.x, photoArea.y, photoArea.width, photoArea.height)

          ctx.restore()

          // Draw user name
          if (userName) {
            drawUserName()
          }
        }
        userImg.src = userPhoto
      } else {
        // Draw placeholder circle
        const { photoArea } = placeholderConfig
        ctx.strokeStyle = "#ddd"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        if (photoArea.shape === "circle") {
          ctx.beginPath()
          ctx.arc(
            photoArea.x + photoArea.width / 2,
            photoArea.y + photoArea.height / 2,
            photoArea.width / 2,
            0,
            2 * Math.PI,
          )
          ctx.stroke()

          // Draw plus icon
          ctx.setLineDash([])
          ctx.strokeStyle = "#999"
          ctx.lineWidth = 3
          const centerX = photoArea.x + photoArea.width / 2
          const centerY = photoArea.y + photoArea.height / 2
          const size = 20

          ctx.beginPath()
          ctx.moveTo(centerX - size, centerY)
          ctx.lineTo(centerX + size, centerY)
          ctx.moveTo(centerX, centerY - size)
          ctx.lineTo(centerX, centerY + size)
          ctx.stroke()
        }

        // Draw user name
        if (userName) {
          drawUserName()
        }
      }
    }
    templateImg.src = templateUrl

    function drawUserName() {
      if (!userName || !ctx) return

      const { textArea } = placeholderConfig
      ctx.font = "bold 24px Arial"
      ctx.fillStyle = "#333"
      ctx.textAlign = "center"
      ctx.fillText(userName, textArea.x + textArea.width / 2, textArea.y + textArea.height / 2)
    }
  }, [templateUrl, userPhoto, userName, placeholderConfig])

  return (
    <div className="w-full">
      <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border">
        <canvas ref={canvasRef} className="w-full h-full object-contain" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
      <p className="text-sm text-gray-500 text-center mt-2">Live preview of your personalized banner</p>
    </div>
  )
}
