import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { z } from 'zod'

const callbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse query parameters or body
    const data = req.method === 'GET' ? req.query : req.body
    const result = callbackSchema.safeParse(data)

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid callback parameters',
        details: result.error,
      })
    }

    const { code, state, error } = result.data

    // Handle OAuth error response
    if (error) {
      return res.status(400).json({
        error: 'OAuth authorization failed',
        details: error,
      })
    }

    // Validate and decode state parameter
    let stateData: { userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return res.status(400).json({ error: 'Invalid state parameter' })
    }

    const { userId, timestamp } = stateData

    // Check state timestamp (prevent replay attacks)
    const maxAge = 10 * 60 * 1000 // 10 minutes
    if (Date.now() - timestamp > maxAge) {
      return res.status(400).json({ error: 'State parameter expired' })
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Exchange authorization code for access token
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Gmail OAuth not properly configured' })
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Gmail token exchange failed:', errorText)
      return res.status(500).json({ error: 'Token exchange failed' })
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Update user with Gmail tokens
    await db.user.update({
      where: { id: user.id },
      data: {
        gmailConnected: true,
        gmailAccessToken: access_token,
        gmailRefreshToken: refresh_token,
      },
    })

    // If this is a browser callback, redirect to success page
    if (req.method === 'GET') {
      const successUrl = process.env.NEXTAUTH_URL + '/dashboard?gmail_connected=true'
      return res.redirect(302, successUrl)
    }

    // For API responses, return success
    res.status(200).json({
      success: true,
      connected: true,
      expiresIn: expires_in,
    })
  } catch (error) {
    console.error('Gmail callback error:', error)

    // If this is a browser callback, redirect to error page
    if (req.method === 'GET') {
      const errorUrl = process.env.NEXTAUTH_URL + '/dashboard?gmail_error=true'
      return res.redirect(302, errorUrl)
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}