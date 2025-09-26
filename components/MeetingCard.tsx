import Link from 'next/link'

type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'skipped'

interface MeetingParticipant {
  name: string
  email: string
}

interface MeetingCardProps {
  id: string
  zoomMeetingId: string
  title: string
  scheduledStart: string
  actualStart?: string
  actualEnd?: string
  status: MeetingStatus
  participants: MeetingParticipant[]
  hasTranscript: boolean
  hasSummary: boolean
  actionItemsCount: number
  emailsCount: number
  createdAt: string
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

export default function MeetingCard({
  id,
  zoomMeetingId,
  title,
  scheduledStart,
  actualStart,
  actualEnd,
  status,
  participants,
  hasTranscript,
  hasSummary,
  actionItemsCount,
  emailsCount,
  createdAt,
}: MeetingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDuration = () => {
    if (!actualStart || !actualEnd) return null
    const start = new Date(actualStart)
    const end = new Date(actualEnd)
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return `${duration}m`
  }

  return (
    <Link href={`/meetings/${id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Meeting Title and Status */}
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]} flex-shrink-0`}>
                {statusLabels[status]}
              </span>
            </div>

            {/* Meeting Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Scheduled:</span> {formatDate(scheduledStart)}
                </p>
                {getDuration() && (
                  <p className="text-gray-500 text-sm">
                    Duration: {getDuration()}
                  </p>
                )}
              </div>

              {actualStart && actualStart !== scheduledStart && (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Started:</span> {formatDate(actualStart)}
                </p>
              )}

              <p className="text-gray-500 text-sm">
                Meeting ID: {zoomMeetingId}
              </p>
            </div>

            {/* Participants and Features */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              </div>

              {hasTranscript && (
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Transcript</span>
                </div>
              )}

              {hasSummary && (
                <div className="flex items-center text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Summary</span>
                </div>
              )}

              {actionItemsCount > 0 && (
                <div className="flex items-center text-purple-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{actionItemsCount} action item{actionItemsCount !== 1 ? 's' : ''}</span>
                </div>
              )}

              {emailsCount > 0 && (
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{emailsCount} email{emailsCount !== 1 ? 's' : ''} sent</span>
                </div>
              )}
            </div>

            {/* Processing Status */}
            {status === 'in_progress' && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  <span className="text-sm text-green-700">Processing meeting...</span>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-700">Processing failed</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Arrow */}
          <div className="ml-4 flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}