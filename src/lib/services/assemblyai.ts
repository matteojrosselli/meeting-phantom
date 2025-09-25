import { TranscriptResult, TranscriptSegment, TranscriptSpeaker, ServiceConfig } from './types'

interface AssemblyAITranscriptResponse {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  utterances?: Array<{
    speaker: string
    text: string
    start: number
    end: number
    confidence: number
  }>
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
    speaker?: string
  }>
  audio_duration?: number
  language_code?: string
  error?: string
}

export class AssemblyAIService {
  private apiKey: string
  private baseUrl: string
  private useMock: boolean

  constructor(config: ServiceConfig) {
    this.apiKey = config.assemblyAI?.apiKey || ''
    this.baseUrl = config.assemblyAI?.baseUrl || 'https://api.assemblyai.com/v2'
    this.useMock = config.useMockServices || !this.apiKey
  }

  async submitTranscription(audioUrl: string): Promise<string> {
    if (this.useMock) {
      return this.mockSubmitTranscription(audioUrl)
    }

    const response = await fetch(`${this.baseUrl}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
        auto_highlights: true,
        sentiment_analysis: true,
        entity_detection: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`AssemblyAI submission failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.id
  }

  async getTranscriptionStatus(transcriptId: string): Promise<TranscriptResult> {
    if (this.useMock) {
      return this.mockGetTranscriptionStatus(transcriptId)
    }

    const response = await fetch(`${this.baseUrl}/transcript/${transcriptId}`, {
      headers: {
        'Authorization': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`AssemblyAI status check failed: ${response.statusText}`)
    }

    const data: AssemblyAITranscriptResponse = await response.json()
    return this.transformResponse(data)
  }

  async waitForCompletion(transcriptId: string, maxWaitMs: number = 300000): Promise<TranscriptResult> {
    const startTime = Date.now()
    const pollInterval = 5000 // 5 seconds

    while (Date.now() - startTime < maxWaitMs) {
      const result = await this.getTranscriptionStatus(transcriptId)

      if (result.status === 'completed' || result.status === 'failed') {
        return result
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error('Transcription timeout: Processing took too long')
  }

  private transformResponse(data: AssemblyAITranscriptResponse): TranscriptResult {
    const speakers: TranscriptSpeaker[] = []
    const segments: TranscriptSegment[] = []

    // Extract speakers and segments from utterances
    if (data.utterances) {
      const speakerMap = new Map<string, TranscriptSpeaker>()

      data.utterances.forEach((utterance, index) => {
        const speakerId = utterance.speaker || `Speaker ${index + 1}`

        if (!speakerMap.has(speakerId)) {
          speakerMap.set(speakerId, {
            id: speakerId,
            name: speakerId,
          })
        }

        segments.push({
          id: `segment-${index}`,
          text: utterance.text,
          startTime: utterance.start,
          endTime: utterance.end,
          speaker: speakerId,
          confidence: utterance.confidence,
        })
      })

      speakers.push(...Array.from(speakerMap.values()))
    }

    return {
      id: data.id,
      status: data.status === 'completed' ? 'completed' :
              data.status === 'error' ? 'failed' : 'processing',
      text: data.text,
      speakers,
      segments,
      confidence: this.calculateAverageConfidence(segments),
      duration: data.audio_duration ? Math.round(data.audio_duration / 1000) : undefined,
      wordCount: data.text ? data.text.split(/\s+/).length : undefined,
      language: data.language_code || 'en',
      error: data.error,
    }
  }

  private calculateAverageConfidence(segments: TranscriptSegment[]): number {
    if (segments.length === 0) return 0
    const total = segments.reduce((sum, seg) => sum + seg.confidence, 0)
    return total / segments.length
  }

  // Mock implementations for development
  private async mockSubmitTranscription(audioUrl: string): Promise<string> {
    console.log(`[MOCK] AssemblyAI: Submitting transcription for ${audioUrl}`)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return `mock-transcript-${Date.now()}`
  }

  private async mockGetTranscriptionStatus(transcriptId: string): Promise<TranscriptResult> {
    console.log(`[MOCK] AssemblyAI: Checking status for ${transcriptId}`)
    await new Promise(resolve => setTimeout(resolve, 200))

    // Simulate processing progression
    const createdTime = parseInt(transcriptId.split('-')[2] || '0')
    const elapsed = Date.now() - createdTime

    if (elapsed < 10000) { // First 10 seconds: processing
      return {
        id: transcriptId,
        status: 'processing',
        speakers: [],
        segments: [],
        language: 'en',
      }
    }

    // After 10 seconds: completed with mock data
    const speakers: TranscriptSpeaker[] = [
      { id: 'Speaker A', name: 'Meeting Host', email: 'host@example.com' },
      { id: 'Speaker B', name: 'Participant 1', email: 'participant1@example.com' },
      { id: 'Speaker C', name: 'Participant 2', email: 'participant2@example.com' },
    ]

    const segments: TranscriptSegment[] = [
      {
        id: 'seg-1',
        text: "Good morning everyone, thank you for joining today's meeting. Let's start with the project status update.",
        startTime: 0,
        endTime: 5000,
        speaker: 'Speaker A',
        confidence: 0.95,
      },
      {
        id: 'seg-2',
        text: "Thanks for having me. I'm happy to report that we've completed the initial phase of development and we're on track for the beta release next month.",
        startTime: 6000,
        endTime: 15000,
        speaker: 'Speaker B',
        confidence: 0.92,
      },
      {
        id: 'seg-3',
        text: "That's great news! What about the testing timeline? Do we have enough time for thorough QA?",
        startTime: 16000,
        endTime: 22000,
        speaker: 'Speaker C',
        confidence: 0.88,
      },
      {
        id: 'seg-4',
        text: "Yes, we've allocated two weeks for comprehensive testing. I'll coordinate with the QA team to ensure we cover all critical paths. We should also schedule user acceptance testing with key stakeholders.",
        startTime: 23000,
        endTime: 35000,
        speaker: 'Speaker B',
        confidence: 0.94,
      },
      {
        id: 'seg-5',
        text: "Perfect. Let's make sure to document any issues and have a contingency plan. I'll send out the testing schedule by Friday. Any other concerns or questions?",
        startTime: 36000,
        endTime: 46000,
        speaker: 'Speaker A',
        confidence: 0.93,
      },
    ]

    const fullText = segments.map(seg => seg.text).join(' ')

    return {
      id: transcriptId,
      status: 'completed',
      text: fullText,
      speakers,
      segments,
      confidence: 0.924,
      duration: 46,
      wordCount: fullText.split(/\s+/).length,
      language: 'en',
    }
  }
}