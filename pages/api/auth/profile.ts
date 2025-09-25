import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Find or create user in database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      // Create user from Clerk data - this would typically get user data from Clerk
      // For now, we'll create a minimal user record
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: `user-${userId}@example.com`, // Would get from Clerk
          name: 'User Name', // Would get from Clerk
        },
      })
    }

    const response = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      zoomConnected: user.zoomConnected,
      gmailConnected: user.gmailConnected,
      preferences: user.preferences,
      createdAt: user.createdAt,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Profile API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}