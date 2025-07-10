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

    const users = await getUsersCollection()
    const user = await users.findOne({ email: session.user.email })

    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const campaigns = await getCampaignsCollection()
    const generatedBanners = await getGeneratedBannersCollection()

    const [totalUsers, totalCampaigns, totalGeneratedBanners, totalViews, totalDownloads, recentCampaigns] =
      await Promise.all([
        users.countDocuments(),
        campaigns.countDocuments({ isActive: true }),
        generatedBanners.countDocuments(),
        campaigns.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]).toArray(),
        campaigns.aggregate([{ $group: { _id: null, total: { $sum: "$downloadCount" } } }]).toArray(),
        campaigns.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).toArray(),
      ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCampaigns,
        totalGeneratedBanners,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
      },
      recentCampaigns,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
