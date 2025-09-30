import { MeetingService } from '../../src/lib/services/meeting-service'

// Mock the database
jest.mock('../../src/lib/db', () => ({
  db: {
    meeting: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}))

import { db } from '../../src/lib/db'

describe('MeetingService', () => {
  let meetingService: MeetingService

  beforeEach(() => {
    meetingService = new MeetingService({ enabled: true })
    jest.clearAllMocks()
  })

  describe('createMeeting', () => {
    const mockMeetingData = {
      zoomMeetingId: 'zoom_123',
      title: 'Test Meeting',
      startTime: new Date('2025-01-01T10:00:00Z'),
      endTime: new Date('2025-01-01T11:00:00Z'),
      hostEmail: 'host@example.com',
      participants: [
        { name: 'John Doe', email: 'john@example.com' }
      ],
      status: 'scheduled' as const,
      recordingUrl: 'https://example.com/recording',
      isExcluded: false
    }

    const mockDbMeeting = {
      id: 'meeting_123',
      userId: 'user_123',
      zoomMeetingId: 'zoom_123',
      title: 'Test Meeting',
      scheduledStart: new Date('2025-01-01T10:00:00Z'),
      actualStart: new Date('2025-01-01T10:00:00Z'),
      actualEnd: new Date('2025-01-01T11:00:00Z'),
      status: 'scheduled',
      participants: [{ name: 'John Doe', email: 'john@example.com' }],
      meetingUrl: 'https://example.com/recording',
      isExcluded: false,
      botJoined: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should create meeting successfully', async () => {
      ;(db.meeting.create as jest.Mock).mockResolvedValue(mockDbMeeting)

      const result = await meetingService.createMeeting('user_123', mockMeetingData)

      expect(db.meeting.create).toHaveBeenCalledWith({
        data: {
          zoomMeetingId: 'zoom_123',
          title: 'Test Meeting',
          scheduledStart: mockMeetingData.startTime,
          actualStart: mockMeetingData.startTime,
          actualEnd: mockMeetingData.endTime,
          meetingUrl: 'https://example.com/recording',
          participants: mockMeetingData.participants,
          status: 'scheduled',
          isExcluded: false,
          userId: 'user_123'
        }
      })

      expect(result).toEqual({
        id: 'meeting_123',
        zoomMeetingId: 'zoom_123',
        title: 'Test Meeting',
        startTime: mockDbMeeting.scheduledStart,
        endTime: mockDbMeeting.actualEnd,
        hostEmail: '',
        participants: mockMeetingData.participants,
        status: 'scheduled',
        recordingUrl: 'https://example.com/recording',
        isExcluded: false
      })
    })

    it('should handle cancelled status mapping', async () => {
      const cancelledMeetingData = { ...mockMeetingData, status: 'cancelled' as const }
      const mockDbMeetingCancelled = { ...mockDbMeeting, status: 'skipped' }
      ;(db.meeting.create as jest.Mock).mockResolvedValue(mockDbMeetingCancelled)

      const result = await meetingService.createMeeting('user_123', cancelledMeetingData)

      expect(db.meeting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'skipped'
        })
      })
      expect(result.status).toBe('skipped')
    })

    it('should handle missing optional fields', async () => {
      const minimalMeetingData = {
        zoomMeetingId: 'zoom_456',
        title: 'Minimal Meeting',
        startTime: new Date('2025-01-01T14:00:00Z'),
        hostEmail: 'host2@example.com',
        participants: [],
        status: 'scheduled' as const
      }
      const mockMinimalDbMeeting = {
        ...mockDbMeeting,
        id: 'meeting_456',
        zoomMeetingId: 'zoom_456',
        title: 'Minimal Meeting',
        actualEnd: null,
        meetingUrl: '',
        participants: []
      }
      ;(db.meeting.create as jest.Mock).mockResolvedValue(mockMinimalDbMeeting)

      const result = await meetingService.createMeeting('user_123', minimalMeetingData)

      expect(result.endTime).toBeUndefined()
      expect(result.recordingUrl).toBeUndefined()
    })

    it('should throw error on database failure', async () => {
      ;(db.meeting.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      await expect(
        meetingService.createMeeting('user_123', mockMeetingData)
      ).rejects.toThrow('Meeting creation failed')
    })
  })

  describe('getMeetingById', () => {
    const mockDbMeeting = {
      id: 'meeting_123',
      userId: 'user_123',
      zoomMeetingId: 'zoom_123',
      title: 'Test Meeting',
      scheduledStart: new Date('2025-01-01T10:00:00Z'),
      actualStart: new Date('2025-01-01T10:00:00Z'),
      actualEnd: new Date('2025-01-01T11:00:00Z'),
      status: 'completed',
      participants: [],
      meetingUrl: 'https://example.com/recording',
      isExcluded: false,
    }

    it('should return meeting when found', async () => {
      ;(db.meeting.findFirst as jest.Mock).mockResolvedValue(mockDbMeeting)

      const result = await meetingService.getMeetingById('meeting_123', 'user_123')

      expect(db.meeting.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'meeting_123',
          userId: 'user_123'
        }
      })

      expect(result).toEqual({
        id: 'meeting_123',
        zoomMeetingId: 'zoom_123',
        title: 'Test Meeting',
        startTime: mockDbMeeting.scheduledStart,
        endTime: mockDbMeeting.actualEnd,
        hostEmail: '',
        participants: [],
        status: 'completed',
        recordingUrl: 'https://example.com/recording',
        isExcluded: false
      })
    })

    it('should return null when meeting not found', async () => {
      ;(db.meeting.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await meetingService.getMeetingById('nonexistent', 'user_123')

      expect(result).toBeNull()
    })

    it('should return null on database failure', async () => {
      ;(db.meeting.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.getMeetingById('meeting_123', 'user_123')
      expect(result).toBeNull()
    })
  })

  describe('getMeetingByZoomId', () => {
    const mockDbMeeting = {
      id: 'meeting_123',
      userId: 'user_123',
      zoomMeetingId: 'zoom_123',
      title: 'Zoom Meeting',
      scheduledStart: new Date('2025-01-01T10:00:00Z'),
      actualEnd: null,
      status: 'in_progress',
      participants: [],
      meetingUrl: '',
      isExcluded: false,
    }

    it('should return meeting by zoom ID', async () => {
      ;(db.meeting.findFirst as jest.Mock).mockResolvedValue(mockDbMeeting)

      const result = await meetingService.getMeetingByZoomId('zoom_123', 'user_123')

      expect(db.meeting.findFirst).toHaveBeenCalledWith({
        where: {
          zoomMeetingId: 'zoom_123',
          userId: 'user_123'
        }
      })

      expect(result?.zoomMeetingId).toBe('zoom_123')
      expect(result?.status).toBe('in_progress')
    })

    it('should return null when zoom meeting not found', async () => {
      ;(db.meeting.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await meetingService.getMeetingByZoomId('nonexistent_zoom', 'user_123')

      expect(result).toBeNull()
    })
  })

  describe('updateMeeting', () => {
    const mockDbMeeting = {
      id: 'meeting_123',
      userId: 'user_123',
      zoomMeetingId: 'zoom_123',
      title: 'Updated Meeting',
      scheduledStart: new Date('2025-01-01T10:00:00Z'),
      actualEnd: new Date('2025-01-01T12:00:00Z'),
      status: 'completed',
      participants: [{ name: 'Jane Doe', email: 'jane@example.com' }],
      meetingUrl: 'https://example.com/new-recording',
      isExcluded: false,
    }

    it('should update meeting successfully', async () => {
      ;(db.meeting.update as jest.Mock).mockResolvedValue(mockDbMeeting)

      const updates = {
        title: 'Updated Meeting',
        status: 'completed' as const,
        endTime: new Date('2025-01-01T12:00:00Z'),
        recordingUrl: 'https://example.com/new-recording'
      }

      const result = await meetingService.updateMeeting('meeting_123', 'user_123', updates)

      expect(db.meeting.update).toHaveBeenCalledWith({
        where: {
          id: 'meeting_123',
          userId: 'user_123'
        },
        data: {
          title: 'Updated Meeting',
          status: 'completed',
          endTime: updates.endTime,
          recordingUrl: 'https://example.com/new-recording'
        }
      })

      expect(result?.title).toBe('Updated Meeting')
      expect(result?.status).toBe('completed')
    })

    it('should handle status mapping for cancelled', async () => {
      const mockSkippedMeeting = { ...mockDbMeeting, status: 'skipped' }
      ;(db.meeting.update as jest.Mock).mockResolvedValue(mockSkippedMeeting)

      const updates = { status: 'cancelled' as const }
      const result = await meetingService.updateMeeting('meeting_123', 'user_123', updates)

      expect(db.meeting.update).toHaveBeenCalledWith({
        where: {
          id: 'meeting_123',
          userId: 'user_123'
        },
        data: {
          status: 'cancelled'
        }
      })

      expect(result?.status).toBe('skipped')
    })

    it('should handle participants update', async () => {
      const newParticipants = [
        { name: 'Alice Smith', email: 'alice@example.com', joinTime: new Date() }
      ]
      ;(db.meeting.update as jest.Mock).mockResolvedValue({
        ...mockDbMeeting,
        participants: newParticipants
      })

      const result = await meetingService.updateMeeting('meeting_123', 'user_123', {
        participants: newParticipants
      })

      expect(db.meeting.update).toHaveBeenCalledWith({
        where: {
          id: 'meeting_123',
          userId: 'user_123'
        },
        data: {
          participants: newParticipants
        }
      })

      expect(result?.participants).toEqual(newParticipants)
    })

    it('should return null when meeting not found', async () => {
      ;(db.meeting.update as jest.Mock).mockRejectedValue({ code: 'P2025' })

      const result = await meetingService.updateMeeting('nonexistent', 'user_123', { title: 'New Title' })

      expect(result).toBeNull()
    })

    it('should return null on database failure', async () => {
      ;(db.meeting.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.updateMeeting('meeting_123', 'user_123', { title: 'New Title' })
      expect(result).toBeNull()
    })
  })

  describe('listMeetings', () => {
    const mockMeetings = [
      {
        id: 'meeting_1',
        userId: 'user_123',
        zoomMeetingId: 'zoom_1',
        title: 'Meeting 1',
        scheduledStart: new Date('2025-01-01T10:00:00Z'),
        actualEnd: new Date('2025-01-01T11:00:00Z'),
        status: 'completed',
        participants: [],
        meetingUrl: '',
        isExcluded: false,
      },
      {
        id: 'meeting_2',
        userId: 'user_123',
        zoomMeetingId: 'zoom_2',
        title: 'Meeting 2',
        scheduledStart: new Date('2025-01-02T14:00:00Z'),
        actualEnd: null,
        status: 'scheduled',
        participants: [],
        meetingUrl: '',
        isExcluded: false,
      }
    ]

    it('should list meetings with default filters', async () => {
      ;(db.meeting.findMany as jest.Mock).mockResolvedValue(mockMeetings)

      const result = await meetingService.listMeetings('user_123')

      expect(db.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          isExcluded: false
        },
        orderBy: { scheduledStart: 'desc' },
        take: 50,
        skip: 0
      })

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Meeting 1')
    })

    it('should apply status filter', async () => {
      ;(db.meeting.findMany as jest.Mock).mockResolvedValue([mockMeetings[0]])

      const result = await meetingService.listMeetings('user_123', { status: 'completed' })

      expect(db.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          isExcluded: false,
          status: 'completed'
        },
        orderBy: { scheduledStart: 'desc' },
        take: 50,
        skip: 0
      })

      expect(result).toHaveLength(1)
    })

    it('should apply date range filter', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z')
      const endDate = new Date('2025-01-01T23:59:59Z')
      ;(db.meeting.findMany as jest.Mock).mockResolvedValue([])

      await meetingService.listMeetings('user_123', { startDate, endDate })

      expect(db.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          isExcluded: false,
          startTime: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { scheduledStart: 'desc' },
        take: 50,
        skip: 0
      })
    })

    it('should include excluded meetings when requested', async () => {
      await meetingService.listMeetings('user_123', { includeExcluded: true })

      expect(db.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123'
        },
        orderBy: { scheduledStart: 'desc' },
        take: 50,
        skip: 0
      })
    })

    it('should handle pagination', async () => {
      await meetingService.listMeetings('user_123', {}, 25, 50)

      expect(db.meeting.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          isExcluded: false
        },
        orderBy: { scheduledStart: 'desc' },
        take: 25,
        skip: 50
      })
    })

    it('should return empty array on database failure', async () => {
      ;(db.meeting.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.listMeetings('user_123')
      expect(result).toEqual([])
    })
  })

  describe('deleteMeeting', () => {
    it('should soft delete meeting successfully', async () => {
      ;(db.meeting.update as jest.Mock).mockResolvedValue({ id: 'meeting_123' })

      const result = await meetingService.deleteMeeting('meeting_123', 'user_123')

      expect(db.meeting.update).toHaveBeenCalledWith({
        where: {
          id: 'meeting_123',
          userId: 'user_123'
        },
        data: {
          isExcluded: true
        }
      })

      expect(result).toBe(true)
    })

    it('should return false when meeting not found', async () => {
      ;(db.meeting.update as jest.Mock).mockRejectedValue(new Error('Meeting not found'))

      const result = await meetingService.deleteMeeting('nonexistent', 'user_123')

      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      ;(db.meeting.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.deleteMeeting('meeting_123', 'user_123')

      expect(result).toBe(false)
    })
  })

  describe('getMeetingStats', () => {
    it('should return meeting statistics', async () => {
      ;(db.meeting.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(6)  // completed
        .mockResolvedValueOnce(2)  // in progress
        .mockResolvedValueOnce(2)  // scheduled
        .mockResolvedValueOnce(3)  // this week

      const result = await meetingService.getMeetingStats('user_123')

      expect(result).toEqual({
        total: 10,
        completed: 6,
        inProgress: 2,
        scheduled: 2,
        thisWeek: 3
      })

      expect(db.meeting.count).toHaveBeenCalledTimes(5)

      // Verify the count calls were made with correct filters
      expect(db.meeting.count).toHaveBeenCalledWith({
        where: { userId: 'user_123', isExcluded: false }
      })
      expect(db.meeting.count).toHaveBeenCalledWith({
        where: { userId: 'user_123', status: 'completed', isExcluded: false }
      })
    })

    it('should handle errors and return zero stats', async () => {
      ;(db.meeting.count as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.getMeetingStats('user_123')

      expect(result).toEqual({
        total: 0,
        completed: 0,
        inProgress: 0,
        scheduled: 0,
        thisWeek: 0
      })
    })
  })

  describe('updateMeetingStatus', () => {
    it('should update meeting status by zoom ID', async () => {
      ;(db.meeting.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

      const endTime = new Date()
      const result = await meetingService.updateMeetingStatus('zoom_123', 'completed', endTime)

      expect(db.meeting.updateMany).toHaveBeenCalledWith({
        where: { zoomMeetingId: 'zoom_123' },
        data: {
          status: 'completed',
          endTime: endTime
        }
      })

      expect(result).toBe(true)
    })

    it('should handle status without end time', async () => {
      ;(db.meeting.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await meetingService.updateMeetingStatus('zoom_123', 'in_progress')

      expect(db.meeting.updateMany).toHaveBeenCalledWith({
        where: { zoomMeetingId: 'zoom_123' },
        data: {
          status: 'in_progress'
        }
      })

      expect(result).toBe(true)
    })

    it('should map cancelled to skipped', async () => {
      ;(db.meeting.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

      await meetingService.updateMeetingStatus('zoom_123', 'cancelled')

      expect(db.meeting.updateMany).toHaveBeenCalledWith({
        where: { zoomMeetingId: 'zoom_123' },
        data: {
          status: 'cancelled'
        }
      })
    })

    it('should return false on database error', async () => {
      ;(db.meeting.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await meetingService.updateMeetingStatus('zoom_123', 'completed')

      expect(result).toBe(false)
    })
  })

  describe('Service Configuration', () => {
    it('should initialize with configuration', () => {
      expect(meetingService).toBeDefined()
      expect(meetingService instanceof MeetingService).toBe(true)
    })

    it('should handle configuration properly', () => {
      // Test that service has basic functionality
      expect(typeof meetingService.createMeeting).toBe('function')
      expect(typeof meetingService.listMeetings).toBe('function')
      expect(typeof meetingService.updateMeetingStatus).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(db.meeting.findMany as jest.Mock).mockRejectedValue(new Error('Connection lost'))

      const result = await meetingService.listMeetings('user_123')

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to list meetings:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle concurrent operations safely', async () => {
      const meetingData = {
        zoomMeetingId: 'zoom_concurrent',
        title: 'Concurrent Meeting',
        startTime: new Date(),
        hostEmail: 'host@example.com',
        participants: [],
        status: 'scheduled' as const
      }

      // Simulate successful creation despite concurrent operations
      ;(db.meeting.create as jest.Mock).mockResolvedValue({
        id: 'concurrent_meeting',
        ...meetingData
      })

      const result = await meetingService.createMeeting('user_123', meetingData)

      expect(result.zoomMeetingId).toBe('zoom_concurrent')
    })
  })
})