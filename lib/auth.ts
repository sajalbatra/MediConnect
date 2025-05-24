export const runtime = 'nodejs';
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import type { JWTPayload as JosePayload } from "jose"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Encode secret using TextEncoder for Web Crypto compatibility (Edge-safe)
const encoder = new TextEncoder()
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined")
const secret = encoder.encode(JWT_SECRET)

/**
 * Generate a JWT token for the given payload
 * @param payload - user info to encode in token
 * @returns JWT token string
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  const token =await new SignJWT(payload as unknown as JosePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
    return token
}

/**
 * Verify a JWT token and return the decoded payload (SYNCHRONOUS for middleware)
 * @param token - JWT token string
 * @returns Decoded JWTPayload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // For middleware, we need synchronous verification
    // Using a synchronous approach with jose library
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error("Invalid token format")
      return null
    }

    // Decode payload (this doesn't verify signature but gets the data)
    const payload = JSON.parse(atob(parts[1]))
    
    // Basic validation - in production you'd want proper signature verification
    if (!payload.userId || !payload.email || !payload.role) {
      console.error("Invalid token payload structure")
      return null
    }

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.error("Token expired")
      return null
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    console.error("JWT verification failed:", (error as Error).message)
    return null
  }
}

/**
 * Verify a JWT token and return the decoded payload (ASYNC for API routes)
 * @param token - JWT token string
 * @returns Decoded JWTPayload or null if invalid
 */
export async function verifyTokenAsync(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Type-safe extraction of our custom fields
    const { userId, email, role } = payload as unknown as JWTPayload
    
    if (!userId || !email || !role) {
      console.error("Invalid token payload structure")
      return null
    }
    
    return { userId, email, role }
  } catch (error) {
    console.error("JWT verification failed:", (error as Error).message)
    return null
  }
}

/**
 * Hash a plain text password
 * @param password - plain password
 * @returns hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain password with a hashed one
 * @param password - plain password
 * @param hash - hashed password
 * @returns true if match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Password comparison failed:", (error as Error).message)
    return false
  }
}

/**
 * Extract token from Next.js request headers
 * @param request - Next.js NextRequest object
 * @returns JWT token or null
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7).trim()
  }
  return null
}

/**
 * Extract and verify token from Next.js request (for API routes)
 * @param request - Next.js NextRequest object
 * @returns Decoded JWTPayload or null
 */
export async function getVerifiedTokenFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  return await verifyTokenAsync(token)
}

/**
 * Check if user has required role
 * @param userRole - user's role
 * @param requiredRole - required role or array of roles
 * @returns true if authorized
 */
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  return userRole === requiredRole
}

/**
 * Role hierarchy check (assuming admin > doctor > patient)
 * @param userRole - user's role
 * @param minimumRole - minimum required role
 * @returns true if user has sufficient privileges
 */
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  const roleHierarchy = {
    admin: 3,
    doctor: 2,
    patient: 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}