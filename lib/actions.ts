"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/database"

export async function createCampaignAction(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    // Note: In Server Actions, you can't directly use toast
    // Instead, you can return an error that the client handles
    return {
      error: "You must be logged in to create a campaign",
    }
  }

  try {
    const { db } = await connectToDatabase()
    const campaigns = db.collection("campaigns")

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const templateUrl = formData.get("templateUrl") as string

    if (!title || !description || !templateUrl) {
      return {
        error: "All fields are required",
      }
    }

    const campaign = {
      title,
      description,
      templateUrl,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      downloadCount: 0,
      isActive: true,
    }

    const result = await campaigns.insertOne(campaign)

    revalidatePath("/campaigns")

    return {
      success: true,
      campaignId: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error creating campaign:", error)
    return {
      error: "Failed to create campaign",
    }
  }
}
