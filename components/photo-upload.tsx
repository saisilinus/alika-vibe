"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface PhotoUploadProps {
  onPhotoUpload: (photoUrl: string) => void
  onPhotoSelect?: (photoUrl: string | null) => void
  currentPhoto?: string | null
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export default function PhotoUpload({
  onPhotoUpload,
  onPhotoSelect,
  currentPhoto,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload: ${acceptedTypes.join(", ")}`)
      return false
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size is ${maxSize}MB`)
      return false
    }

    return true
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    return data.url
  }

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return

      setIsUploading(true)

      try {
        // Create preview
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)

        // Upload file
        const uploadedUrl = await uploadFile(file)

        // Call callbacks
        onPhotoUpload(uploadedUrl)
        onPhotoSelect?.(uploadedUrl)

        toast.success("Photo uploaded successfully!")
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload photo. Please try again.")
        setPreview(currentPhoto || null)
      } finally {
        setIsUploading(false)
      }
    },
    [onPhotoUpload, onPhotoSelect, currentPhoto, maxSize, acceptedTypes],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleRemovePhoto = useCallback(() => {
    setPreview(null)
    onPhotoSelect?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Photo removed")
  }, [onPhotoSelect])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-sm font-medium">Upload Photo</div>

          {preview ? (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white">Uploading...</div>
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute -right-2 -top-2"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleFileInputChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isUploading}
              />

              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {isUploading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Drop your photo here, or click to browse"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports: {acceptedTypes.map((type) => type.split("/")[1]).join(", ")} • Max {maxSize}MB
                  </div>
                </div>

                <Button variant="outline" size="sm" disabled={isUploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
