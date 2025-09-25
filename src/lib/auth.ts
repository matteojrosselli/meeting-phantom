import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return userId
}

export async function getAuthData() {
  const { userId, sessionId, getToken } = await auth()
  return { userId, sessionId, getToken }
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}