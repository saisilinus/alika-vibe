"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
  Users,
  FileImage,
  Download,
  TrendingUp,
  Search,
  MoreHorizontal,
  Shield,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react"
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCampaignsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUpdateCampaignStatusMutation,
  useDeleteAdminCampaignMutation,
} from "@/features"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [userSearch, setUserSearch] = useState("")
  const [campaignSearch, setCampaignSearch] = useState("")

  // RTK Query hooks
  const { data: statsResponse, isLoading: statsLoading } = useGetAdminStatsQuery()
  const { data: usersResponse, isLoading: usersLoading } = useGetAdminUsersQuery({
    search: userSearch,
    limit: 50,
  })
  const { data: campaignsResponse, isLoading: campaignsLoading } = useGetAdminCampaignsQuery({
    search: campaignSearch,
    limit: 50,
  })

  // Mutations
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [updateCampaignStatus] = useUpdateCampaignStatusMutation()
  const [deleteCampaign] = useDeleteAdminCampaignMutation()

  // Extract data from responses
  const stats = statsResponse?.stats
  const users = usersResponse?.users || []
  const campaigns = campaignsResponse?.campaigns || []

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateUserRole({ userId, role }).unwrap()
      toast({
        title: "User role updated",
        description: "The user's role has been successfully updated.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role.",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap()
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      })
    }
  }

  const handleUpdateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      await updateCampaignStatus({ campaignId, status }).unwrap()
      toast({
        title: "Campaign status updated",
        description: "The campaign status has been successfully updated.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign status.",
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId).unwrap()
      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete campaign.",
      })
    }
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Loading admin dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, campaigns, and platform statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.monthlyGrowth?.users || 0}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.monthlyGrowth?.campaigns || 0}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.monthlyGrowth?.downloads || 0}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  ((stats?.monthlyGrowth?.users || 0) +
                    (stats?.monthlyGrowth?.campaigns || 0) +
                    (stats?.monthlyGrowth?.downloads || 0)) /
                    3,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">Average monthly growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <Loading text="Loading users..." />
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user._id?.toString()}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || "No name"}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role || "user"}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserRole(
                                  user._id?.toString() || "",
                                  user.role === "admin" ? "user" : "admin",
                                )
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user._id?.toString() || "")}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Manage campaigns and their status</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <Loading text="Loading campaigns..." />
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign._id?.toString()}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={campaign.templateUrl || campaign.imageUrl || "/placeholder.svg"}
                            alt={campaign.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{campaign.category}</Badge>
                              <div className="flex items-center text-xs text-gray-400">
                                <Eye className="h-3 w-3 mr-1" />
                                {campaign.viewCount || 0}
                              </div>
                              <div className="flex items-center text-xs text-gray-400">
                                <Download className="h-3 w-3 mr-1" />
                                {campaign.downloadCount || 0}
                              </div>
                              <div className="flex items-center text-xs text-gray-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateCampaignStatus(
                                  campaign._id?.toString() || "",
                                  campaign.status === "active" ? "inactive" : "active",
                                )
                              }
                            >
                              {campaign.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Campaign
                                </DropdownMenuItem>
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
                                    onClick={() => handleDeleteCampaign(campaign._id?.toString() || "")}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
