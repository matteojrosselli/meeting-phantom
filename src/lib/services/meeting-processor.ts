import { db } from '@/lib/db'
import { AssemblyAIService } from './assemblyai'
import { OpenAIService } from './openai'
import { GmailService } from './gmail'
import { ZoomService } from './zoom'
import { EmailTemplateService } from './email-templates'
import { ServiceConfig, ProcessingStatus, TranscriptResult, SummaryResult, ActionItem } from './types'

interface ProcessMeetingOptions {
  meetingId: string
  zoomMeetingId: string
  userTokens: {
    zoom: {
      accessToken: string
      refreshToken: string
    }
    gmail: {
      accessToken: string
      refreshToken: string
    }
  }
}

interface ProcessingContext {
  meetingId: string
  zoomMeetingId: string
  userTokens: ProcessMeetingOptions['userTokens']
  status: ProcessingStatus
  transcript?: TranscriptResult
  summary?: SummaryResult
  actionItems?: ActionItem[]
}

export class MeetingProcessorService {
  private assemblyAI: AssemblyAIService
  private openAI: OpenAIService
  private gmail: GmailService
  private zoom: ZoomService
  private emailTemplates: EmailTemplateService

  constructor(config: ServiceConfig) {
    this.assemblyAI = new AssemblyAIService(config)
    this.openAI = new OpenAIService(config)
    this.gmail = new GmailService(config)
    this.zoom = new ZoomService(config)
    this.emailTemplates = new EmailTemplateService()
  }

  async processMeeting(options: ProcessMeetingOptions): Promise<void> {
    const context: ProcessingContext = {
      ...options,
      status: {
        step: 'downloading',
        progress: 0,
        message: 'Starting meeting processing...'
      }
    }

    try {
      await this.updateMeetingStatus(context.meetingId, 'in_progress')

      // Step 1: Download recordings from Zoom
      await this.downloadRecordings(context)

      // Step 2: Generate transcript via AssemblyAI
      await this.generateTranscript(context)

      // Step 3: Generate summary and extract action items via OpenAI
      await this.generateSummaryAndActionItems(context)

      // Step 4: Send email summaries
      await this.sendEmailSummaries(context)

      // Step 5: Mark as completed
      await this.completeProcessing(context)

    } catch (error) {
      await this.handleProcessingError(context, error)
    }
  }

  private async downloadRecordings(context: ProcessingContext): Promise<void> {
    context.status = {
      step: 'downloading',
      progress: 10,
      message: 'Downloading meeting recordings from Zoom...'
    }

    try {
      const recordings = await this.zoom.getMeetingRecordings(
        context.zoomMeetingId,
        context.userTokens.zoom
      )

      if (recordings.length === 0) {
        throw new Error('No audio recordings found for this meeting')
      }

      // For now, just validate recordings exist
      // In a full implementation, we would download and store the audio
      console.log(`Found ${recordings.length} recording(s) for meeting ${context.zoomMeetingId}`)

      context.status.progress = 20
    } catch (error) {
      throw new Error(`Failed to download recordings: ${error}`)
    }
  }

  private async generateTranscript(context: ProcessingContext): Promise<void> {
    context.status = {
      step: 'transcribing',
      progress: 30,
      message: 'Generating transcript with AssemblyAI...'
    }

    try {
      // In a real implementation, we would submit the downloaded audio
      // For now, we'll use a mock audio URL
      const mockAudioUrl = `https://zoom-recordings.example.com/${context.zoomMeetingId}/audio.m4a`

      const transcriptId = await this.assemblyAI.submitTranscription(mockAudioUrl)

      context.status = {
        step: 'transcribing',
        progress: 40,
        message: 'Waiting for transcription to complete...'
      }

      context.transcript = await this.assemblyAI.waitForCompletion(transcriptId)

      if (context.transcript.status !== 'completed') {
        throw new Error(`Transcription failed: ${context.transcript.error}`)
      }

      // Save transcript to database
      await db.transcript.create({
        data: {
          meetingId: context.meetingId,
          assemblyAIId: transcriptId,
          status: 'completed',
          language: context.transcript.language,
          speakers: context.transcript.speakers as any,
          segments: context.transcript.segments as any,
          confidence: context.transcript.confidence,
          duration: context.transcript.duration,
          wordCount: context.transcript.wordCount,
        },
      })

      context.status.progress = 60
    } catch (error) {
      throw new Error(`Failed to generate transcript: ${error}`)
    }
  }

  private async generateSummaryAndActionItems(context: ProcessingContext): Promise<void> {
    if (!context.transcript) {
      throw new Error('No transcript available for summarization')
    }

    context.status = {
      step: 'summarizing',
      progress: 70,
      message: 'Generating meeting summary with OpenAI...'
    }

    try {
      // Get meeting details
      const meeting = await db.meeting.findUnique({
        where: { id: context.meetingId }
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      // Generate summary
      context.summary = await this.openAI.generateSummary(context.transcript, meeting.title)

      // Extract action items
      context.status = {
        step: 'extracting',
        progress: 80,
        message: 'Extracting action items...'
      }

      context.actionItems = await this.openAI.extractActionItems(context.transcript)

      // Save summary to database
      await db.summary.create({
        data: {
          meetingId: context.meetingId,
          title: context.summary.title,
          overview: context.summary.overview,
          keyPoints: context.summary.keyPoints,
          decisions: context.summary.decisions,
          nextSteps: context.summary.nextSteps,
          attendees: context.summary.attendees,
          aiModel: 'gpt-4-turbo-preview',
          generatedAt: new Date(),
        },
      })

      // Save action items to database
      for (const actionItem of context.actionItems) {
        await db.actionItem.create({
          data: {
            meetingId: context.meetingId,
            text: actionItem.text,
            assignee: actionItem.assignee,
            dueDate: actionItem.dueDate,
            priority: actionItem.priority,
            status: 'pending',
            confidence: actionItem.confidence,
            sourceSegment: actionItem.sourceSegment,
          },
        })
      }

      context.status.progress = 85
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error}`)
    }
  }

  private async sendEmailSummaries(context: ProcessingContext): Promise<void> {
    if (!context.summary || !context.actionItems) {
      throw new Error('No summary or action items available for email')
    }

    context.status = {
      step: 'emailing',
      progress: 90,
      message: 'Sending email summaries...'
    }

    try {
      // Get meeting and user details
      const meeting = await db.meeting.findUnique({
        where: { id: context.meetingId },
        include: { user: true }
      })

      if (!meeting || !meeting.user) {
        throw new Error('Meeting or user not found')
      }

      // Extract participant emails from meeting data
      const participants = Array.isArray(meeting.participants) ? meeting.participants : []
      const recipientEmails = participants
        .filter((p: any) => p.email)
        .map((p: any) => p.email)

      if (recipientEmails.length === 0) {
        console.log('No recipient emails found, skipping email sending')
        return
      }

      // Generate email template
      const emailTemplate = this.emailTemplates.generateMeetingSummaryEmail({
        meeting: {
          title: meeting.title,
          date: meeting.scheduledStart,
          duration: context.transcript?.duration,
          attendees: context.summary.attendees,
          zoomMeetingId: meeting.zoomMeetingId,
        },
        summary: context.summary,
        actionItems: context.actionItems,
        senderName: meeting.user.name,
      })

      // Send emails to all participants
      for (const email of recipientEmails) {
        try {
          const result = await this.gmail.sendEmail(
            {
              to: [email],
              subject: emailTemplate.subject,
              htmlBody: emailTemplate.html,
              textBody: emailTemplate.text,
            },
            context.userTokens.gmail
          )

          // Record email in database
          await db.email.create({
            data: {
              meetingId: context.meetingId,
              recipientEmail: email,
              recipientName: (participants as any[]).find((p: any) => p.email === email)?.name || email,
              subject: emailTemplate.subject,
              status: result.status === 'sent' ? 'sent' : 'failed',
              gmailMessageId: result.messageId,
              sentAt: result.status === 'sent' ? new Date() : null,
              errorMessage: result.error,
            },
          })

        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError)

          // Record failed email
          await db.email.create({
            data: {
              meetingId: context.meetingId,
              recipientEmail: email,
              recipientName: (participants as any[]).find((p: any) => p.email === email)?.name || email,
              subject: emailTemplate.subject,
              status: 'failed',
              errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
            },
          })
        }
      }

      context.status.progress = 95
    } catch (error) {
      throw new Error(`Failed to send emails: ${error}`)
    }
  }

  private async completeProcessing(context: ProcessingContext): Promise<void> {
    context.status = {
      step: 'completed',
      progress: 100,
      message: 'Meeting processing completed successfully'
    }

    await this.updateMeetingStatus(context.meetingId, 'completed')

    console.log(`Meeting ${context.meetingId} processing completed successfully`)
  }

  private async handleProcessingError(context: ProcessingContext, error: any): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    context.status = {
      step: 'failed',
      progress: 0,
      message: errorMessage,
      error: errorMessage
    }

    await this.updateMeetingStatus(context.meetingId, 'failed')

    console.error(`Meeting ${context.meetingId} processing failed:`, errorMessage)

    // In a production system, you might want to:
    // - Send error notifications
    // - Queue for retry
    // - Log to monitoring system
  }

  private async updateMeetingStatus(meetingId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'skipped'): Promise<void> {
    await db.meeting.update({
      where: { id: meetingId },
      data: { status },
    })
  }

  async getProcessingStatus(meetingId: string): Promise<ProcessingStatus | null> {
    // This would typically be stored in a cache like Redis
    // For now, we can infer status from the database
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcript: true,
        summary: true,
      },
    })

    if (!meeting) return null

    switch (meeting.status) {
      case 'scheduled':
        return {
          step: 'downloading',
          progress: 0,
          message: 'Waiting to start processing...'
        }
      case 'in_progress':
        if (!meeting.transcript) {
          return {
            step: 'transcribing',
            progress: 30,
            message: 'Generating transcript...'
          }
        } else if (!meeting.summary) {
          return {
            step: 'summarizing',
            progress: 70,
            message: 'Generating summary...'
          }
        } else {
          return {
            step: 'emailing',
            progress: 90,
            message: 'Sending email summaries...'
          }
        }
      case 'completed':
        return {
          step: 'completed',
          progress: 100,
          message: 'Processing completed successfully'
        }
      case 'failed':
        return {
          step: 'failed',
          progress: 0,
          message: 'Processing failed',
          error: 'An error occurred during processing'
        }
      default:
        return null
    }
  }
}