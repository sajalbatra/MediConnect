import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  role: "DOCTOR" | "PATIENT" | "ADMIN"
}

interface Doctor {
  id: string
  name: string
  speciality: string
  isOnline: boolean
  lastOnlineAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

interface DoctorState {
  onlineDoctors: Doctor[]
  setOnlineDoctors: (doctors: Doctor[]) => void
  updateDoctorStatus: (doctorId: string, isOnline: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

export const useDoctorStore = create<DoctorState>((set) => ({
  onlineDoctors: [],
  setOnlineDoctors: (doctors) => set({ onlineDoctors: doctors }),
  updateDoctorStatus: (doctorId, isOnline) =>
    set((state) => ({
      onlineDoctors: state.onlineDoctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, isOnline } : doctor)),
    })),
}))
