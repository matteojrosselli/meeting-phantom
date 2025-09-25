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

    // Generate Google OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`

    if (!clientId) {
      return res.status(500).json({ error: 'Gmail OAuth not configured' })
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ')

    // Generate state parameter to prevent CSRF attacks
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    res.status(200).json({
      authUrl: authUrl.toString(),
    })
  } catch (error) {
    console.error('Gmail connect API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}