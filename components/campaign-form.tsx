"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { createCampaignAction } from "@/lib/actions"

export function CampaignForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const result = await createCampaignAction(formData)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result.success) {
        toast({
          title: "Success!",
          description: "Campaign created successfully.",
        })
        router.push(`/campaigns/${result.campaignId}`)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="title" placeholder="Campaign Title" required />
      <Textarea name="description" placeholder="Campaign Description" required />
      <Input name="templateUrl" placeholder="Template URL" required />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Campaign"}
      </Button>
    </form>
  )
}
