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

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Meeting ID is required' })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get meeting and transcript
    const meeting = await db.meeting.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own meetings
      },
      include: {
        transcript: true,
      },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (!meeting.transcript) {
      return res.status(404).json({
        error: 'Transcript not found',
        meetingStatus: meeting.status,
        message: meeting.status === 'completed'
          ? 'Transcript may still be processing'
          : 'Meeting has not been completed yet'
      })
    }

    const transcript = meeting.transcript

    const response = {
      id: transcript.id,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      assemblyAIId: transcript.assemblyAIId,
      status: transcript.status,
      language: transcript.language,
      speakers: transcript.speakers,
      segments: transcript.segments,
      confidence: transcript.confidence,
      duration: transcript.duration,
      wordCount: transcript.wordCount,
      createdAt: transcript.createdAt,
      updatedAt: transcript.updatedAt,
      meetingInfo: {
        scheduledStart: meeting.scheduledStart,
        actualStart: meeting.actualStart,
        actualEnd: meeting.actualEnd,
        participants: meeting.participants,
      },
    }

    // Set appropriate cache headers for completed transcripts
    if (transcript.status === 'completed') {
      res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    } else {
      res.setHeader('Cache-Control', 'no-cache') // Don't cache processing transcripts
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Transcript API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}