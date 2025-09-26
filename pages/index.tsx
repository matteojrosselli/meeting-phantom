import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            Meeting Phantom Ultra
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Meeting Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automatically join your Zoom meetings, transcribe conversations in real-time,
            and send intelligent summaries with action items to all participants.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Join Meetings</h3>
              <p className="text-gray-600">Seamlessly join your scheduled Zoom meetings without manual intervention</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Transcription</h3>
              <p className="text-gray-600">High-quality transcription with speaker identification powered by AssemblyAI</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
              <p className="text-gray-600">AI-powered summaries with action items sent directly to participants</p>
            </div>
          </div>

          <SignedOut>
            <div className="space-y-4">
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
                  Get Started
                </button>
              </SignInButton>
              <p className="text-sm text-gray-500">
                Free tier available • Connect with Zoom & Gmail
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">Welcome back! Redirecting to your dashboard...</p>
            </div>
          </SignedIn>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 mt-20">
        <div className="text-center text-gray-500">
          <p>&copy; 2025 Meeting Phantom Ultra. Built for seamless meeting management.</p>
        </div>
      </footer>
    </div>
  )
}