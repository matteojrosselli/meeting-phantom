import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MeetingParticipant {
  name: string
  email: string
  joinTime?: string
  leaveTime?: string
}

interface Transcript {
  id: string
  assemblyAIId: string
  status: string
  language: string
  speakers: any[]
  segments: any[]
  confidence: number
  duration: number
  wordCount: number
  createdAt: string
  updatedAt: string
}

interface Summary {
  id: string
  title: string
  overview: string
  keyPoints: string[]
  decisions: string[]
  nextSteps: string[]
  attendees: string[]
  aiModel: string
  generatedAt: string
  createdAt: string
}

interface ActionItem {
  id: string
  text: string
  assignee?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  confidence: number
  sourceSegment?: string
  createdAt: string
}

interface Email {
  id: string
  recipientEmail: string
  recipientName: string
  subject: string
  status: string
  sentAt?: string
  errorMessage?: string
  retryCount: number
  createdAt: string
}

interface MeetingDetails {
  id: string
  zoomMeetingId: string
  title: string
  scheduledStart: string
  actualStart?: string
  actualEnd?: string
  status: string
  participants: MeetingParticipant[]
  meetingUrl: string
  isExcluded: boolean
  botJoined: boolean
  createdAt: string
  transcript?: Transcript
  summary?: Summary
  actionItems: ActionItem[]
  recentEmails: Email[]
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-yellow-100 text-yellow-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export default function MeetingDetail() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const { id } = router.query
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'summary' | 'actions'>('overview')

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  useEffect(() => {
    if (isSignedIn && id && typeof id === 'string') {
      fetchMeeting(id)
    }
  }, [isSignedIn, id])

  const fetchMeeting = async (meetingId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/meetings/${meetingId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Meeting not found')
        } else {
          setError('Failed to load meeting details')
        }
        return
      }

      const data: MeetingDetails = await response.json()
      setMeeting(data)
      setError(null)
    } catch (err) {
      setError('Failed to load meeting details')
      console.error('Error fetching meeting:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return `${duration} minutes`
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  ← Back to Dashboard
                </Link>
              </div>
              <UserButton />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading meeting details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  ← Back to Dashboard
                </Link>
              </div>
              <UserButton />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Meeting Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[meeting.status as keyof typeof statusColors]}`}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </span>
                <span className="text-gray-500">Zoom Meeting ID: {meeting.zoomMeetingId}</span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Scheduled: {formatDate(meeting.scheduledStart)}</p>
              {meeting.actualStart && meeting.actualEnd && (
                <p>Duration: {formatDuration(meeting.actualStart, meeting.actualEnd)}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Participants</h3>
              <p className="text-lg font-semibold">{meeting.participants.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Action Items</h3>
              <p className="text-lg font-semibold">{meeting.actionItems.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Emails Sent</h3>
              <p className="text-lg font-semibold">{meeting.recentEmails.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'transcript', name: 'Transcript', disabled: !meeting.transcript },
                { id: 'summary', name: 'Summary', disabled: !meeting.summary },
                { id: 'actions', name: 'Action Items' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}
                  disabled={tab.disabled}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Participants</h3>
                  <div className="space-y-2">
                    {meeting.participants.map((participant, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-gray-500">{participant.email}</p>
                        </div>
                        {participant.joinTime && (
                          <div className="text-sm text-gray-500">
                            <p>Joined: {formatDate(participant.joinTime)}</p>
                            {participant.leaveTime && (
                              <p>Left: {formatDate(participant.leaveTime)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Meeting Info</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Meeting URL</p>
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {meeting.meetingUrl}
                      </a>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Bot Status</p>
                      <p className={`font-medium ${meeting.botJoined ? 'text-green-600' : 'text-red-600'}`}>
                        {meeting.botJoined ? 'Bot Joined' : 'Bot Not Joined'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transcript' && meeting.transcript && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Transcript</h3>
                  <div className="text-sm text-gray-500">
                    <span>Confidence: {Math.round(meeting.transcript.confidence * 100)}%</span>
                    <span className="mx-2">•</span>
                    <span>{meeting.transcript.wordCount} words</span>
                  </div>
                </div>

                {meeting.transcript.status === 'completed' ? (
                  <div className="space-y-4">
                    {meeting.transcript.segments && meeting.transcript.segments.length > 0 ? (
                      meeting.transcript.segments.map((segment: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {segment.speaker || 'Unknown Speaker'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {segment.start && segment.end &&
                                `${Math.floor(segment.start / 1000)}s - ${Math.floor(segment.end / 1000)}s`
                              }
                            </span>
                          </div>
                          <p className="text-gray-900">{segment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No transcript segments available.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Transcript processing...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && meeting.summary && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Overview</h3>
                  <p className="text-gray-700">{meeting.summary.overview}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {meeting.summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                {meeting.summary.decisions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Decisions</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {meeting.summary.decisions.map((decision, index) => (
                        <li key={index}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {meeting.summary.nextSteps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Next Steps</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {meeting.summary.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Action Items</h3>
                {meeting.actionItems.length > 0 ? (
                  <div className="space-y-3">
                    {meeting.actionItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={item.status === 'completed'}
                              readOnly
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className={`font-medium ${
                              item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {item.text}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                          <div>
                            {item.assignee && <span>Assigned to: {item.assignee}</span>}
                          </div>
                          <div className="flex space-x-4">
                            {item.dueDate && (
                              <span>Due: {formatDate(item.dueDate)}</span>
                            )}
                            <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No action items identified for this meeting.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Emails */}
        {meeting.recentEmails.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Email Deliveries</h3>
            <div className="space-y-3">
              {meeting.recentEmails.map((email) => (
                <div key={email.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{email.recipientName}</p>
                    <p className="text-sm text-gray-500">{email.recipientEmail}</p>
                    <p className="text-sm text-gray-600">{email.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      email.status === 'sent' ? 'bg-green-100 text-green-800' :
                      email.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {email.status}
                    </span>
                    {email.sentAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(email.sentAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}