import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { status, notes } = await request.json()
    const appointmentId = params.id

    // Get appointment with related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check permissions
    if (payload.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId },
      })
      if (!doctor || doctor.id !== appointment.doctorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (payload.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: payload.userId },
      })
      if (!patient || patient.id !== appointment.patientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      // Patients can only cancel appointments
      if (status && status !== "CANCELLED") {
        return NextResponse.json({ error: "Patients can only cancel appointments" }, { status: 403 })
      }
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    })

    return NextResponse.json({
      id: updatedAppointment.id,
      appointmentDate: updatedAppointment.appointmentDate,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      doctor: {
        name: updatedAppointment.doctor.user.name,
        speciality: updatedAppointment.doctor.speciality,
      },
      patient: {
        name: updatedAppointment.patient.user.name,
      },
    })
  } catch (error) {
    console.error("Update appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const appointmentId = params.id

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check permissions
    if (payload.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: payload.userId },
      })
      if (!patient || patient.id !== appointment.patientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (payload.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId },
      })
      if (!doctor || doctor.id !== appointment.doctorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    })

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Delete appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
