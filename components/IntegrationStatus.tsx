import { useEffect, useState } from 'react'

interface Integration {
  connected: boolean
  connectedAt?: string
  permissions: string[]
}

interface IntegrationStatusData {
  zoom: Integration
  gmail: Integration
}

interface IntegrationStatusProps {
  compact?: boolean
  showActions?: boolean
  onConnect?: (service: 'zoom' | 'gmail') => void
  refreshTrigger?: number
}

export default function IntegrationStatus({
  compact = false,
  showActions = false,
  onConnect,
  refreshTrigger = 0,
}: IntegrationStatusProps) {
  const [integrations, setIntegrations] = useState<IntegrationStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [refreshTrigger])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/integrations')
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }

      const data: IntegrationStatusData = await response.json()
      setIntegrations(data)
      setError(null)
    } catch (err) {
      setError('Failed to load integration status')
      console.error('Error fetching integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSetupProgress = () => {
    if (!integrations) return 0
    const zoomConnected = integrations.zoom.connected
    const gmailConnected = integrations.gmail.connected
    return (zoomConnected ? 50 : 0) + (gmailConnected ? 50 : 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white rounded-lg border border-gray-200`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !integrations) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-red-50 border border-red-200 rounded-lg`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  const progress = getSetupProgress()
  const allConnected = integrations.zoom.connected && integrations.gmail.connected

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${allConnected ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Integrations {allConnected ? 'Complete' : progress > 0 ? 'Partial' : 'Not Setup'}
              </p>
              <p className="text-xs text-gray-500">
                {progress}% setup complete
              </p>
            </div>
          </div>

          <div className="flex space-x-1">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              integrations.zoom.connected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              integrations.gmail.connected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Integration Status</h3>
            <p className="text-sm text-gray-500">
              {progress}% complete • {allConnected ? 'Ready for meetings' : 'Setup required'}
            </p>
          </div>

          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            allConnected
              ? 'bg-green-100 text-green-800'
              : progress > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {allConnected ? 'Complete' : progress > 0 ? 'In Progress' : 'Not Started'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Individual Integration Status */}
      <div className="space-y-3">
        {/* Zoom Integration */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Zoom</h4>
                <p className="text-xs text-gray-500">Meeting access and processing</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 ${
                integrations.zoom.connected ? 'text-green-600' : 'text-gray-400'
              }`}>
                {integrations.zoom.connected ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Connected</span>
                    {integrations.zoom.connectedAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(integrations.zoom.connectedAt)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Not Connected</span>
                  </>
                )}
              </div>

              {showActions && !integrations.zoom.connected && (
                <button
                  onClick={() => onConnect?.('zoom')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {integrations.zoom.connected && integrations.zoom.permissions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {integrations.zoom.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                  >
                    {permission === 'read:meetings' ? '📅 Read Meetings' :
                     permission === 'create:webhook' ? '🔗 Webhooks' :
                     permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gmail Integration */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Gmail</h4>
                <p className="text-xs text-gray-500">Email summary delivery</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 ${
                integrations.gmail.connected ? 'text-green-600' : 'text-gray-400'
              }`}>
                {integrations.gmail.connected ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Connected</span>
                    {integrations.gmail.connectedAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(integrations.gmail.connectedAt)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Not Connected</span>
                  </>
                )}
              </div>

              {showActions && !integrations.gmail.connected && (
                <button
                  onClick={() => onConnect?.('gmail')}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {integrations.gmail.connected && integrations.gmail.permissions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {integrations.gmail.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded"
                  >
                    {permission === 'send:email' ? '📧 Send Emails' :
                     permission === 'read:profile' ? '👤 Profile Info' :
                     permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg ${
        allConnected
          ? 'bg-green-50 border border-green-200'
          : progress > 0
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`mt-0.5 ${
            allConnected ? 'text-green-500' : progress > 0 ? 'text-yellow-500' : 'text-gray-400'
          }`}>
            {allConnected ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : progress > 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <div>
            <p className={`text-sm font-medium ${
              allConnected ? 'text-green-800' : progress > 0 ? 'text-yellow-800' : 'text-gray-700'
            }`}>
              {allConnected
                ? 'All integrations connected!'
                : progress > 0
                ? 'Additional setup required'
                : 'Setup required to start processing meetings'
              }
            </p>
            <p className={`text-xs mt-1 ${
              allConnected ? 'text-green-600' : progress > 0 ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {allConnected
                ? 'Meeting Phantom Ultra is ready to process your meetings automatically.'
                : !integrations.zoom.connected && !integrations.gmail.connected
                ? 'Connect both Zoom and Gmail to enable automatic meeting processing.'
                : !integrations.zoom.connected
                ? 'Connect Zoom to enable meeting access and processing.'
                : 'Connect Gmail to enable email delivery of meeting summaries.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}