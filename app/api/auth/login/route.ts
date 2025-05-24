import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true,
      },
    })

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await generateToken({
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
