import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Generate Zoom OAuth URL
    const clientId = process.env.ZOOM_CLIENT_ID
    const redirectUri = process.env.ZOOM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/zoom/callback`

    if (!clientId) {
      return res.status(500).json({ error: 'Zoom OAuth not configured' })
    }

    const scopes = [
      'meeting:read',
      'meeting:write',
      'webinar:read',
      'user:read',
      'recording:read'
    ].join(' ')

    // Generate state parameter to prevent CSRF attacks
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')

    const authUrl = new URL('https://zoom.us/oauth/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('state', state)

    res.status(200).json({
      authUrl: authUrl.toString(),
    })
  } catch (error) {
    console.error('Zoom connect API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}