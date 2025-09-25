import { ServiceConfig } from './types'
import { prisma } from '@/lib/db'

interface MeetingData {
  id?: string
  zoomMeetingId: string
  title: string
  startTime: Date
  endTime?: Date
  hostEmail: string
  participants: Array<{
    name: string
    email: string
    joinTime?: Date
    leaveTime?: Date
  }>
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  recordingUrl?: string
  isExcluded?: boolean
}

interface MeetingFilters {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  startDate?: Date
  endDate?: Date
  hostEmail?: string
  includeExcluded?: boolean
}

interface MeetingUpdate {
  title?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  endTime?: Date
  recordingUrl?: string
  isExcluded?: boolean
  participants?: Array<{
    name: string
    email: string
    joinTime?: Date
    leaveTime?: Date
  }>
}

export class MeetingService {
  private config: ServiceConfig

  constructor(config: ServiceConfig) {
    this.config = config
  }

  /**
   * Create a new meeting record
   */
  async createMeeting(userId: string, meetingData: MeetingData): Promise<MeetingData> {
    try {
      const meeting = await prisma.meeting.create({
        data: {
          zoomMeetingId: meetingData.zoomMeetingId,
          title: meetingData.title,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          hostEmail: meetingData.hostEmail,
          participants: meetingData.participants as any,
          status: meetingData.status,
          recordingUrl: meetingData.recordingUrl,
          isExcluded: meetingData.isExcluded || false,
          userId
        }
      })

      return {
        id: meeting.id,
        zoomMeetingId: meeting.zoomMeetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime || undefined,
        hostEmail: meeting.hostEmail,
        participants: (meeting.participants as any) || [],
        status: meeting.status as any,
        recordingUrl: meeting.recordingUrl || undefined,
        isExcluded: meeting.isExcluded
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
      throw new Error('Meeting creation failed')
    }
  }

  /**
   * Get meeting by ID
   */
  async getMeetingById(meetingId: string, userId: string): Promise<MeetingData | null> {
    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId
        }
      })

      if (!meeting) return null

      return {
        id: meeting.id,
        zoomMeetingId: meeting.zoomMeetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime || undefined,
        hostEmail: meeting.hostEmail,
        participants: (meeting.participants as any) || [],
        status: meeting.status as any,
        recordingUrl: meeting.recordingUrl || undefined,
        isExcluded: meeting.isExcluded
      }
    } catch (error) {
      console.error('Failed to get meeting:', error)
      return null
    }
  }

  /**
   * Get meeting by Zoom meeting ID
   */
  async getMeetingByZoomId(zoomMeetingId: string, userId: string): Promise<MeetingData | null> {
    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          zoomMeetingId,
          userId
        }
      })

      if (!meeting) return null

      return {
        id: meeting.id,
        zoomMeetingId: meeting.zoomMeetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime || undefined,
        hostEmail: meeting.hostEmail,
        participants: (meeting.participants as any) || [],
        status: meeting.status as any,
        recordingUrl: meeting.recordingUrl || undefined,
        isExcluded: meeting.isExcluded
      }
    } catch (error) {
      console.error('Failed to get meeting by Zoom ID:', error)
      return null
    }
  }

  /**
   * Update meeting information
   */
  async updateMeeting(meetingId: string, userId: string, updates: MeetingUpdate): Promise<MeetingData | null> {
    try {
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.endTime !== undefined) updateData.endTime = updates.endTime
      if (updates.recordingUrl !== undefined) updateData.recordingUrl = updates.recordingUrl
      if (updates.isExcluded !== undefined) updateData.isExcluded = updates.isExcluded
      if (updates.participants !== undefined) updateData.participants = updates.participants

      const meeting = await prisma.meeting.update({
        where: {
          id: meetingId,
          userId
        },
        data: updateData
      })

      return {
        id: meeting.id,
        zoomMeetingId: meeting.zoomMeetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime || undefined,
        hostEmail: meeting.hostEmail,
        participants: (meeting.participants as any) || [],
        status: meeting.status as any,
        recordingUrl: meeting.recordingUrl || undefined,
        isExcluded: meeting.isExcluded
      }
    } catch (error) {
      console.error('Failed to update meeting:', error)
      return null
    }
  }

  /**
   * List meetings with optional filters
   */
  async listMeetings(userId: string, filters: MeetingFilters = {}, limit = 50, offset = 0): Promise<MeetingData[]> {
    try {
      const whereClause: any = { userId }

      if (filters.status) {
        whereClause.status = filters.status
      }

      if (filters.startDate || filters.endDate) {
        whereClause.startTime = {}
        if (filters.startDate) whereClause.startTime.gte = filters.startDate
        if (filters.endDate) whereClause.startTime.lte = filters.endDate
      }

      if (filters.hostEmail) {
        whereClause.hostEmail = filters.hostEmail
      }

      if (!filters.includeExcluded) {
        whereClause.isExcluded = false
      }

      const meetings = await prisma.meeting.findMany({
        where: whereClause,
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset
      })

      return meetings.map(meeting => ({
        id: meeting.id,
        zoomMeetingId: meeting.zoomMeetingId,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime || undefined,
        hostEmail: meeting.hostEmail,
        participants: (meeting.participants as any) || [],
        status: meeting.status as any,
        recordingUrl: meeting.recordingUrl || undefined,
        isExcluded: meeting.isExcluded
      }))
    } catch (error) {
      console.error('Failed to list meetings:', error)
      return []
    }
  }

  /**
   * Delete meeting (soft delete by marking as excluded)
   */
  async deleteMeeting(meetingId: string, userId: string): Promise<boolean> {
    try {
      await prisma.meeting.update({
        where: {
          id: meetingId,
          userId
        },
        data: {
          isExcluded: true
        }
      })

      return true
    } catch (error) {
      console.error('Failed to delete meeting:', error)
      return false
    }
  }

  /**
   * Get meeting statistics for user
   */
  async getMeetingStats(userId: string): Promise<{
    total: number
    completed: number
    inProgress: number
    scheduled: number
    thisWeek: number
  }> {
    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [total, completed, inProgress, scheduled, thisWeek] = await Promise.all([
        prisma.meeting.count({
          where: { userId, isExcluded: false }
        }),
        prisma.meeting.count({
          where: { userId, status: 'completed', isExcluded: false }
        }),
        prisma.meeting.count({
          where: { userId, status: 'in_progress', isExcluded: false }
        }),
        prisma.meeting.count({
          where: { userId, status: 'scheduled', isExcluded: false }
        }),
        prisma.meeting.count({
          where: {
            userId,
            isExcluded: false,
            startTime: {
              gte: weekAgo
            }
          }
        })
      ])

      return {
        total,
        completed,
        inProgress,
        scheduled,
        thisWeek
      }
    } catch (error) {
      console.error('Failed to get meeting stats:', error)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        scheduled: 0,
        thisWeek: 0
      }
    }
  }

  /**
   * Update meeting status from webhook events
   */
  async updateMeetingStatus(zoomMeetingId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled', endTime?: Date): Promise<boolean> {
    try {
      const updateData: any = { status }
      if (endTime) updateData.endTime = endTime

      await prisma.meeting.updateMany({
        where: { zoomMeetingId },
        data: updateData
      })

      return true
    } catch (error) {
      console.error('Failed to update meeting status:', error)
      return false
    }
  }
}
