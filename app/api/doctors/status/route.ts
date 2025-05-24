import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"
import { sendDoctorOnlineNotification } from "@/lib/email"

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { isOnline } = await request.json()

    const doctor = await prisma.doctor.update({
      where: { userId: payload.userId },
      data: {
        isOnline,
        lastOnlineAt: isOnline ? new Date() : undefined,
      },
      include: {
        user: true,
      },
    })

    // Broadcast status update to all connected patients
    const doctorData = {
      id: doctor.id,
      name: doctor.user.name,
      speciality: doctor.speciality,
      isOnline: doctor.isOnline,
      lastOnlineAt: doctor.lastOnlineAt,
    }

    // Send email notification to all patients when doctor comes online
    if (isOnline) {
      const patients = await prisma.patient.findMany({
        include: { user: true },
      })

      const patientEmails = patients.map((patient) => patient.user.email)

      if (patientEmails.length > 0) {
        await sendDoctorOnlineNotification(patientEmails, doctor.user.name, doctor.speciality)

        // Log notification
        await prisma.notification.create({
          data: {
            type: "DOCTOR_ONLINE",
            message: `Dr. ${doctor.user.name} is now online`,
            sentTo: patientEmails,
          },
        })
      }
    }

    return NextResponse.json(doctorData)
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
