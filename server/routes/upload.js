const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const path = require("path")
const fs = require("fs").promises
const { v4: uuidv4 } = require("uuid")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Ensure upload directories exist
const ensureDirectories = async () => {
  const dirs = ["uploads/photos", "uploads/templates", "uploads/generated"]
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error)
    }
  }
}

ensureDirectories()

// Upload user photo
router.post("/photo", optionalAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileId = uuidv4()
    const filename = `photo-${fileId}.jpg`
    const filepath = path.join("uploads/photos", filename)

    // Process image with Sharp
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(filepath)

    const photoUrl = `/uploads/photos/${filename}`

    res.json({
      message: "Photo uploaded successfully",
      photoUrl,
      filename,
    })
  } catch (error) {
    console.error("Photo upload error:", error)
    res.status(500).json({ error: "Failed to upload photo" })
  }
})

// Upload campaign template (admin only)
router.post("/template", authenticateToken, upload.single("template"), async (req, res) => {
  try {
    // Check if user is admin or moderator
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileId = uuidv4()
    const filename = `template-${fileId}.jpg`
    const filepath = path.join("uploads/templates", filename)

    // Process template image
    await sharp(req.file.buffer)
      .resize(1200, 630, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toFile(filepath)

    const templateUrl = `/uploads/templates/${filename}`

    res.json({
      message: "Template uploaded successfully",
      templateUrl,
      filename,
    })
  } catch (error) {
    console.error("Template upload error:", error)
    res.status(500).json({ error: "Failed to upload template" })
  }
})

// Generate banner
router.post("/generate-banner", async (req, res) => {
  try {
    const { campaignId, userName, userPhotoUrl, templateUrl, placeholderConfig } = req.body

    if (!campaignId || !userName || !templateUrl) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const fileId = uuidv4()
    const filename = `banner-${campaignId}-${fileId}.jpg`
    const filepath = path.join("uploads/generated", filename)

    // Load template image
    const templatePath = templateUrl.startsWith("/uploads/")
      ? path.join(".", templateUrl)
      : path.join("uploads/templates", "default-template.jpg")

    let banner = sharp(templatePath)

    // Get template metadata
    const metadata = await banner.metadata()
    const { width = 1200, height = 630 } = metadata

    // Create a composite image
    const compositeOperations = []

    // Add user photo if provided
    if (userPhotoUrl && placeholderConfig?.photoArea) {
      try {
        const photoPath = userPhotoUrl.startsWith("/uploads/") ? path.join(".", userPhotoUrl) : userPhotoUrl

        const { photoArea } = placeholderConfig
        let userPhoto = sharp(photoPath)

        // Resize and crop user photo
        if (photoArea.shape === "circle") {
          // Create circular mask
          const mask = Buffer.from(
            `<svg width="${photoArea.width}" height="${photoArea.height}">
               <circle cx="${photoArea.width / 2}" cy="${photoArea.height / 2}" r="${photoArea.width / 2}" fill="white"/>
             </svg>`,
          )

          userPhoto = userPhoto
            .resize(photoArea.width, photoArea.height, { fit: "cover" })
            .composite([{ input: mask, blend: "dest-in" }])
        } else {
          userPhoto = userPhoto.resize(photoArea.width, photoArea.height, { fit: "cover" })
        }

        const processedPhoto = await userPhoto.png().toBuffer()

        compositeOperations.push({
          input: processedPhoto,
          top: photoArea.y,
          left: photoArea.x,
        })
      } catch (photoError) {
        console.error("Error processing user photo:", photoError)
        // Continue without photo if there's an error
      }
    }

    // Add text overlay
    if (userName && placeholderConfig?.textArea) {
      try {
        const { textArea } = placeholderConfig
        const fontSize = Math.min(textArea.height * 0.6, 48)

        const textSvg = `
          <svg width="${textArea.width}" height="${textArea.height}">
            <text x="50%" y="50%" 
                  font-family="Arial, sans-serif" 
                  font-size="${fontSize}" 
                  font-weight="bold" 
                  fill="#333333" 
                  text-anchor="middle" 
                  dominant-baseline="middle">
              ${userName}
            </text>
          </svg>
        `

        const textBuffer = Buffer.from(textSvg)

        compositeOperations.push({
          input: textBuffer,
          top: textArea.y,
          left: textArea.x,
        })
      } catch (textError) {
        console.error("Error adding text overlay:", textError)
      }
    }

    // Apply all composite operations
    if (compositeOperations.length > 0) {
      banner = banner.composite(compositeOperations)
    }

    // Save the final banner
    await banner
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toFile(filepath)

    const bannerUrl = `/uploads/generated/${filename}`

    res.json({
      message: "Banner generated successfully",
      bannerUrl,
      filename,
      downloadUrl: bannerUrl,
    })
  } catch (error) {
    console.error("Banner generation error:", error)
    res.status(500).json({ error: "Failed to generate banner" })
  }
})

// Download generated banner
router.get("/download/:filename", (req, res) => {
  try {
    const { filename } = req.params
    const filepath = path.join("uploads/generated", filename)

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("Content-Type", "image/jpeg")

    // Send file
    res.sendFile(path.resolve(filepath), (err) => {
      if (err) {
        console.error("Download error:", err)
        res.status(404).json({ error: "File not found" })
      }
    })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({ error: "Download failed" })
  }
})

// Get upload statistics (admin only)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    // Get file counts and sizes
    const dirs = ["uploads/photos", "uploads/templates", "uploads/generated"]
    const stats = {}

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir)
        const dirStats = await Promise.all(
          files.map(async (file) => {
            const stat = await fs.stat(path.join(dir, file))
            return stat.size
          }),
        )

        const category = dir.split("/")[1]
        stats[category] = {
          count: files.length,
          totalSize: dirStats.reduce((sum, size) => sum + size, 0),
        }
      } catch (error) {
        stats[dir.split("/")[1]] = { count: 0, totalSize: 0 }
      }
    }

    res.json({ stats })
  } catch (error) {
    console.error("Stats error:", error)
    res.status(500).json({ error: "Failed to get upload statistics" })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." })
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ error: "Only image files are allowed" })
  }

  next(error)
})

module.exports = router
