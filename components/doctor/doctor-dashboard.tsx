"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import { Activity, Clock, User } from "lucide-react"

export default function DoctorDashboard() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, token } = useAuthStore()
  const { toast } = useToast()

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Speciality</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.doctor?.speciality || "General"}</div>
            <p className="text-xs text-muted-foreground">Your medical speciality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Online</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isOnline ? "Now" : "Offline"}</div>
            <p className="text-xs text-muted-foreground">{isOnline ? "Currently available" : "Set status to online"}</p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
