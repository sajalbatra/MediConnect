"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navigation/navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Activity, Users, Calendar, Mail, TrendingUp, Clock } from "lucide-react"

interface Analytics {
  overview: {
    totalDoctors: number
    totalPatients: number
    onlineDoctors: number
    totalAppointments: number
    pendingAppointments: number
    completedAppointments: number
    recentNotifications: number
  }
  trends: {
    appointments: Array<{ status: string; count: number }>
  }
  distribution: {
    specialities: Array<{ speciality: string; count: number }>
  }
  period: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [period, setPeriod] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, token, user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    fetchAnalytics()
  }, [isAuthenticated, period])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Healthcare system insights and metrics</p>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : analytics ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.totalDoctors}</div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.overview.onlineDoctors} currently online
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.totalPatients}</div>
                      <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.totalAppointments}</div>
                      <p className="text-xs text-muted-foreground">{analytics.overview.pendingAppointments} pending</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.recentNotifications}</div>
                      <p className="text-xs text-muted-foreground">Sent in {period}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointment Status Distribution</CardTitle>
                      <CardDescription>Breakdown of appointment statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.trends.appointments}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="status"
                          >
                            {analytics.trends.appointments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Doctor Specialities</CardTitle>
                      <CardDescription>Distribution of medical specialities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.distribution.specialities}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="speciality" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="appointments">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.pendingAppointments}</div>
                      <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.completedAppointments}</div>
                      <p className="text-xs text-muted-foreground">Successfully finished</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.overview.totalAppointments > 0
                          ? Math.round(
                              (analytics.overview.completedAppointments / analytics.overview.totalAppointments) * 100,
                            )
                          : 0}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">Completion rate</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="doctors">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Online Doctors</CardTitle>
                      <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.onlineDoctors}</div>
                      <p className="text-xs text-muted-foreground">
                        {analytics.overview.totalDoctors > 0
                          ? Math.round((analytics.overview.onlineDoctors / analytics.overview.totalDoctors) * 100)
                          : 0}
                        % of total doctors
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.overview.totalDoctors}</div>
                      <p className="text-xs text-muted-foreground">Registered healthcare providers</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">Failed to load analytics</div>
          )}
        </div>
      </main>
    </div>
  )
}
