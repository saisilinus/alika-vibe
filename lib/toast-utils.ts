import { toast } from "@/hooks/use-toast"

// Utility functions for common toast patterns
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  })
}

export const showErrorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title,
    description,
  })
}

export const showLoadingToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    duration: Number.POSITIVE_INFINITY, // Keep it open until manually dismissed
  })
}

// For API errors
export const showApiErrorToast = (error: any) => {
  const message = error?.message || "An unexpected error occurred"
  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  })
}
