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

    const { searchParams } = new URL(request.url)
    const speciality = searchParams.get("speciality")
    const isOnline = searchParams.get("isOnline")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (speciality) {
      where.speciality = {
        contains: speciality,
        mode: "insensitive",
      }
    }
    if (isOnline !== null) {
      where.isOnline = isOnline === "true"
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: [{ isOnline: "desc" }, { lastOnlineAt: "desc" }, { user: { name: "asc" } }],
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ])

    const doctorsData = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      speciality: doctor.speciality,
      isOnline: doctor.isOnline,
      lastOnlineAt: doctor.lastOnlineAt,
      createdAt: doctor.user.createdAt,
    }))

    return NextResponse.json({
      doctors: doctorsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch doctors error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
