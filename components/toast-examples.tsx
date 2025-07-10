"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ToastExamples() {
  const { toast } = useToast()

  // Basic success toast
  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
    })
  }

  // Error toast with destructive variant
  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "Error!",
      description: "Something went wrong. Please try again.",
    })
  }

  // Toast with custom action
  const showActionToast = () => {
    toast({
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
      action: (
        <Button variant="outline" size="sm" onClick={() => console.log("Retry clicked")}>
          Try again
        </Button>
      ),
    })
  }

  // Simple toast with just title
  const showSimpleToast = () => {
    toast({
      title: "Simple notification",
    })
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Toast Examples</h2>
      <div className="flex flex-wrap gap-2">
        <Button onClick={showSuccessToast}>Success Toast</Button>
        <Button onClick={showErrorToast} variant="destructive">
          Error Toast
        </Button>
        <Button onClick={showActionToast} variant="outline">
          Action Toast
        </Button>
        <Button onClick={showSimpleToast} variant="secondary">
          Simple Toast
        </Button>
      </div>
    </div>
  )
}
