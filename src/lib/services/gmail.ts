import { ServiceConfig, EmailTemplate } from './types'

interface GmailSendRequest {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  htmlBody: string
  textBody?: string
  attachments?: Array<{
    filename: string
    content: string
    mimeType: string
  }>
}

interface GmailSendResult {
  messageId: string
  status: 'sent' | 'failed'
  error?: string
}

interface GmailTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: Date
}

export class GmailService {
  private clientId: string
  private clientSecret: string
  private useMock: boolean

  constructor(config: ServiceConfig) {
    this.clientId = config.gmail?.clientId || ''
    this.clientSecret = config.gmail?.clientSecret || ''
    this.useMock = config.useMockServices || !this.clientId || !this.clientSecret
  }

  async sendEmail(request: GmailSendRequest, userTokens: GmailTokens): Promise<GmailSendResult> {
    if (this.useMock) {
      return this.mockSendEmail(request)
    }

    try {
      // Refresh token if needed
      const validTokens = await this.ensureValidTokens(userTokens)

      // Create email message
      const emailMessage = this.createEmailMessage(request)

      // Send via Gmail API
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: emailMessage
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Gmail API error: ${response.statusText} - ${error}`)
      }

      const result = await response.json()

      return {
        messageId: result.id,
        status: 'sent'
      }
    } catch (error) {
      console.error('Gmail send error:', error)
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
    if (this.useMock) {
      return this.mockRefreshToken(refreshToken)
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  private async ensureValidTokens(tokens: GmailTokens): Promise<GmailTokens> {
    // If no expiry date, assume token is still valid
    if (!tokens.expiresAt) {
      return tokens
    }

    // If token expires within 5 minutes, refresh it
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    if (tokens.expiresAt <= fiveMinutesFromNow) {
      return this.refreshAccessToken(tokens.refreshToken)
    }

    return tokens
  }

  private createEmailMessage(request: GmailSendRequest): string {
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const message = [
      'MIME-Version: 1.0',
      `To: ${request.to.join(', ')}`,
    ]

    if (request.cc && request.cc.length > 0) {
      message.push(`Cc: ${request.cc.join(', ')}`)
    }

    if (request.bcc && request.bcc.length > 0) {
      message.push(`Bcc: ${request.bcc.join(', ')}`)
    }

    message.push(
      `Subject: ${request.subject}`,
      `Content-Type: multipart/alternative; boundary=${boundary}`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      this.encodeQuotedPrintable(request.textBody || this.htmlToText(request.htmlBody)),
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      this.encodeQuotedPrintable(request.htmlBody),
      '',
      `--${boundary}--`
    )

    // Base64 encode the entire message
    return Buffer.from(message.join('\r\n')).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  private encodeQuotedPrintable(text: string): string {
    return text
      .replace(/[^\x20-\x7E]/g, (match) => {
        const hex = match.charCodeAt(0).toString(16).toUpperCase()
        return `=${hex.padStart(2, '0')}`
      })
      .replace(/(.{75})/g, '$1=\r\n')
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Mock implementations for development
  private async mockSendEmail(request: GmailSendRequest): Promise<GmailSendResult> {
    console.log(`[MOCK] Gmail: Sending email to ${request.to.join(', ')}`)
    console.log(`[MOCK] Gmail: Subject: ${request.subject}`)
    console.log(`[MOCK] Gmail: HTML Body length: ${request.htmlBody.length} chars`)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        messageId: '',
        status: 'failed',
        error: 'Mock: Simulated delivery failure'
      }
    }

    return {
      messageId: `mock-gmail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent'
    }
  }

  private async mockRefreshToken(refreshToken: string): Promise<GmailTokens> {
    console.log(`[MOCK] Gmail: Refreshing token`)
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      accessToken: `mock-access-token-${Date.now()}`,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    }
  }
}