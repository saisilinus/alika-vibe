"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loading, LoadingSkeleton } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { Users, FileImage, TrendingUp, Download, Plus, Edit, Trash2, Eye, Calendar, Shield } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useUpdateUserRoleMutation,
} from "@/features"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // RTK Query hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetAdminStatsQuery()
  const { data: users, isLoading: usersLoading, error: usersError } = useGetAdminUsersQuery()
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useGetAdminCampaignsQuery()

  // Mutations
  const [createCampaign, { isLoading: createLoading }] = useCreateCampaignMutation()
  const [updateCampaign, { isLoading: updateLoading }] = useUpdateCampaignMutation()
  const [deleteCampaign, { isLoading: deleteLoading }] = useDeleteCampaignMutation()
  const [updateUserRole, { isLoading: roleUpdateLoading }] = useUpdateUserRoleMutation()

  // Check authentication and authorization
  if (status === "loading") {
    return <Loading text="Checking authentication..." />
  }

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/")
  }

  const handleCreateCampaign = async (formData: FormData) => {
    try {
      const campaignData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        tags: (formData.get("tags") as string).split(",").map((tag) => tag.trim()),
        imageUrl: formData.get("imageUrl") as string,
      }

      await createCampaign(campaignData).unwrap()
      toast({ title: "Campaign created successfully!" })
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating campaign",
        description: "Please try again later.",
      })
    }
  }

  const handleUpdateCampaign = async (formData: FormData) => {
    if (!selectedCampaign) return

    try {
      const campaignData = {
        id: selectedCampaign._id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        tags: (formData.get("tags") as string).split(",").map((tag) => tag.trim()),
        imageUrl: formData.get("imageUrl") as string,
      }

      await updateCampaign(campaignData).unwrap()
      toast({ title: "Campaign updated successfully!" })
      setIsEditDialogOpen(false)
      setSelectedCampaign(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating campaign",
        description: "Please try again later.",
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId).unwrap()
      toast({ title: "Campaign deleted successfully!" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting campaign",
        description: "Please try again later.",
      })
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap()
      toast({ title: "User role updated successfully!" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating user role",
        description: "Please try again later.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <LoadingSkeleton className="h-4 w-20" />
                      <LoadingSkeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <LoadingSkeleton className="h-8 w-16 mb-2" />
                      <LoadingSkeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : statsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading statistics</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.newUsersThisMonth || 0} from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.newCampaignsThisMonth || 0} from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.viewsThisMonth || 0} from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.downloadsThisMonth || 0} from last month</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                  <CardDescription>User registrations and campaign creations</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSkeleton className="h-64 w-full" />
                  ) : (
                    <ChartContainer
                      config={{
                        users: { label: "Users", color: "hsl(var(--chart-1))" },
                        campaigns: { label: "Campaigns", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats?.monthlyActivity || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="users" stroke="var(--color-users)" />
                          <Line type="monotone" dataKey="campaigns" stroke="var(--color-campaigns)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Campaigns by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSkeleton className="h-64 w-full" />
                  ) : (
                    <ChartContainer
                      config={{
                        count: { label: "Count", color: "hsl(var(--chart-3))" },
                      }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.categoryDistribution || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Campaign Management</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>Add a new campaign to the platform</DialogDescription>
                  </DialogHeader>
                  <form action={handleCreateCampaign} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Template Image URL</Label>
                      <Input id="imageUrl" name="imageUrl" type="url" required />
                    </div>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? "Creating..." : "Create Campaign"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {campaignsLoading ? (
              <Loading text="Loading campaigns..." />
            ) : campaignsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading campaigns</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns?.map((campaign: any) => (
                        <TableRow key={campaign._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={campaign.templateUrl || "/placeholder.svg"}
                                alt={campaign.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <div className="font-medium">{campaign.title}</div>
                                <div className="text-sm text-gray-500">{campaign.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{campaign.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {campaign.viewCount || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              {campaign.downloadCount || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCampaign(campaign)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this campaign? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCampaign(campaign._id)}
                                      disabled={deleteLoading}
                                    >
                                      {deleteLoading ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>

            {usersLoading ? (
              <Loading text="Loading users..." />
            ) : usersError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading users</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{user.name || "Unknown"}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => handleUpdateUserRole(user._id, newRole)}
                              disabled={roleUpdateLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User and campaign growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSkeleton className="h-64 w-full" />
                  ) : (
                    <ChartContainer
                      config={{
                        users: { label: "Users", color: "hsl(var(--chart-1))" },
                        campaigns: { label: "Campaigns", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats?.monthlyActivity || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="users" stroke="var(--color-users)" />
                          <Line type="monotone" dataKey="campaigns" stroke="var(--color-campaigns)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Views and downloads by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSkeleton className="h-64 w-full" />
                  ) : (
                    <ChartContainer
                      config={{
                        views: { label: "Views", color: "hsl(var(--chart-3))" },
                        downloads: { label: "Downloads", color: "hsl(var(--chart-4))" },
                      }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.engagementByCategory || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="views" fill="var(--color-views)" />
                          <Bar dataKey="downloads" fill="var(--color-downloads)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Alika" />
                </div>
                <div>
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input id="max-file-size" type="number" defaultValue="10" />
                </div>
                <div>
                  <Label htmlFor="allowed-formats">Allowed File Formats</Label>
                  <Input id="allowed-formats" defaultValue="jpg, jpeg, png, gif" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign information</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <form action={handleUpdateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" defaultValue={selectedCampaign.title} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedCampaign.description}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedCampaign.category} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input id="edit-tags" name="tags" defaultValue={selectedCampaign.tags?.join(", ") || ""} />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Template Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={selectedCampaign.templateUrl || ""}
                  required
                />
              </div>
              <Button type="submit" disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Update Campaign"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
