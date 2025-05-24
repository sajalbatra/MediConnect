import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can book appointments" }, { status: 403 })
    }

    const { doctorId, appointmentDate, notes } = await request.json()

    if (!doctorId || !appointmentDate) {
      return NextResponse.json({ error: "Doctor ID and appointment date are required" }, { status: 400 })
    }

    // Check if doctor exists and is online
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    if (!doctor.isOnline) {
      return NextResponse.json({ error: "Doctor is currently offline" }, { status: 400 })
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: payload.userId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 })
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: new Date(appointmentDate),
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes,
      doctor: {
        name: appointment.doctor.user.name,
        speciality: appointment.doctor.speciality,
      },
      patient: {
        name: appointment.patient.user.name,
      },
    })
  } catch (error) {
    console.error("Create appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    if (payload.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId },
      })
      if (!doctor) {
        return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 })
      }
      where.doctorId = doctor.id
    } else if (payload.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: payload.userId },
      })
      if (!patient) {
        return NextResponse.json({ error: "Patient profile not found" }, { status: 404 })
      }
      where.patientId = patient.id
    }

    if (status) {
      where.status = status
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: { user: true },
          },
          patient: {
            include: { user: true },
          },
        },
        orderBy: { appointmentDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ])

    const appointmentsData = appointments.map((appointment) => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      doctor: {
        id: appointment.doctor.id,
        name: appointment.doctor.user.name,
        speciality: appointment.doctor.speciality,
        email: appointment.doctor.user.email,
      },
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.user.name,
        email: appointment.patient.user.email,
        phone: appointment.patient.phone,
      },
    }))

    return NextResponse.json({
      appointments: appointmentsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch appointments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
