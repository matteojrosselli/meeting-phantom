// Shared types for all services
export interface TranscriptSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  speaker: string
  confidence: number
}

export interface TranscriptSpeaker {
  id: string
  name: string
  email?: string
}

export interface TranscriptResult {
  id: string
  status: 'processing' | 'completed' | 'failed'
  text?: string
  speakers: TranscriptSpeaker[]
  segments: TranscriptSegment[]
  confidence?: number
  duration?: number
  wordCount?: number
  language: string
  error?: string
}

export interface SummaryResult {
  title: string
  overview: string
  keyPoints: string[]
  decisions: string[]
  nextSteps: string[]
  attendees: string[]
}

export interface ActionItem {
  text: string
  assignee?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  confidence: number
  sourceSegment: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface MeetingRecording {
  id: string
  downloadUrl: string
  fileType: string
  fileSize: number
  duration: number
}

export interface ServiceConfig {
  useMockServices: boolean
  assemblyAI?: {
    apiKey: string
    baseUrl?: string
  }
  openAI?: {
    apiKey: string
    model?: string
    baseUrl?: string
  }
  gmail?: {
    clientId: string
    clientSecret: string
  }
  zoom?: {
    clientId: string
    clientSecret: string
  }
}

export interface ProcessingStatus {
  step: 'downloading' | 'transcribing' | 'summarizing' | 'extracting' | 'emailing' | 'completed' | 'failed'
  progress: number
  message: string
  error?: string
}