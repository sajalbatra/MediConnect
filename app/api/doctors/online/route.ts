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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const onlineDoctors = await prisma.doctor.findMany({
      where: { isOnline: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        lastOnlineAt: "desc",
      },
    })

    const doctorsData = onlineDoctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      speciality: doctor.speciality,
      isOnline: doctor.isOnline,
      lastOnlineAt: doctor.lastOnlineAt,
    }))

    return NextResponse.json(doctorsData)
  } catch (error) {
    console.error("Fetch online doctors error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
