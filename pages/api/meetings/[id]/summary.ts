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

    // Get meeting with summary and action items
    const meeting = await db.meeting.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own meetings
      },
      include: {
        summary: true,
        actionItems: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (!meeting.summary) {
      return res.status(404).json({
        error: 'Summary not found',
        meetingStatus: meeting.status,
        message: meeting.status === 'completed'
          ? 'Summary may still be generating'
          : 'Meeting has not been completed yet'
      })
    }

    const summary = meeting.summary

    const response = {
      id: summary.id,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      title: summary.title,
      overview: summary.overview,
      keyPoints: summary.keyPoints,
      decisions: summary.decisions,
      nextSteps: summary.nextSteps,
      attendees: summary.attendees,
      aiModel: summary.aiModel,
      generatedAt: summary.generatedAt,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
      actionItems: meeting.actionItems.map(item => ({
        id: item.id,
        text: item.text,
        assignee: item.assignee,
        dueDate: item.dueDate,
        priority: item.priority,
        status: item.status,
        confidence: item.confidence,
        sourceSegment: item.sourceSegment,
        createdAt: item.createdAt,
      })),
      meetingInfo: {
        scheduledStart: meeting.scheduledStart,
        actualStart: meeting.actualStart,
        actualEnd: meeting.actualEnd,
        duration: meeting.actualStart && meeting.actualEnd
          ? Math.round((new Date(meeting.actualEnd).getTime() - new Date(meeting.actualStart).getTime()) / 1000 / 60) // duration in minutes
          : null,
        participants: meeting.participants,
      },
    }

    // Set cache headers for completed summaries
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    res.status(200).json(response)
  } catch (error) {
    console.error('Summary API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}