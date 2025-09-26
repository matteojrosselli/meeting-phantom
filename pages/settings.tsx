import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Integration {
  connected: boolean
  connectedAt?: string
  permissions: string[]
}

interface IntegrationStatus {
  zoom: Integration
  gmail: Integration
}

export default function Settings() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectingZoom, setConnectingZoom] = useState(false)
  const [connectingGmail, setConnectingGmail] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  useEffect(() => {
    if (isSignedIn) {
      fetchIntegrations()
    }
  }, [isSignedIn])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/integrations')
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }

      const data: IntegrationStatus = await response.json()
      setIntegrations(data)
      setError(null)
    } catch (err) {
      setError('Failed to load integration status')
      console.error('Error fetching integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectZoom = async () => {
    try {
      setConnectingZoom(true)
      const response = await fetch('/api/auth/zoom/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to initiate Zoom connection')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to connect to Zoom')
      console.error('Error connecting to Zoom:', err)
    } finally {
      setConnectingZoom(false)
    }
  }

  const connectGmail = async () => {
    try {
      setConnectingGmail(true)
      const response = await fetch('/api/auth/gmail/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to initiate Gmail connection')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to connect to Gmail')
      console.error('Error connecting to Gmail:', err)
    } finally {
      setConnectingGmail(false)
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

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'read:meetings': 'Read meetings',
      'create:webhook': 'Receive meeting events',
      'send:email': 'Send emails',
      'read:profile': 'Read profile information',
    }
    return labels[permission] || permission
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || 'User'}
              </p>
              <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
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

        {/* Integrations Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Integrations</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading integration status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Zoom Integration */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Zoom</h3>
                      <p className="text-gray-500">Connect to automatically join and process your Zoom meetings</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        integrations?.zoom.connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {integrations?.zoom.connected ? 'Connected' : 'Not Connected'}
                    </span>

                    {integrations?.zoom.connected ? (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to disconnect from Zoom?')) {
                            // TODO: Implement disconnect functionality
                            setError('Disconnect functionality will be implemented in Phase 3.6')
                          }
                        }}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={connectZoom}
                        disabled={connectingZoom}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {connectingZoom ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>

                {integrations?.zoom.connected && (
                  <div>
                    {integrations.zoom.connectedAt && (
                      <p className="text-sm text-gray-500 mb-3">
                        Connected on {formatDate(integrations.zoom.connectedAt)}
                      </p>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {integrations.zoom.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {getPermissionLabel(permission)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Gmail Integration */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Gmail</h3>
                      <p className="text-gray-500">Connect to send meeting summaries and action items via email</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        integrations?.gmail.connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {integrations?.gmail.connected ? 'Connected' : 'Not Connected'}
                    </span>

                    {integrations?.gmail.connected ? (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to disconnect from Gmail?')) {
                            // TODO: Implement disconnect functionality
                            setError('Disconnect functionality will be implemented in Phase 3.6')
                          }
                        }}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={connectGmail}
                        disabled={connectingGmail}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {connectingGmail ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>

                {integrations?.gmail.connected && (
                  <div>
                    {integrations.gmail.connectedAt && (
                      <p className="text-sm text-gray-500 mb-3">
                        Connected on {formatDate(integrations.gmail.connectedAt)}
                      </p>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {integrations.gmail.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {getPermissionLabel(permission)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Setup Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Setup Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-3 ${
                        integrations?.zoom.connected ? 'text-green-500' : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={integrations?.zoom.connected ? 'text-green-700' : 'text-gray-700'}>
                      Zoom connected for meeting access
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-3 ${
                        integrations?.gmail.connected ? 'text-green-500' : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={integrations?.gmail.connected ? 'text-green-700' : 'text-gray-700'}>
                      Gmail connected for email delivery
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong>{' '}
                    {!integrations?.zoom.connected && !integrations?.gmail.connected
                      ? 'Connect both Zoom and Gmail to start processing meetings automatically.'
                      : !integrations?.zoom.connected
                      ? 'Connect Zoom to enable automatic meeting joining and processing.'
                      : !integrations?.gmail.connected
                      ? 'Connect Gmail to enable email delivery of meeting summaries.'
                      : 'All integrations connected! Your meetings will be processed automatically.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Section (Placeholder for future features) */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">
              Meeting preferences and notification settings will be available in a future update.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}