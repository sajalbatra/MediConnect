"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import { useAuthStore } from "@/store/useStore"
import { Stethoscope, Users, Bell, Clock } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "DOCTOR") {
        router.push("/doctor")
      } else {
        router.push("/patient")
      }
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated) {
    return <div>Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">MediConnect</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time doctor availability system. Connect with healthcare professionals instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">For Patients</h3>
                      <p className="text-sm text-muted-foreground">View online doctors and get instant notifications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">For Doctors</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your availability and connect with patients
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">Real-time Notifications</h3>
                      <p className="text-sm text-muted-foreground">Get notified instantly when doctors come online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">24/7 Availability</h3>
                      <p className="text-sm text-muted-foreground">Access healthcare professionals around the clock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
