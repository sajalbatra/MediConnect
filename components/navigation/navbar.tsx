"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useStore"
import { useRouter } from "next/navigation"
import { LogOut, Stethoscope } from "lucide-react"

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MediConnect</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome, </span>
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">{user?.role}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
