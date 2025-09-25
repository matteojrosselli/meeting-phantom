import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createMeetingSchema = z.object({
  zoomMeetingId: z.string(),
  title: z.string(),
  scheduledStart: z.string().transform((val) => new Date(val)),
  meetingUrl: z.string().url(),
  participants: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).default([]),
})

const querySchema = z.object({
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  offset: z.string().optional().transform((val) => val ? parseInt(val, 10) : 0),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'failed', 'skipped']).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (req.method === 'GET') {
      // List meetings
      const queryResult = querySchema.safeParse(req.query)
      if (!queryResult.success) {
        return res.status(400).json({ error: 'Invalid query parameters', details: queryResult.error })
      }

      const { limit, offset, status } = queryResult.data

      const where = {
        userId: user.id,
        ...(status && { status }),
      }

      const [meetings, total] = await Promise.all([
        db.meeting.findMany({
          where,
          orderBy: { scheduledStart: 'desc' },
          take: limit,
          skip: offset,
          include: {
            transcript: true,
            summary: true,
            actionItems: true,
            _count: {
              select: {
                emails: true,
              },
            },
          },
        }),
        db.meeting.count({ where }),
      ])

      const hasMore = offset + limit < total

      const response = {
        meetings: meetings.map(meeting => ({
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
          hasTranscript: !!meeting.transcript,
          hasSummary: !!meeting.summary,
          actionItemsCount: meeting.actionItems.length,
          emailsCount: meeting._count.emails,
        })),
        total,
        hasMore,
      }

      return res.status(200).json(response)
    }

    if (req.method === 'POST') {
      // Create meeting
      const bodyResult = createMeetingSchema.safeParse(req.body)
      if (!bodyResult.success) {
        return res.status(400).json({ error: 'Invalid request body', details: bodyResult.error })
      }

      const { zoomMeetingId, title, scheduledStart, meetingUrl, participants } = bodyResult.data

      // Check for duplicate meeting
      const existingMeeting = await db.meeting.findUnique({
        where: {
          userId_zoomMeetingId: {
            userId: user.id,
            zoomMeetingId,
          },
        },
      })

      if (existingMeeting) {
        // Return existing meeting instead of creating duplicate
        return res.status(200).json({
          id: existingMeeting.id,
          zoomMeetingId: existingMeeting.zoomMeetingId,
          title: existingMeeting.title,
          scheduledStart: existingMeeting.scheduledStart,
          actualStart: existingMeeting.actualStart,
          actualEnd: existingMeeting.actualEnd,
          status: existingMeeting.status,
          participants: existingMeeting.participants,
          meetingUrl: existingMeeting.meetingUrl,
          isExcluded: existingMeeting.isExcluded,
          botJoined: existingMeeting.botJoined,
          createdAt: existingMeeting.createdAt,
        })
      }

      // Create new meeting
      const meeting = await db.meeting.create({
        data: {
          userId: user.id,
          zoomMeetingId,
          title,
          scheduledStart,
          meetingUrl,
          participants,
          status: 'scheduled',
        },
      })

      const response = {
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
      }

      return res.status(201).json(response)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Meetings API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}