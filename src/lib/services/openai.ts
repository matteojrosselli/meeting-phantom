import { SummaryResult, ActionItem, ServiceConfig, TranscriptResult } from './types'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
}

export class OpenAIService {
  private apiKey: string
  private model: string
  private baseUrl: string
  private useMock: boolean

  constructor(config: ServiceConfig) {
    this.apiKey = config.openAI?.apiKey || ''
    this.model = config.openAI?.model || 'gpt-4-turbo-preview'
    this.baseUrl = config.openAI?.baseUrl || 'https://api.openai.com/v1'
    this.useMock = config.useMockServices || !this.apiKey
  }

  async generateSummary(transcript: TranscriptResult, meetingTitle: string): Promise<SummaryResult> {
    if (this.useMock) {
      return this.mockGenerateSummary(transcript, meetingTitle)
    }

    const prompt = this.createSummaryPrompt(transcript, meetingTitle)

    const response = await this.callOpenAI([
      {
        role: 'system',
        content: 'You are an expert meeting assistant that creates concise, accurate summaries of business meetings. Focus on key decisions, action items, and important discussions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ])

    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error(`Failed to parse OpenAI summary response: ${error}`)
    }
  }

  async extractActionItems(transcript: TranscriptResult): Promise<ActionItem[]> {
    if (this.useMock) {
      return this.mockExtractActionItems(transcript)
    }

    const prompt = this.createActionItemsPrompt(transcript)

    const response = await this.callOpenAI([
      {
        role: 'system',
        content: 'You are an expert at identifying action items and tasks from meeting transcripts. Extract only clear, actionable items that were explicitly discussed or assigned.'
      },
      {
        role: 'user',
        content: prompt
      }
    ])

    try {
      const result = JSON.parse(response)
      return result.actionItems || []
    } catch (error) {
      throw new Error(`Failed to parse OpenAI action items response: ${error}`)
    }
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data: OpenAIResponse = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }

    return data.choices[0].message.content
  }

  private createSummaryPrompt(transcript: TranscriptResult, meetingTitle: string): string {
    const speakerList = transcript.speakers.map(s => `- ${s.name}`).join('\n')

    return `Please analyze this meeting transcript and create a comprehensive summary.

Meeting Title: ${meetingTitle}
Duration: ${transcript.duration} seconds
Attendees:
${speakerList}

Transcript:
${transcript.text}

Please provide a JSON response with this structure:
{
  "title": "Concise meeting title (max 60 chars)",
  "overview": "2-3 sentence overview of the meeting",
  "keyPoints": ["Array of 3-5 key discussion points"],
  "decisions": ["Array of decisions made during the meeting"],
  "nextSteps": ["Array of next steps or follow-up items"],
  "attendees": ["Array of attendee names mentioned in the meeting"]
}

Focus on:
- Key decisions and outcomes
- Important discussions and insights
- Clear next steps and follow-ups
- Accurate attendee information`
  }

  private createActionItemsPrompt(transcript: TranscriptResult): string {
    const segments = transcript.segments
      .map(seg => `[${seg.speaker}]: ${seg.text}`)
      .join('\n')

    return `Please extract action items from this meeting transcript.

Transcript segments:
${segments}

Please provide a JSON response with this structure:
{
  "actionItems": [
    {
      "text": "Clear, actionable description",
      "assignee": "Person responsible (if mentioned)",
      "dueDate": "YYYY-MM-DD (if mentioned, otherwise null)",
      "priority": "low|medium|high",
      "confidence": 0.85,
      "sourceSegment": "The original text where this was mentioned"
    }
  ]
}

Guidelines:
- Only extract items that are clearly actionable
- Assign priority based on urgency indicators in the conversation
- Include confidence score (0.0-1.0) based on clarity of the assignment
- Use the exact text segment where the action item was mentioned`
  }

  // Mock implementations for development
  private async mockGenerateSummary(transcript: TranscriptResult, meetingTitle: string): Promise<SummaryResult> {
    console.log(`[MOCK] OpenAI: Generating summary for "${meetingTitle}"`)
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay

    return {
      title: meetingTitle.length > 60 ? meetingTitle.substring(0, 57) + '...' : meetingTitle,
      overview: "The team discussed project status updates, testing timelines, and coordination for the upcoming beta release. Key focus areas included development progress, QA planning, and stakeholder involvement.",
      keyPoints: [
        "Initial development phase completed successfully and on schedule",
        "Beta release timeline confirmed for next month",
        "Two weeks allocated for comprehensive QA testing",
        "User acceptance testing with key stakeholders to be scheduled",
        "Testing schedule to be distributed by Friday"
      ],
      decisions: [
        "Proceed with beta release as planned for next month",
        "Allocate two weeks for comprehensive QA testing",
        "Schedule user acceptance testing with key stakeholders",
        "Send testing schedule by Friday"
      ],
      nextSteps: [
        "Coordinate with QA team for comprehensive testing coverage",
        "Schedule user acceptance testing sessions",
        "Document testing procedures and contingency plans",
        "Distribute detailed testing schedule by end of week"
      ],
      attendees: transcript.speakers.map(s => s.name)
    }
  }

  private async mockExtractActionItems(transcript: TranscriptResult): Promise<ActionItem[]> {
    console.log(`[MOCK] OpenAI: Extracting action items from transcript`)
    await new Promise(resolve => setTimeout(resolve, 1000))

    return [
      {
        text: "Coordinate with QA team to ensure comprehensive testing coverage for all critical paths",
        assignee: "Participant 1",
        priority: "high",
        confidence: 0.94,
        sourceSegment: "I'll coordinate with the QA team to ensure we cover all critical paths."
      },
      {
        text: "Schedule user acceptance testing sessions with key stakeholders",
        assignee: "Participant 1",
        priority: "high",
        confidence: 0.89,
        sourceSegment: "We should also schedule user acceptance testing with key stakeholders."
      },
      {
        text: "Send out the testing schedule to all team members",
        assignee: "Meeting Host",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (Friday)
        priority: "medium",
        confidence: 0.96,
        sourceSegment: "I'll send out the testing schedule by Friday."
      },
      {
        text: "Document any issues found during testing and create contingency plan",
        assignee: "Meeting Host",
        priority: "medium",
        confidence: 0.87,
        sourceSegment: "Let's make sure to document any issues and have a contingency plan."
      }
    ]
  }
}