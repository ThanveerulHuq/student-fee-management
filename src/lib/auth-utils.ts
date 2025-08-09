import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/login')
  }
  return session
}

export async function requireAdminAuth(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return session
}

export async function requireStaffOrAdminAuth(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    throw new Error('Staff or Admin access required')
  }
  return session
}

export async function getOptionalAuth(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

export function checkPermissions(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}