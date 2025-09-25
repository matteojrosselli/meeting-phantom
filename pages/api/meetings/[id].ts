import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateMeetingSchema = z.object({
  title: z.string().optional(),
  isExcluded: z.boolean().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'failed', 'skipped']).optional(),
  participants: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    joinTime: z.string().optional(),
    leaveTime: z.string().optional(),
  })).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
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

    if (req.method === 'PATCH') {
      // Update meeting
      const bodyResult = updateMeetingSchema.safeParse(req.body)
      if (!bodyResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: bodyResult.error
        })
      }

      const updates = bodyResult.data

      // Verify meeting exists and user owns it
      const existingMeeting = await db.meeting.findUnique({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existingMeeting) {
        return res.status(404).json({ error: 'Meeting not found' })
      }

      // Update meeting
      const updatedMeeting = await db.meeting.update({
        where: { id },
        data: updates,
        include: {
          transcript: true,
          summary: true,
          actionItems: {
            orderBy: { createdAt: 'asc' },
          },
          emails: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      })

      const response = formatMeetingResponse(updatedMeeting)
      return res.status(200).json(response)
    }

    // GET request - Get meeting with all related data
    const meeting = await db.meeting.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own meetings
      },
      include: {
        transcript: true,
        summary: true,
        actionItems: {
          orderBy: { createdAt: 'asc' },
        },
        emails: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Limit to recent emails
        },
      },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const response = formatMeetingResponse(meeting)
    res.status(200).json(response)
  } catch (error) {
    console.error('Meeting details API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function formatMeetingResponse(meeting: any) {
  return {
    id: meeting.id,
    zoomMeetingId: meeting.zoomMeetingId,
    title: meeting.title,
    scheduledStart: meeting.scheduledStart,
    actualStart: meeting.actualStart,
    actualEnd: meeting.actualEnd,
    status: meeting.status,
    participants: meeting.participants,
    meetingUrl: meeting.meetingUrl,
    isExcluded: meeting.isExcluded,
    botJoined: meeting.botJoined,
    createdAt: meeting.createdAt,
    transcript: meeting.transcript ? {
      id: meeting.transcript.id,
      assemblyAIId: meeting.transcript.assemblyAIId,
      status: meeting.transcript.status,
      language: meeting.transcript.language,
      speakers: meeting.transcript.speakers,
      segments: meeting.transcript.segments,
      confidence: meeting.transcript.confidence,
      duration: meeting.transcript.duration,
      wordCount: meeting.transcript.wordCount,
      createdAt: meeting.transcript.createdAt,
      updatedAt: meeting.transcript.updatedAt,
    } : null,
    summary: meeting.summary ? {
      id: meeting.summary.id,
      title: meeting.summary.title,
      overview: meeting.summary.overview,
      keyPoints: meeting.summary.keyPoints,
      decisions: meeting.summary.decisions,
      nextSteps: meeting.summary.nextSteps,
      attendees: meeting.summary.attendees,
      aiModel: meeting.summary.aiModel,
      generatedAt: meeting.summary.generatedAt,
      createdAt: meeting.summary.createdAt,
    } : null,
    actionItems: meeting.actionItems?.map((item: any) => ({
      id: item.id,
      text: item.text,
      assignee: item.assignee,
      dueDate: item.dueDate,
      priority: item.priority,
      status: item.status,
      confidence: item.confidence,
      sourceSegment: item.sourceSegment,
      createdAt: item.createdAt,
    })) || [],
    recentEmails: meeting.emails?.map((email: any) => ({
      id: email.id,
      recipientEmail: email.recipientEmail,
      recipientName: email.recipientName,
      subject: email.subject,
      status: email.status,
      sentAt: email.sentAt,
      errorMessage: email.errorMessage,
      retryCount: email.retryCount,
      createdAt: email.createdAt,
    })) || [],
  }
}