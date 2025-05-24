"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/useStore"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navigation/navbar"
import { User, Mail, Phone, Stethoscope, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    speciality: "",
  })
  const { isAuthenticated, token, user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    fetchProfile()
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          phone: data.patient?.phone || "",
          speciality: data.doctor?.speciality || "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      })
    }
  }

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        fetchProfile()
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
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

  if (!isAuthenticated || !profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="account">Account Info</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.email} disabled />
                    </div>
                  </div>

                  {user?.role === "PATIENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Your phone number"
                      />
                    </div>
                  )}

                  {user?.role === "DOCTOR" && (
                    <div className="space-y-2">
                      <Label htmlFor="speciality">Medical Speciality</Label>
                      <Input
                        id="speciality"
                        value={formData.speciality}
                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                        placeholder="e.g., Cardiology, General Medicine"
                      />
                    </div>
                  )}

                  <Button onClick={updateProfile} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{profile.email}</p>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                      </div>
                    </div>
                    {profile.patient?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{profile.patient.phone}</p>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                        </div>
                      </div>
                    )}
                    {profile.doctor?.speciality && (
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{profile.doctor.speciality}</p>
                          <p className="text-sm text-muted-foreground">Medical Speciality</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Information</CardTitle>
                    <CardDescription>Your role and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-lg">{profile.role}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.role === "DOCTOR"
                            ? "You can manage your availability and handle patient appointments"
                            : "You can view available doctors and book appointments"}
                        </p>
                      </div>
                      {profile.doctor && (
                        <div className="p-4 border rounded-lg bg-green-50">
                          <h4 className="font-semibold">Doctor Status</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Currently {profile.doctor.isOnline ? "Online" : "Offline"}
                          </p>
                          {profile.doctor.lastOnlineAt && (
                            <p className="text-xs text-muted-foreground">
                              Last online: {new Date(profile.doctor.lastOnlineAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
