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

    // Get user's integration status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const response = {
      zoom: {
        connected: user.zoomConnected,
        connectedAt: user.zoomConnected ? user.updatedAt : null,
        permissions: user.zoomConnected ? ['read:meetings', 'create:webhook'] : [],
      },
      gmail: {
        connected: user.gmailConnected,
        connectedAt: user.gmailConnected ? user.updatedAt : null,
        permissions: user.gmailConnected ? ['send:email', 'read:profile'] : [],
      },
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Integrations API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}