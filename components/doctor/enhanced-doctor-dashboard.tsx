"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import { Activity, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Appointment {
  id: string
  appointmentDate: string
  status: string
  notes?: string
  patient: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

export default function EnhancedDoctorDashboard() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  })
  const { user, token } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
    fetchDoctorStatus()
  }, [])

  const fetchDoctorStatus = async () => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setIsOnline(data.doctor?.isOnline || false)
      }
    } catch (error) {
      console.error("Failed to fetch doctor status:", error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)

        // Calculate stats
        const total = data.appointments.length
        const pending = data.appointments.filter((apt: Appointment) => apt.status === "PENDING").length
        const completed = data.appointments.filter((apt: Appointment) => apt.status === "COMPLETED").length

        setStats({
          totalAppointments: total,
          pendingAppointments: pending,
          completedAppointments: completed,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    }
  }

  const toggleStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctors/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnline: !isOnline }),
      })

      if (response.ok) {
        setIsOnline(!isOnline)
        toast({
          title: "Status Updated",
          description: `You are now ${!isOnline ? "online" : "offline"}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update status",
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

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment status updated",
        })
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: "Failed to update appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. {user?.name}</p>
        </div>
        <Badge variant={isOnline ? "default" : "secondary"} className="w-fit">
          <Activity className="w-3 h-3 mr-1" />
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isOnline ? "Online" : "Offline"}</div>
            <p className="text-xs text-muted-foreground">{isOnline ? "Available for patients" : "Not available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status Control</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Availability Control</CardTitle>
              <CardDescription>Toggle your online status to let patients know when you're available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button
                  onClick={toggleStatus}
                  disabled={isLoading}
                  variant={isOnline ? "destructive" : "default"}
                  size="lg"
                >
                  {isLoading ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {isOnline
                    ? "Patients can see you are available and will receive notifications"
                    : "You are currently not visible to patients"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Manage your upcoming and recent appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No appointments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You don't have any appointments yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{appointment.patient.name}</h4>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointmentDate).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Email: {appointment.patient.email}</p>
                          {appointment.patient.phone && (
                            <p className="text-sm text-muted-foreground">Phone: {appointment.patient.phone}</p>
                          )}
                          {appointment.notes && (
                            <p className="text-sm">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "PENDING" && (
                            <>
                              <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}>
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, "CANCELLED")}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === "CONFIRMED" && (
                            <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}>
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
