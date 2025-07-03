const express = require("express")
const { body, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// All admin routes require authentication
router.use(authenticateToken)

// Get dashboard statistics
router.get("/stats", requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    // Get total counts
    const campaignCount = await db.query("SELECT COUNT(*) as count FROM campaigns")
    const userCount = await db.query("SELECT COUNT(*) as count FROM users")
    const viewCount = await db.query("SELECT SUM(view_count) as total FROM campaigns")
    const downloadCount = await db.query("SELECT COUNT(*) as count FROM generated_banners")

    // Get monthly growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const recentCampaigns = await db.query("SELECT COUNT(*) as count FROM campaigns WHERE created_at >= $1", [
      thirtyDaysAgo,
    ])
    const previousCampaigns = await db.query(
      "SELECT COUNT(*) as count FROM campaigns WHERE created_at >= $1 AND created_at < $2",
      [sixtyDaysAgo, thirtyDaysAgo],
    )

    const recentUsers = await db.query("SELECT COUNT(*) as count FROM users WHERE created_at >= $1", [thirtyDaysAgo])
    const previousUsers = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at < $2",
      [sixtyDaysAgo, thirtyDaysAgo],
    )

    // Calculate growth percentages
    const calculateGrowth = (recent, previous) => {
      if (previous === 0) return recent > 0 ? 100 : 0
      return Math.round(((recent - previous) / previous) * 100)
    }

    const stats = {
      totalCampaigns: Number.parseInt(campaignCount.rows[0].count),
      totalUsers: Number.parseInt(userCount.rows[0].count),
      totalViews: Number.parseInt(viewCount.rows[0].total) || 0,
      totalDownloads: Number.parseInt(downloadCount.rows[0].count),
      monthlyGrowth: {
        campaigns: calculateGrowth(
          Number.parseInt(recentCampaigns.rows[0].count),
          Number.parseInt(previousCampaigns.rows[0].count),
        ),
        users: calculateGrowth(
          Number.parseInt(recentUsers.rows[0].count),
          Number.parseInt(previousUsers.rows[0].count),
        ),
        views: 34, // Mock data - would need more complex query
        downloads: 28, // Mock data - would need more complex query
      },
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get admin stats error:", error)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

// Get all campaigns for admin
router.get("/campaigns", requireRole(["admin", "moderator"]), async (req, res) => {
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
    `)

    res.json({ campaigns: campaigns.rows })
  } catch (error) {
    console.error("Get admin campaigns error:", error)
    res.status(500).json({ error: "Failed to fetch campaigns" })
  }
})

// Create new campaign
router.post(
  "/campaigns",
  requireRole(["admin", "moderator"]),
  [
    body("title").notEmpty().trim().withMessage("Title is required"),
    body("description").optional().trim(),
    body("category").notEmpty().withMessage("Category is required"),
    body("templateUrl").optional().isURL().withMessage("Invalid template URL"),
    body("placeholderConfig").optional().isJSON().withMessage("Invalid placeholder configuration"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
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

      const { title, description, category, templateUrl, placeholderConfig, tags } = req.body

      const newCampaign = await db.query(
        `
        INSERT INTO campaigns (title, description, category, template_url, creator_id, placeholder_config, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [
          title,
          description,
          category,
          templateUrl,
          req.user.id,
          placeholderConfig ? JSON.stringify(placeholderConfig) : "{}",
          tags || [],
        ],
      )

      res.status(201).json({
        message: "Campaign created successfully",
        campaign: newCampaign.rows[0],
      })
    } catch (error) {
      console.error("Create campaign error:", error)
      res.status(500).json({ error: "Failed to create campaign" })
    }
  },
)

// Update campaign
router.put(
  "/campaigns/:id",
  requireRole(["admin", "moderator"]),
  [
    body("title").optional().notEmpty().trim(),
    body("description").optional().trim(),
    body("category").optional().notEmpty(),
    body("templateUrl").optional().isURL(),
    body("placeholderConfig").optional().isJSON(),
    body("tags").optional().isArray(),
    body("isTrending").optional().isBoolean(),
    body("isFeatured").optional().isBoolean(),
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
      const updates = req.body

      // Build dynamic update query
      const updateFields = []
      const values = []
      let paramCount = 0

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++
          updateFields.push(`${key} = $${paramCount}`)
          values.push(key === "placeholderConfig" ? JSON.stringify(value) : value)
        }
      })

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update" })
      }

      paramCount++
      values.push(id)

      const query = `
        UPDATE campaigns 
        SET ${updateFields.join(", ")}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `

      const updatedCampaign = await db.query(query, values)

      if (updatedCampaign.rows.length === 0) {
        return res.status(404).json({ error: "Campaign not found" })
      }

      res.json({
        message: "Campaign updated successfully",
        campaign: updatedCampaign.rows[0],
      })
    } catch (error) {
      console.error("Update campaign error:", error)
      res.status(500).json({ error: "Failed to update campaign" })
    }
  },
)

// Delete campaign
router.delete("/campaigns/:id", requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const { id } = req.params

    const deletedCampaign = await db.query("DELETE FROM campaigns WHERE id = $1 RETURNING *", [id])

    if (deletedCampaign.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    res.json({ message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("Delete campaign error:", error)
    res.status(500).json({ error: "Failed to delete campaign" })
  }
})

// Get all users (admin only)
router.get("/users", requireRole(["admin"]), async (req, res) => {
  try {
    const users = await db.query(`
      SELECT 
        id, email, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `)

    res.json({ users: users.rows })
  } catch (error) {
    console.error("Get admin users error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Update user role (admin only)
router.put(
  "/users/:id/role",
  requireRole(["admin"]),
  [body("role").isIn(["user", "admin", "moderator"]).withMessage("Invalid role")],
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
      const { role } = req.body

      const updatedUser = await db.query(
        "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, updated_at",
        [role, id],
      )

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({
        message: "User role updated successfully",
        user: updatedUser.rows[0],
      })
    } catch (error) {
      console.error("Update user role error:", error)
      res.status(500).json({ error: "Failed to update user role" })
    }
  },
)

// Ban/unban user (admin only)
router.put(
  "/users/:id/status",
  requireRole(["admin"]),
  [body("isActive").isBoolean().withMessage("isActive must be a boolean")],
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
      const { isActive } = req.body

      const updatedUser = await db.query(
        "UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, is_active, updated_at",
        [isActive, id],
      )

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({
        message: `User ${isActive ? "activated" : "banned"} successfully`,
        user: updatedUser.rows[0],
      })
    } catch (error) {
      console.error("Update user status error:", error)
      res.status(500).json({ error: "Failed to update user status" })
    }
  },
)

// Get recent activity (admin/moderator)
router.get("/activity", requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    // Get recent campaigns
    const recentCampaigns = await db.query(`
      SELECT 'campaign_created' as type, title as description, created_at
      FROM campaigns
      ORDER BY created_at DESC
      LIMIT 5
    `)

    // Get recent users
    const recentUsers = await db.query(`
      SELECT 'user_registered' as type, email as description, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `)

    // Get recent banner generations
    const recentBanners = await db.query(`
      SELECT 'banner_generated' as type, 
             CONCAT('Banner generated for ', c.title) as description, 
             gb.created_at
      FROM generated_banners gb
      JOIN campaigns c ON gb.campaign_id = c.id
      ORDER BY gb.created_at DESC
      LIMIT 5
    `)

    // Combine and sort all activities
    const activities = [...recentCampaigns.rows, ...recentUsers.rows, ...recentBanners.rows].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )

    res.json({ activities: activities.slice(0, 10) })
  } catch (error) {
    console.error("Get activity error:", error)
    res.status(500).json({ error: "Failed to fetch recent activity" })
  }
})

module.exports = router
