import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        doctor: true,
        patient: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            id: true,
            speciality: true,
            isOnline: true,
            lastOnlineAt: true,
          },
        },
        patient: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name, phone, speciality } = await request.json()

    const updateData: any = {}
    if (name) updateData.name = name

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      include: {
        doctor: true,
        patient: true,
      },
    })

    // Update doctor-specific fields
    if (payload.role === "DOCTOR" && speciality) {
      await prisma.doctor.update({
        where: { userId: payload.userId },
        data: { speciality },
      })
    }

    // Update patient-specific fields
    if (payload.role === "PATIENT" && phone !== undefined) {
      await prisma.patient.update({
        where: { userId: payload.userId },
        data: { phone },
      })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
