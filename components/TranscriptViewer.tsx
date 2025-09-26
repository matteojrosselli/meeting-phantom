import { useState, useRef, useEffect } from 'react'

interface TranscriptSegment {
  text: string
  speaker?: string
  start?: number
  end?: number
  confidence?: number
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  speakers?: string[]
  confidence: number
  wordCount: number
  duration: number
  status: string
  language?: string
}

export default function TranscriptViewer({
  segments,
  speakers = [],
  confidence,
  wordCount,
  duration,
  status,
  language = 'en-US',
}: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all')
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set())
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])

  // Filter segments based on search and speaker
  const filteredSegments = segments.filter((segment, index) => {
    const matchesSearch = !searchTerm ||
      segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.speaker && segment.speaker.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSpeaker = selectedSpeaker === 'all' || segment.speaker === selectedSpeaker

    return matchesSearch && matchesSpeaker
  })

  // Highlight search terms
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get speaker color
  const getSpeakerColor = (speaker: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
    ]

    const speakerIndex = speakers.indexOf(speaker)
    return colors[speakerIndex % colors.length] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Toggle segment expansion for long texts
  const toggleSegmentExpansion = (index: number) => {
    const newExpanded = new Set(expandedSegments)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSegments(newExpanded)
  }

  // Download transcript
  const downloadTranscript = () => {
    const transcript = segments
      .map((segment, index) => {
        const timeStamp = segment.start ? `[${formatTime(segment.start / 1000)}] ` : ''
        const speaker = segment.speaker ? `${segment.speaker}: ` : 'Speaker: '
        return `${timeStamp}${speaker}${segment.text}`
      })
      .join('\n\n')

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (status !== 'completed') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Transcript</h3>
        <p className="text-gray-500">
          {status === 'processing'
            ? 'AI is transcribing your meeting audio...'
            : status === 'uploading'
            ? 'Uploading audio for processing...'
            : 'Preparing transcript...'}
        </p>
      </div>
    )
  }

  if (!segments || segments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
        <p className="text-gray-500">
          The transcript could not be generated for this meeting.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Transcript</h2>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>📊 {Math.round(confidence * 100)}% confidence</span>
              <span>📝 {wordCount.toLocaleString()} words</span>
              <span>⏱️ {formatTime(duration / 1000)}</span>
              {speakers.length > 0 && (
                <span>👥 {speakers.length} speaker{speakers.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          <button
            onClick={downloadTranscript}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Speaker Filter */}
        {speakers.length > 0 && (
          <div className="sm:w-48">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Speakers</option>
              {speakers.map((speaker) => (
                <option key={speaker} value={speaker}>
                  {speaker}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredSegments.length} of {segments.length} segment{segments.length !== 1 ? 's' : ''}
        {searchTerm && (
          <span> matching "{searchTerm}"</span>
        )}
        {selectedSpeaker !== 'all' && (
          <span> from {selectedSpeaker}</span>
        )}
      </div>

      {/* Transcript Segments */}
      <div className="space-y-4">
        {filteredSegments.map((segment, index) => {
          const originalIndex = segments.indexOf(segment)
          const isExpanded = expandedSegments.has(originalIndex)
          const shouldTruncate = segment.text.length > 300
          const displayText = shouldTruncate && !isExpanded
            ? segment.text.substring(0, 300) + '...'
            : segment.text

          return (
            <div
              key={originalIndex}
              ref={(el) => segmentRefs.current[originalIndex] = el}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {segment.speaker && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSpeakerColor(segment.speaker)}`}>
                      {segment.speaker}
                    </span>
                  )}
                  {segment.start && (
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(segment.start / 1000)}
                    </span>
                  )}
                  {segment.confidence && (
                    <span className="text-xs text-gray-400">
                      {Math.round(segment.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-gray-900 leading-relaxed">
                {highlightText(displayText, searchTerm)}
              </div>

              {shouldTruncate && (
                <button
                  onClick={() => toggleSegmentExpansion(originalIndex)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredSegments.length === 0 && (searchTerm || selectedSpeaker !== 'all') && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or speaker filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedSpeaker('all')
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}