"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useStore"
import Navbar from "@/components/navigation/navbar"
import EnhancedPatientDashboard from "@/components/patient/enhanced-patient-dashboard"

export default function PatientPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (user?.role !== "PATIENT") {
      router.push("/doctor")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "PATIENT") {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <EnhancedPatientDashboard />
      </main>
    </div>
  )
}
