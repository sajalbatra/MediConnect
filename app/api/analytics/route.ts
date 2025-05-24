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
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    const [
      totalDoctors,
      totalPatients,
      onlineDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      recentNotifications,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.doctor.count({ where: { isOnline: true } }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      prisma.appointment.count({
        where: {
          status: "PENDING",
          createdAt: { gte: startDate },
        },
      }),
      prisma.appointment.count({
        where: {
          status: "COMPLETED",
          createdAt: { gte: startDate },
        },
      }),
      prisma.notification.count({
        where: {
          sentAt: { gte: startDate },
        },
      }),
    ])

    // Get appointment trends
    const appointmentTrends = await prisma.appointment.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
    })

    // Get doctor speciality distribution
    const specialityDistribution = await prisma.doctor.groupBy({
      by: ["speciality"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    })

    return NextResponse.json({
      overview: {
        totalDoctors,
        totalPatients,
        onlineDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        recentNotifications,
      },
      trends: {
        appointments: appointmentTrends.map((trend) => ({
          status: trend.status,
          count: trend._count.id,
        })),
      },
      distribution: {
        specialities: specialityDistribution.map((dist) => ({
          speciality: dist.speciality,
          count: dist._count.id,
        })),
      },
      period,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
