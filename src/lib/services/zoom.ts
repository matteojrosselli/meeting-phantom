import { MeetingRecording, ServiceConfig } from './types'

interface ZoomTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: Date
}

interface ZoomMeeting {
  id: string
  uuid: string
  topic: string
  start_time: string
  duration: number
  host_id: string
  status: string
}

interface ZoomRecording {
  uuid: string
  id: string
  topic: string
  start_time: string
  duration: number
  total_size: number
  recording_files: Array<{
    id: string
    meeting_id: string
    recording_start: string
    recording_end: string
    file_type: string
    file_extension: string
    file_size: number
    download_url: string
    status: string
    recording_type: 'audio_only' | 'video' | 'shared_screen_with_speaker_view'
  }>
}

export class ZoomService {
  private clientId: string
  private clientSecret: string
  private useMock: boolean

  constructor(config: ServiceConfig) {
    this.clientId = config.zoom?.clientId || ''
    this.clientSecret = config.zoom?.clientSecret || ''
    this.useMock = config.useMockServices || !this.clientId || !this.clientSecret
  }

  async getMeetingRecordings(meetingId: string, userTokens: ZoomTokens): Promise<MeetingRecording[]> {
    if (this.useMock) {
      return this.mockGetMeetingRecordings(meetingId)
    }

    try {
      // Ensure valid tokens
      const validTokens = await this.ensureValidTokens(userTokens)

      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${validTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return [] // No recordings found
        }
        throw new Error(`Zoom API error: ${response.statusText}`)
      }

      const data: ZoomRecording = await response.json()

      return data.recording_files
        .filter(file => file.status === 'completed' && file.recording_type === 'audio_only')
        .map(file => ({
          id: file.id,
          downloadUrl: file.download_url,
          fileType: file.file_type,
          fileSize: file.file_size,
          duration: Math.round((new Date(file.recording_end).getTime() - new Date(file.recording_start).getTime()) / 1000)
        }))
    } catch (error) {
      console.error('Zoom recordings error:', error)
      throw error
    }
  }

  async downloadRecording(downloadUrl: string, userTokens: ZoomTokens): Promise<Buffer> {
    if (this.useMock) {
      return this.mockDownloadRecording(downloadUrl)
    }

    try {
      const validTokens = await this.ensureValidTokens(userTokens)

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${validTokens.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Recording download failed: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Zoom download error:', error)
      throw error
    }
  }

  async getMeetingDetails(meetingId: string, userTokens: ZoomTokens): Promise<ZoomMeeting> {
    if (this.useMock) {
      return this.mockGetMeetingDetails(meetingId)
    }

    try {
      const validTokens = await this.ensureValidTokens(userTokens)

      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${validTokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Zoom API error: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Zoom meeting details error:', error)
      throw error
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<ZoomTokens> {
    if (this.useMock) {
      return this.mockRefreshToken(refreshToken)
    }

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Zoom token refresh failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  private async ensureValidTokens(tokens: ZoomTokens): Promise<ZoomTokens> {
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

  // Mock implementations for development
  private async mockGetMeetingRecordings(meetingId: string): Promise<MeetingRecording[]> {
    console.log(`[MOCK] Zoom: Getting recordings for meeting ${meetingId}`)
    await new Promise(resolve => setTimeout(resolve, 600))

    // Simulate some meetings having no recordings
    if (Math.random() < 0.3) {
      return []
    }

    return [
      {
        id: `recording-${meetingId}-audio`,
        downloadUrl: `https://mock-zoom.com/rec/${meetingId}/audio.m4a`,
        fileType: 'M4A',
        fileSize: 2547892, // ~2.5MB
        duration: 1847 // ~30 minutes
      }
    ]
  }

  private async mockDownloadRecording(downloadUrl: string): Promise<Buffer> {
    console.log(`[MOCK] Zoom: Downloading recording from ${downloadUrl}`)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate download time

    // Return a small mock audio buffer (silent audio data)
    const mockAudioData = Buffer.alloc(1024, 0)
    // Add some basic audio file headers to make it look like real audio
    mockAudioData.write('ftyp', 0)
    mockAudioData.write('M4A ', 4)

    return mockAudioData
  }

  private async mockGetMeetingDetails(meetingId: string): Promise<ZoomMeeting> {
    console.log(`[MOCK] Zoom: Getting details for meeting ${meetingId}`)
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      id: meetingId,
      uuid: `uuid-${meetingId}`,
      topic: 'Development Team Sync - Mock Meeting',
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      duration: 45,
      host_id: 'mock-host-id',
      status: 'finished'
    }
  }

  private async mockRefreshToken(refreshToken: string): Promise<ZoomTokens> {
    console.log(`[MOCK] Zoom: Refreshing access token`)
    await new Promise(resolve => setTimeout(resolve, 400))

    return {
      accessToken: `mock-zoom-access-${Date.now()}`,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    }
  }
}