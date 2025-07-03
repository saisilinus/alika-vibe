import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCampaignsCollection, getUsersCollection, getGeneratedBannersCollection } from "@/lib/database"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin or moderator
    if (session.user.role !== "admin" && session.user.role !== "moderator") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const campaigns = await getCampaignsCollection()
    const users = await getUsersCollection()
    const banners = await getGeneratedBannersCollection()

    // Get current date for monthly calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get total counts
    const [totalCampaigns, totalUsers, totalViews, totalDownloads, monthlyStats] = await Promise.all([
      campaigns.countDocuments(),
      users.countDocuments(),
      campaigns.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]).toArray(),
      campaigns.aggregate([{ $group: { _id: null, total: { $sum: "$downloadCount" } } }]).toArray(),
      Promise.all([
        campaigns.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
        campaigns.countDocuments({
          createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
        }),
        users.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
        users.countDocuments({
          createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
        }),
      ]),
    ])

    // Calculate growth percentages
    const [currentMonthCampaigns, lastMonthCampaigns, currentMonthUsers, lastMonthUsers] = monthlyStats

    const campaignGrowth =
      lastMonthCampaigns > 0
        ? Math.round(((currentMonthCampaigns - lastMonthCampaigns) / lastMonthCampaigns) * 100)
        : 100

    const userGrowth =
      lastMonthUsers > 0 ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 100

    return NextResponse.json({
      totalCampaigns,
      totalUsers,
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      monthlyGrowth: {
        campaigns: campaignGrowth,
        users: userGrowth,
        views: 25, // Mock data - you'd calculate this from actual view logs
        downloads: 18, // Mock data - you'd calculate this from actual download logs
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
