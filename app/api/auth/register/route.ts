import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, speciality, phone } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Email, password, name, and role are required" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        ...(role === "DOCTOR" && {
          doctor: {
            create: {
              speciality: speciality || "General Medicine",
            },
          },
        }),
        ...(role === "PATIENT" && {
          patient: {
            create: {
              phone: phone || null,
            },
          },
        }),
      },
      include: {
        doctor: true,
        patient: true,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ...(user.doctor && { doctor: user.doctor }),
      ...(user.patient && { patient: user.patient }),
    }

    return NextResponse.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
