"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, FileImage, Plus, Edit, Trash2, MoreHorizontal, Eye, Download, TrendingUp, Shield } from "lucide-react"

// Mock data - replace with real API calls
const mockCampaigns = [
  {
    id: 1,
    title: "Cracking the Code 1.0",
    category: "Education",
    status: "active",
    views: 1250,
    downloads: 89,
    createdAt: "2024-01-15",
    creator: "admin@alika.com",
  },
  {
    id: 2,
    title: "Summer Music Festival",
    category: "Music",
    status: "active",
    views: 890,
    downloads: 45,
    createdAt: "2024-01-12",
    creator: "admin@alika.com",
  },
  {
    id: 3,
    title: "Tech Conference 2024",
    category: "Technology",
    status: "draft",
    views: 2100,
    downloads: 156,
    createdAt: "2024-01-10",
    creator: "admin@alika.com",
  },
]

const mockUsers = [
  {
    id: 1,
    email: "admin@alika.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    email: "user@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-19",
  },
  {
    id: 3,
    email: "moderator@alika.com",
    role: "moderator",
    status: "active",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-18",
  },
]

const mockStats = {
  totalCampaigns: 24,
  totalUsers: 156,
  totalViews: 12450,
  totalDownloads: 890,
  monthlyGrowth: {
    campaigns: 15,
    users: 23,
    views: 34,
    downloads: 28,
  },
}

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [users, setUsers] = useState(mockUsers)
  const [stats, setStats] = useState(mockStats)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    category: "",
    templateFile: null as File | null,
  })

  // Check if user has admin access (mock - replace with real auth)
  const [userRole, setUserRole] = useState("admin") // This should come from auth context

  if (userRole !== "admin" && userRole !== "moderator") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreateCampaign = async () => {
    // Mock campaign creation
    const campaign = {
      id: campaigns.length + 1,
      title: newCampaign.title,
      category: newCampaign.category,
      status: "draft",
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString().split("T")[0],
      creator: "admin@alika.com",
    }

    setCampaigns([...campaigns, campaign])
    setNewCampaign({ title: "", description: "", category: "", templateFile: null })
    setIsCreateCampaignOpen(false)
  }

  const handleDeleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter((c) => c.id !== id))
  }

  const handleUpdateUserRole = (userId: number, newRole: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage campaigns, users, and platform settings</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                </div>
                <FileImage className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth.campaigns}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth.users}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth.views}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
                <Download className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth.downloads}% this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Management</CardTitle>
                  <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={newCampaign.title}
                            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                            placeholder="Campaign title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newCampaign.description}
                            onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                            placeholder="Campaign description"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={newCampaign.category}
                            onValueChange={(value) => setNewCampaign({ ...newCampaign, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Education">Education</SelectItem>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Music">Music</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="Food">Food</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Template Image</label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setNewCampaign({ ...newCampaign, templateFile: e.target.files?.[0] || null })
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateCampaign} disabled={!newCampaign.title || !newCampaign.category}>
                            Create Campaign
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.views}</TableCell>
                        <TableCell>{campaign.downloads}</TableCell>
                        <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, "admin")}>
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, "moderator")}>
                                Make Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateUserRole(user.id, "user")}>
                                Make User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Ban User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-gray-600">{campaign.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{campaign.views} views</p>
                          <p className="text-sm text-gray-600">{campaign.downloads} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm">New user registered</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm">Campaign "Tech Conference" updated</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm">Banner generated for "Music Festival"</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Site Name</label>
                    <Input defaultValue="Alika" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Site Description</label>
                    <Textarea defaultValue="Get people connected to your brand with personalized banners." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max File Size (MB)</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">SMTP Host</label>
                    <Input placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SMTP Port</label>
                    <Input type="number" placeholder="587" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Username</label>
                    <Input placeholder="your-email@gmail.com" />
                  </div>
                  <Button>Save Email Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
