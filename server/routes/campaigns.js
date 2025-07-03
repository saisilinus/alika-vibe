const express = require("express")
const { body, query, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Get all campaigns (public)
router.get(
  "/",
  [
    query("category").optional().isString(),
    query("search").optional().isString(),
    query("sort").optional().isIn(["trending", "latest", "popular"]),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { category, search, sort = "latest", limit = 20, offset = 0 } = req.query

      let query = `
      SELECT 
        c.*,
        u.email as creator_email,
        COUNT(gb.id) as download_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN generated_banners gb ON c.id = gb.campaign_id
      WHERE 1=1
    `

      const params = []
      let paramCount = 0

      // Add filters
      if (category) {
        paramCount++
        query += ` AND c.category ILIKE $${paramCount}`
        params.push(`%${category}%`)
      }

      if (search) {
        paramCount++
        query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`
        params.push(`%${search}%`)
      }

      query += " GROUP BY c.id, u.email"

      // Add sorting
      switch (sort) {
        case "trending":
          query += " ORDER BY c.is_trending DESC, c.view_count DESC, c.created_at DESC"
          break
        case "popular":
          query += " ORDER BY c.view_count DESC, c.created_at DESC"
          break
        case "latest":
        default:
          query += " ORDER BY c.created_at DESC"
          break
      }

      // Add pagination
      paramCount++
      query += ` LIMIT $${paramCount}`
      params.push(Number.parseInt(limit))

      paramCount++
      query += ` OFFSET $${paramCount}`
      params.push(Number.parseInt(offset))

      const campaigns = await db.query(query, params)

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) FROM campaigns c WHERE 1=1"
      const countParams = []
      let countParamCount = 0

      if (category) {
        countParamCount++
        countQuery += ` AND c.category ILIKE $${countParamCount}`
        countParams.push(`%${category}%`)
      }

      if (search) {
        countParamCount++
        countQuery += ` AND (c.title ILIKE $${countParamCount} OR c.description ILIKE $${countParamCount})`
        countParams.push(`%${search}%`)
      }

      const totalCount = await db.query(countQuery, countParams)

      res.json({
        campaigns: campaigns.rows,
        pagination: {
          total: Number.parseInt(totalCount.rows[0].count),
          limit: Number.parseInt(limit),
          offset: Number.parseInt(offset),
          hasMore: Number.parseInt(offset) + Number.parseInt(limit) < Number.parseInt(totalCount.rows[0].count),
        },
      })
    } catch (error) {
      console.error("Get campaigns error:", error)
      res.status(500).json({ error: "Failed to fetch campaigns" })
    }
  },
)

// Get trending campaigns
router.get("/trending", async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT 
        c.*,
        u.email as creator_email,
        COUNT(gb.id) as download_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN generated_banners gb ON c.id = gb.campaign_id
      WHERE c.is_trending = true OR c.view_count > 100
      GROUP BY c.id, u.email
      ORDER BY c.view_count DESC, c.created_at DESC
      LIMIT 8
    `)

    res.json({ campaigns: campaigns.rows })
  } catch (error) {
    console.error("Get trending campaigns error:", error)
    res.status(500).json({ error: "Failed to fetch trending campaigns" })
  }
})

// Get latest campaigns
router.get("/latest", async (req, res) => {
  try {
    const campaigns = await db.query(`
      SELECT 
        c.*,
        u.email as creator_email,
        COUNT(gb.id) as download_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN generated_banners gb ON c.id = gb.campaign_id
      GROUP BY c.id, u.email
      ORDER BY c.created_at DESC
      LIMIT 8
    `)

    res.json({ campaigns: campaigns.rows })
  } catch (error) {
    console.error("Get latest campaigns error:", error)
    res.status(500).json({ error: "Failed to fetch latest campaigns" })
  }
})

// Get campaigns by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 20, offset = 0 } = req.query

    const campaigns = await db.query(
      `
      SELECT 
        c.*,
        u.email as creator_email,
        COUNT(gb.id) as download_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN generated_banners gb ON c.id = gb.campaign_id
      WHERE c.category ILIKE $1
      GROUP BY c.id, u.email
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [`%${category}%`, Number.parseInt(limit), Number.parseInt(offset)],
    )

    res.json({ campaigns: campaigns.rows })
  } catch (error) {
    console.error("Get campaigns by category error:", error)
    res.status(500).json({ error: "Failed to fetch campaigns by category" })
  }
})

// Get single campaign details (public)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const campaign = await db.query(
      `
      SELECT 
        c.*,
        u.email as creator_email,
        COUNT(gb.id) as download_count
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN generated_banners gb ON c.id = gb.campaign_id
      WHERE c.id = $1
      GROUP BY c.id, u.email
    `,
      [id],
    )

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    // Get recent generated banners for this campaign (if public)
    const recentBanners = await db.query(
      `
      SELECT user_name, created_at
      FROM generated_banners
      WHERE campaign_id = $1 AND is_public = true
      ORDER BY created_at DESC
      LIMIT 10
    `,
      [id],
    )

    res.json({
      campaign: campaign.rows[0],
      recentBanners: recentBanners.rows,
    })
  } catch (error) {
    console.error("Get campaign details error:", error)
    res.status(500).json({ error: "Failed to fetch campaign details" })
  }
})

// Increment view count
router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params

    await db.query("UPDATE campaigns SET view_count = view_count + 1 WHERE id = $1", [id])

    res.json({ message: "View count updated" })
  } catch (error) {
    console.error("Update view count error:", error)
    res.status(500).json({ error: "Failed to update view count" })
  }
})

// Generate personalized banner (public)
router.post(
  "/:id/generate",
  [
    body("userName").notEmpty().trim().isLength({ min: 1, max: 100 }),
    body("userPhoto").optional().isURL(),
    body("isPublic").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { id } = req.params
      const { userName, userPhoto, isPublic = false } = req.body

      // Check if campaign exists
      const campaign = await db.query("SELECT * FROM campaigns WHERE id = $1", [id])

      if (campaign.rows.length === 0) {
        return res.status(404).json({ error: "Campaign not found" })
      }

      // Simulate banner generation (in real app, use Sharp or Canvas)
      const generatedBannerUrl = `/generated/banner-${id}-${Date.now()}.png`

      // Save generated banner record
      const generatedBanner = await db.query(
        `
      INSERT INTO generated_banners (campaign_id, user_name, user_photo_url, generated_banner_url, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
        [id, userName, userPhoto, generatedBannerUrl, isPublic],
      )

      // Update campaign download count
      await db.query("UPDATE campaigns SET download_count = download_count + 1 WHERE id = $1", [id])

      res.json({
        message: "Banner generated successfully",
        banner: generatedBanner.rows[0],
        downloadUrl: generatedBannerUrl,
      })
    } catch (error) {
      console.error("Generate banner error:", error)
      res.status(500).json({ error: "Failed to generate banner" })
    }
  },
)

// Get categories with banner counts
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT 
        category,
        COUNT(*) as banner_count
      FROM campaigns
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY banner_count DESC
    `)

    res.json({ categories: categories.rows })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

module.exports = router
