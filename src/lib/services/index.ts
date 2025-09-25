// Service exports and configuration
export * from './types'
export * from './user-service'
export * from './meeting-service'
export * from './assemblyai'
export * from './openai'
export * from './gmail'
export * from './zoom'
export * from './email-templates'
export * from './meeting-processor'

import { ServiceConfig } from './types'

// Default service configuration
export const createServiceConfig = (): ServiceConfig => ({
  useMockServices: process.env.NODE_ENV === 'development' || process.env.USE_MOCK_SERVICES === 'true',
  assemblyAI: {
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
    baseUrl: process.env.ASSEMBLYAI_BASE_URL || 'https://api.assemblyai.com/v2',
  },
  openAI: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  gmail: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID || '',
    clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
  },
})

// Service factory functions for dependency injection
export const createServices = (config?: ServiceConfig) => {
  const serviceConfig = config || createServiceConfig()

  return {
    config: serviceConfig,
    user: new (require('./user-service').UserService)(serviceConfig),
    meeting: new (require('./meeting-service').MeetingService)(serviceConfig),
    assemblyAI: new (require('./assemblyai').AssemblyAIService)(serviceConfig),
    openAI: new (require('./openai').OpenAIService)(serviceConfig),
    gmail: new (require('./gmail').GmailService)(serviceConfig),
    zoom: new (require('./zoom').ZoomService)(serviceConfig),
    emailTemplates: new (require('./email-templates').EmailTemplateService)(),
    meetingProcessor: new (require('./meeting-processor').MeetingProcessorService)(serviceConfig),
  }
}