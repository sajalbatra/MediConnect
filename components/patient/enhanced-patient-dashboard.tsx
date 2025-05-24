"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore, useDoctorStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import { Activity, Calendar, Clock, Mail, User, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Doctor {
  id: string
  name: string
  email: string
  speciality: string
  isOnline: boolean
  lastOnlineAt?: string
}

interface Appointment {
  id: string
  appointmentDate: string
  status: string
  notes?: string
  doctor: {
    id: string
    name: string
    speciality: string
  }
}

export default function EnhancedPatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: "",
    notes: "",
  })
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  })
  const { token } = useAuthStore()
  const { onlineDoctors, setOnlineDoctors, updateDoctorStatus } = useDoctorStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchOnlineDoctors()
    fetchAppointments()
  }, [])

  const fetchOnlineDoctors = async () => {
    try {
      const response = await fetch("/api/doctors/online", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const doctors = await response.json()
        setOnlineDoctors(doctors)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch online doctors",
        variant: "destructive",
      })
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

  const bookAppointment = async () => {
    if (!selectedDoctor || !bookingForm.appointmentDate) {
      toast({
        title: "Error",
        description: "Please select a doctor and appointment date",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate: bookingForm.appointmentDate,
          notes: bookingForm.notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment booked successfully",
        })
        setIsBookingOpen(false)
        setBookingForm({ appointmentDate: "", notes: "" })
        setSelectedDoctor(null)
        fetchAppointments()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to book appointment",
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

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled",
        })
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
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

  const formatLastOnline = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleString()
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
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground">Find and connect with available doctors</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Users className="w-3 h-3 mr-1" />
          {onlineDoctors.length} doctors online
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Doctors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineDoctors.length}</div>
            <p className="text-xs text-muted-foreground">Currently available for consultation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All your appointments</p>
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
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enabled</div>
            <p className="text-xs text-muted-foreground">Real-time updates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="doctors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Available Doctors</CardTitle>
              <CardDescription>Doctors currently online and available for consultation</CardDescription>
            </CardHeader>
            <CardContent>
              {onlineDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No doctors online</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No doctors are currently available. You'll be notified when they come online.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {onlineDoctors.map((doctor) => (
                    <Card key={doctor.id} className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">Dr. {doctor.name}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.speciality}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-600">
                                <Activity className="w-3 h-3 mr-1" />
                                Online
                              </Badge>
                            </div>
                          </div>
                          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedDoctor(doctor)}>
                                Book Appointment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Book Appointment</DialogTitle>
                                <DialogDescription>
                                  Schedule an appointment with Dr. {selectedDoctor?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="appointmentDate">Appointment Date & Time</Label>
                                  <Input
                                    id="appointmentDate"
                                    type="datetime-local"
                                    value={bookingForm.appointmentDate}
                                    onChange={(e) =>
                                      setBookingForm({ ...bookingForm, appointmentDate: e.target.value })
                                    }
                                    min={new Date().toISOString().slice(0, 16)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Describe your symptoms or reason for visit..."
                                    value={bookingForm.notes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={bookAppointment} className="flex-1">
                                    Book Appointment
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsBookingOpen(false)
                                      setSelectedDoctor(null)
                                      setBookingForm({ appointmentDate: "", notes: "" })
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Available since: {formatLastOnline(doctor.lastOnlineAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No appointments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You don't have any appointments yet. Book one with an available doctor.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Dr. {appointment.doctor.name}</h4>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.doctor.speciality}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointmentDate).toLocaleString()}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                            <Button size="sm" variant="outline" onClick={() => cancelAppointment(appointment.id)}>
                              Cancel
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
