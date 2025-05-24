"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore, useDoctorStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import { Activity, Clock, Mail, User, Users } from "lucide-react"

interface Doctor {
  id: string
  name: string
  email: string
  speciality: string
  isOnline: boolean
  lastOnlineAt?: string
}

export default function PatientDashboard() {
  const { token } = useAuthStore()
  const { onlineDoctors, setOnlineDoctors, updateDoctorStatus } = useDoctorStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchOnlineDoctors()
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

  const formatLastOnline = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleString()
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enabled</div>
            <p className="text-xs text-muted-foreground">You'll be notified when doctors come online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Real-time updates enabled</p>
          </CardContent>
        </Card>
      </div>

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
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
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
    </div>
  )
}
