"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useStore"
import Navbar from "@/components/navigation/navbar"
import EnhancedDoctorDashboard from "@/components/doctor/enhanced-doctor-dashboard"

export default function DoctorPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (user?.role !== "DOCTOR") {
      router.push("/patient")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "DOCTOR") {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <EnhancedDoctorDashboard />
      </main>
    </div>
  )
}
