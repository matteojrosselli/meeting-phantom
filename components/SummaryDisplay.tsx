import { useState } from 'react'

interface SummaryDisplayProps {
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

export default function SummaryDisplay({
  title,
  overview,
  keyPoints,
  decisions,
  nextSteps,
  attendees,
  aiModel,
  generatedAt,
  createdAt,
}: SummaryDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [copied, setCopied] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyToClipboard = async () => {
    const summaryText = [
      `# ${title}`,
      `Generated on ${formatDate(generatedAt)}`,
      '',
      '## Overview',
      overview,
      '',
      keyPoints.length > 0 && '## Key Points',
      ...keyPoints.map(point => `• ${point}`),
      '',
      decisions.length > 0 && '## Decisions Made',
      ...decisions.map(decision => `• ${decision}`),
      '',
      nextSteps.length > 0 && '## Next Steps',
      ...nextSteps.map(step => `• ${step}`),
      '',
      attendees.length > 0 && '## Attendees',
      attendees.join(', '),
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy summary:', err)
    }
  }

  const downloadSummary = () => {
    const summaryText = [
      `# ${title}`,
      `Generated on ${formatDate(generatedAt)}`,
      `AI Model: ${aiModel}`,
      '',
      '## Overview',
      overview,
      '',
      keyPoints.length > 0 && '## Key Points',
      ...keyPoints.map(point => `• ${point}`),
      '',
      decisions.length > 0 && '## Decisions Made',
      ...decisions.map(decision => `• ${decision}`),
      '',
      nextSteps.length > 0 && '## Next Steps',
      ...nextSteps.map(step => `• ${step}`),
      '',
      attendees.length > 0 && '## Attendees',
      attendees.join(', '),
    ].filter(Boolean).join('\n')

    const blob = new Blob([summaryText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sections = [
    { id: 'overview', name: 'Overview', count: 1 },
    { id: 'keyPoints', name: 'Key Points', count: keyPoints.length },
    { id: 'decisions', name: 'Decisions', count: decisions.length },
    { id: 'nextSteps', name: 'Next Steps', count: nextSteps.length },
    { id: 'attendees', name: 'Attendees', count: attendees.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Summary</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🤖 {aiModel}</span>
              <span>📅 Generated {formatDate(generatedAt)}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            <button
              onClick={downloadSummary}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {sections
            .filter(section => section.count > 0 || section.id === 'overview')
            .map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {section.name}
                {section.count > 0 && section.id !== 'overview' && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {section.count}
                  </span>
                )}
              </button>
            ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeSection === 'overview' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Overview</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{overview}</p>
            </div>
          </div>
        )}

        {activeSection === 'keyPoints' && keyPoints.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Points</h3>
            <ul className="space-y-3">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'decisions' && decisions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Decisions Made</h3>
            <ul className="space-y-3">
              {decisions.map((decision, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{decision}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'nextSteps' && nextSteps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'attendees' && attendees.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Attendees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {attendees.map((attendee, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                    {attendee.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="text-gray-900 font-medium">{attendee}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty states for sections with no content */}
        {activeSection === 'keyPoints' && keyPoints.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Key Points</h3>
            <p className="text-gray-500">No key points were identified in this meeting.</p>
          </div>
        )}

        {activeSection === 'decisions' && decisions.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Decisions</h3>
            <p className="text-gray-500">No decisions were identified in this meeting.</p>
          </div>
        )}

        {activeSection === 'nextSteps' && nextSteps.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Next Steps</h3>
            <p className="text-gray-500">No next steps were identified in this meeting.</p>
          </div>
        )}

        {activeSection === 'attendees' && attendees.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendees Listed</h3>
            <p className="text-gray-500">No attendee information was captured for this meeting.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          Summary generated using {aiModel} on {formatDate(generatedAt)}
        </p>
      </div>
    </div>
  )
}