import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'skipped'

interface Meeting {
  id: string
  zoomMeetingId: string
  title: string
  scheduledStart: string
  actualStart?: string
  actualEnd?: string
  status: MeetingStatus
  participants: Array<{
    name: string
    email: string
  }>
  meetingUrl: string
  hasTranscript: boolean
  hasSummary: boolean
  actionItemsCount: number
  emailsCount: number
  createdAt: string
}

interface MeetingsResponse {
  meetings: Meeting[]
  total: number
  hasMore: boolean
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-yellow-100 text-yellow-800',
}

const statusLabels = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  skipped: 'Skipped',
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<MeetingStatus | 'all'>('all')

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filter !== 'all') {
        queryParams.set('status', filter)
      }

      const response = await fetch(`/api/meetings?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch meetings')
      }

      const data: MeetingsResponse = await response.json()
      setMeetings(data.meetings)
      setError(null)
    } catch (err) {
      setError('Failed to load meetings')
      console.error('Error fetching meetings:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (isSignedIn) {
      fetchMeetings()
    }
  }, [isSignedIn, fetchMeetings])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Meeting Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/settings" className="text-gray-600 hover:text-gray-900 font-medium">
                Settings
              </Link>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Meetings
          </button>
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setFilter(status as MeetingStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && meetings.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No meetings found</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all'
                ? 'You haven\'t connected any meetings yet. Connect your Zoom account to get started.'
                : `No meetings with status "${statusLabels[filter as MeetingStatus]}" found.`
              }
            </p>
          </div>
        )}

        {/* Meetings List */}
        {!loading && meetings.length > 0 && (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[meeting.status]}`}>
                          {statusLabels[meeting.status]}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">
                        Scheduled: {formatDate(meeting.scheduledStart)}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>👥 {meeting.participants.length} participants</span>
                        {meeting.hasTranscript && <span>📝 Transcript</span>}
                        {meeting.hasSummary && <span>📋 Summary</span>}
                        {meeting.actionItemsCount > 0 && (
                          <span>✅ {meeting.actionItemsCount} action items</span>
                        )}
                        {meeting.emailsCount > 0 && (
                          <span>✉️ {meeting.emailsCount} emails sent</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}