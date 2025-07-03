"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, X, RotateCcw } from "lucide-react"

interface PhotoUploadProps {
  onPhotoUpload: (photoUrl: string) => void
}

export default function PhotoUpload({ onPhotoUpload }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file)
      setUploadedPhoto(objectUrl)
      onPhotoUpload(objectUrl)

      // In real implementation, upload to server here
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      alert("Failed to upload photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setUploadedPhoto(null)
    onPhotoUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

      {!uploadedPhoto ? (
        <Card
          className={`relative border-2 border-dashed transition-colors cursor-pointer ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isUploading ? "Uploading..." : "Upload your photo"}
            </p>
            <p className="text-sm text-gray-500 text-center mb-4">Drag and drop your image here, or click to browse</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>JPG, PNG, WebP</span>
              <span>•</span>
              <span>Max 5MB</span>
            </div>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={uploadedPhoto || "/placeholder.svg"}
                alt="Uploaded photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClick()
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove()
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
