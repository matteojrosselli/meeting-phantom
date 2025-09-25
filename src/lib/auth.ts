import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export function getCurrentUserId() {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return userId
}

export function getAuthData() {
  const { userId, sessionId, getToken } = auth()
  return { userId, sessionId, getToken }
}

export async function requireAuth() {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}