import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { z } from 'zod'

const zoomWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    account_id: z.string(),
    object: z.object({
      id: z.string(),
      uuid: z.string(),
      host_id: z.string(),
      topic: z.string(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      duration: z.number().optional(),
      participants: z.array(z.object({
        user_name: z.string(),
        user_email: z.string(),
        join_time: z.string(),
        leave_time: z.string().optional(),
      })).optional().default([]),
    }),
  }),
  event_ts: z.number(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify webhook signature (simplified for now)
    const authHeader = req.headers.authorization
    const expectedToken = process.env.ZOOM_WEBHOOK_SECRET || 'zoom-webhook-token'

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized webhook request' })
    }

    // Parse webhook payload
    const webhookResult = zoomWebhookSchema.safeParse(req.body)
    if (!webhookResult.success) {
      return res.status(400).json({
        error: 'Invalid webhook payload',
        details: webhookResult.error
      })
    }

    const { event, payload } = webhookResult.data
    const { object: meetingData } = payload

    // Handle different event types
    switch (event) {
      case 'meeting.started':
        await handleMeetingStarted(meetingData)
        break

      case 'meeting.ended':
        await handleMeetingEnded(meetingData)
        break

      case 'meeting.participant_joined':
      case 'meeting.participant_left':
        await handleParticipantEvent(meetingData, event)
        break

      default:
        return res.status(400).json({
          error: 'Unsupported event type',
          supportedEvents: ['meeting.started', 'meeting.ended', 'meeting.participant_joined', 'meeting.participant_left']
        })
    }

    res.status(200).json({
      received: true,
      processed: true,
      event,
      meetingId: meetingData.id,
    })
  } catch (error) {
    console.error('Zoom webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleMeetingStarted(meetingData: any) {
  const { id: zoomMeetingId, start_time } = meetingData

  // Update meeting status to in_progress
  await db.meeting.updateMany({
    where: { zoomMeetingId },
    data: {
      status: 'in_progress',
      actualStart: start_time ? new Date(start_time) : new Date(),
      botJoined: true,
    },
  })

  console.log(`Meeting started: ${zoomMeetingId}`)
}

async function handleMeetingEnded(meetingData: any) {
  const {
    id: zoomMeetingId,
    end_time,
    duration,
    participants = []
  } = meetingData

  // Update meeting status to completed
  const updatedMeetings = await db.meeting.updateMany({
    where: { zoomMeetingId },
    data: {
      status: 'completed',
      actualEnd: end_time ? new Date(end_time) : new Date(),
      participants: participants.map((p: any) => ({
        name: p.user_name,
        email: p.user_email,
        joinTime: p.join_time,
        leaveTime: p.leave_time,
      })),
    },
  })

  if (updatedMeetings.count === 0) {
    console.warn(`No meetings found for Zoom meeting ID: ${zoomMeetingId}`)
    return
  }

  // Find the meeting to trigger transcript processing
  const meeting = await db.meeting.findFirst({
    where: { zoomMeetingId },
    include: { user: true },
  })

  if (meeting) {
    // Check if meeting is long enough to process
    const minDurationSeconds = 60 // 1 minute minimum
    if (duration && duration < minDurationSeconds) {
      await db.meeting.update({
        where: { id: meeting.id },
        data: { status: 'skipped' },
      })
      console.log(`Meeting ${zoomMeetingId} skipped - too short (${duration}s)`)
      return
    }

    // TODO: Trigger transcript generation
    // This would typically:
    // 1. Download recording from Zoom
    // 2. Send audio to AssemblyAI
    // 3. Create transcript record with 'processing' status
    // 4. Process completed transcript to generate summary and action items
    // 5. Send email summary to participants

    console.log(`Meeting ended: ${zoomMeetingId} - transcript processing would start here`)
  }
}

async function handleParticipantEvent(meetingData: any, event: string) {
  const { id: zoomMeetingId } = meetingData

  // For now, just log participant events
  // In a full implementation, this could update participant tracking
  console.log(`Participant event ${event} for meeting: ${zoomMeetingId}`)
}