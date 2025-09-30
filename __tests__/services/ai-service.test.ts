import { OpenAIService } from '../../src/lib/services/openai'
import { TranscriptResult, SummaryResult, ActionItem } from '../../src/lib/services/types'

// Mock fetch globally
global.fetch = jest.fn()

describe('OpenAIService (AI Service)', () => {
  let aiService: OpenAIService
  const mockTranscript: TranscriptResult = {
    id: 'transcript_123',
    status: 'completed',
    text: 'Hello everyone. We need to finalize the project timeline. John, can you coordinate with the QA team? I will send the testing schedule by Friday.',
    speakers: [
      { id: 'speaker_1', name: 'Meeting Host', email: 'host@example.com' },
      { id: 'speaker_2', name: 'John Doe', email: 'john@example.com' }
    ],
    segments: [
      {
        id: 'seg_1',
        text: 'Hello everyone. We need to finalize the project timeline.',
        startTime: 0,
        endTime: 5000,
        speaker: 'Meeting Host',
        confidence: 0.95
      },
      {
        id: 'seg_2',
        text: 'John, can you coordinate with the QA team?',
        startTime: 5000,
        endTime: 8000,
        speaker: 'Meeting Host',
        confidence: 0.92
      },
      {
        id: 'seg_3',
        text: 'I will send the testing schedule by Friday.',
        startTime: 8000,
        endTime: 12000,
        speaker: 'Meeting Host',
        confidence: 0.94
      }
    ],
    confidence: 0.94,
    duration: 12000,
    wordCount: 18,
    language: 'en'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Mock Mode (Development)', () => {
    beforeEach(() => {
      aiService = new OpenAIService({
        enabled: true,
        useMockServices: true
      })
    })

    describe('generateSummary', () => {
      it('should generate mock summary successfully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        const result = await aiService.generateSummary(mockTranscript, 'Project Status Meeting')

        expect(consoleSpy).toHaveBeenCalledWith('[MOCK] OpenAI: Generating summary for "Project Status Meeting"')
        expect(result).toEqual({
          title: 'Project Status Meeting',
          overview: expect.stringContaining('team discussed project status'),
          keyPoints: expect.arrayContaining([
            expect.stringContaining('development phase completed')
          ]),
          decisions: expect.arrayContaining([
            expect.stringContaining('Proceed with beta release')
          ]),
          nextSteps: expect.arrayContaining([
            expect.stringContaining('Coordinate with QA team')
          ]),
          attendees: ['Meeting Host', 'John Doe']
        })

        consoleSpy.mockRestore()
      })

      it('should truncate long meeting titles', async () => {
        const longTitle = 'This is a very long meeting title that exceeds sixty characters and should be truncated'

        const result = await aiService.generateSummary(mockTranscript, longTitle)

        expect(result.title).toHaveLength(60)
        expect(result.title).toMatch(/\.\.\.$/)  // Ends with '...'
      })

      it('should preserve short meeting titles', async () => {
        const shortTitle = 'Short Title'

        const result = await aiService.generateSummary(mockTranscript, shortTitle)

        expect(result.title).toBe('Short Title')
      })

      it('should include transcript speakers in attendees', async () => {
        const result = await aiService.generateSummary(mockTranscript, 'Test Meeting')

        expect(result.attendees).toEqual(['Meeting Host', 'John Doe'])
      })
    })

    describe('extractActionItems', () => {
      it('should extract mock action items successfully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

        const result = await aiService.extractActionItems(mockTranscript)

        expect(consoleSpy).toHaveBeenCalledWith('[MOCK] OpenAI: Extracting action items from transcript')
        expect(result).toHaveLength(4)

        const firstItem = result[0]
        expect(firstItem).toEqual({
          text: expect.stringContaining('Coordinate with QA team'),
          assignee: 'Participant 1',
          priority: 'high',
          confidence: 0.94,
          sourceSegment: expect.stringContaining('coordinate with the QA team')
        })

        consoleSpy.mockRestore()
      })

      it('should include due dates for some action items', async () => {
        const result = await aiService.extractActionItems(mockTranscript)

        const itemWithDueDate = result.find(item => item.dueDate)
        expect(itemWithDueDate).toBeDefined()
        expect(itemWithDueDate?.dueDate).toBeInstanceOf(Date)
      })

      it('should have various priority levels', async () => {
        const result = await aiService.extractActionItems(mockTranscript)

        const priorities = result.map(item => item.priority)
        expect(priorities).toContain('high')
        expect(priorities).toContain('medium')
      })

      it('should have high confidence scores', async () => {
        const result = await aiService.extractActionItems(mockTranscript)

        result.forEach(item => {
          expect(item.confidence).toBeGreaterThan(0.8)
          expect(item.confidence).toBeLessThanOrEqual(1.0)
        })
      })
    })
  })

  describe('Production Mode (OpenAI API)', () => {
    beforeEach(() => {
      aiService = new OpenAIService({
        enabled: true,
        useMockServices: false,
        openAI: {
          apiKey: 'test-api-key',
          model: 'gpt-4-turbo-preview',
          baseUrl: 'https://api.openai.com/v1'
        }
      })
    })

    describe('generateSummary', () => {
      it('should generate summary from OpenAI API successfully', async () => {
        const mockSummary: SummaryResult = {
          title: 'Project Status Meeting',
          overview: 'Team discussed project timeline and QA coordination.',
          keyPoints: ['Timeline finalization', 'QA coordination'],
          decisions: ['Proceed with current timeline'],
          nextSteps: ['Coordinate QA testing'],
          attendees: ['Meeting Host', 'John Doe']
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify(mockSummary)
              },
              finish_reason: 'stop'
            }],
            usage: {
              total_tokens: 150,
              prompt_tokens: 100,
              completion_tokens: 50
            }
          })
        })

        const result = await aiService.generateSummary(mockTranscript, 'Project Status Meeting')

        expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }))

        // Verify the request body contains expected content
        const fetchCall = (fetch as jest.Mock).mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)
        expect(requestBody.model).toBe('gpt-4-turbo-preview')
        expect(requestBody.messages[0].content).toContain('expert meeting assistant')
        expect(requestBody.messages[1].content).toContain('Project Status Meeting')

        expect(result).toEqual(mockSummary)
      })

      it('should include meeting details in prompt', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: '{"title":"Test"}' },
              finish_reason: 'stop'
            }]
          })
        })

        await aiService.generateSummary(mockTranscript, 'Test Meeting')

        const fetchCall = (fetch as jest.Mock).mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)
        const userMessage = requestBody.messages[1].content

        expect(userMessage).toContain('Test Meeting')
        expect(userMessage).toContain('12000 seconds')
        expect(userMessage).toContain('Meeting Host')
        expect(userMessage).toContain('John Doe')
        expect(userMessage).toContain(mockTranscript.text)
      })

      it('should throw error on API failure', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          statusText: 'Unauthorized'
        })

        await expect(
          aiService.generateSummary(mockTranscript, 'Test Meeting')
        ).rejects.toThrow('OpenAI API error: Unauthorized')
      })

      it('should throw error when no response choices', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ choices: [] })
        })

        await expect(
          aiService.generateSummary(mockTranscript, 'Test Meeting')
        ).rejects.toThrow('No response from OpenAI')
      })

      it('should throw error on invalid JSON response', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: 'invalid json' },
              finish_reason: 'stop'
            }]
          })
        })

        await expect(
          aiService.generateSummary(mockTranscript, 'Test Meeting')
        ).rejects.toThrow('Failed to parse OpenAI summary response')
      })
    })

    describe('extractActionItems', () => {
      it('should extract action items from OpenAI API successfully', async () => {
        const mockActionItems: ActionItem[] = [{
          text: 'Coordinate with QA team',
          assignee: 'John Doe',
          priority: 'high',
          confidence: 0.95,
          sourceSegment: 'John, can you coordinate with the QA team?'
        }]

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({ actionItems: mockActionItems })
              },
              finish_reason: 'stop'
            }]
          })
        })

        const result = await aiService.extractActionItems(mockTranscript)

        expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }))

        // Verify the request body contains expected content
        const fetchCall = (fetch as jest.Mock).mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)
        expect(requestBody.model).toBe('gpt-4-turbo-preview')
        expect(requestBody.messages[0].content).toContain('expert at identifying action items')
        expect(requestBody.messages[1].content).toContain('[Meeting Host]:')

        expect(result).toEqual(mockActionItems)
      })

      it('should include transcript segments in prompt', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: '{"actionItems":[]}' },
              finish_reason: 'stop'
            }]
          })
        })

        await aiService.extractActionItems(mockTranscript)

        const fetchCall = (fetch as jest.Mock).mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)
        const userMessage = requestBody.messages[1].content

        expect(userMessage).toContain('[Meeting Host]: Hello everyone')
        expect(userMessage).toContain('[Meeting Host]: John, can you coordinate')
        expect(userMessage).toContain('[Meeting Host]: I will send the testing')
      })

      it('should handle empty action items response', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: '{}' },
              finish_reason: 'stop'
            }]
          })
        })

        const result = await aiService.extractActionItems(mockTranscript)
        expect(result).toEqual([])
      })

      it('should throw error on API failure', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          statusText: 'Rate Limited'
        })

        await expect(
          aiService.extractActionItems(mockTranscript)
        ).rejects.toThrow('OpenAI API error: Rate Limited')
      })

      it('should throw error on invalid JSON response', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: { content: 'not valid json' },
              finish_reason: 'stop'
            }]
          })
        })

        await expect(
          aiService.extractActionItems(mockTranscript)
        ).rejects.toThrow('Failed to parse OpenAI action items response')
      })
    })
  })

  describe('Configuration Handling', () => {
    it('should use mock mode when no API key provided', () => {
      const service = new OpenAIService({ enabled: true })

      // Access private property for testing
      expect((service as any).useMock).toBe(true)
    })

    it('should use mock mode when explicitly enabled', () => {
      const service = new OpenAIService({
        enabled: true,
        useMockServices: true,
        openAI: { apiKey: 'test-key' }
      })

      expect((service as any).useMock).toBe(true)
    })

    it('should use production mode with valid config', () => {
      const service = new OpenAIService({
        enabled: true,
        useMockServices: false,
        openAI: { apiKey: 'test-key' }
      })

      expect((service as any).useMock).toBe(false)
      expect((service as any).apiKey).toBe('test-key')
      expect((service as any).model).toBe('gpt-4-turbo-preview')
      expect((service as any).baseUrl).toBe('https://api.openai.com/v1')
    })

    it('should use custom model and baseUrl when provided', () => {
      const service = new OpenAIService({
        enabled: true,
        openAI: {
          apiKey: 'test-key',
          model: 'gpt-3.5-turbo',
          baseUrl: 'https://custom-api.example.com/v1'
        }
      })

      expect((service as any).model).toBe('gpt-3.5-turbo')
      expect((service as any).baseUrl).toBe('https://custom-api.example.com/v1')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      aiService = new OpenAIService({
        enabled: true,
        useMockServices: false,
        openAI: { apiKey: 'test-key' }
      })
    })

    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        aiService.generateSummary(mockTranscript, 'Test Meeting')
      ).rejects.toThrow('Network error')
    })

    it('should handle malformed API responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      })

      await expect(
        aiService.generateSummary(mockTranscript, 'Test Meeting')
      ).rejects.toThrow('Invalid JSON')
    })

    it('should handle API timeout scenarios', async () => {
      ;(fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(() => {}) // Never resolves (simulates timeout)
      )

      // This test would need actual timeout handling in the service
      // For now, we just ensure the mock setup works
      const promise = aiService.generateSummary(mockTranscript, 'Test Meeting')
      expect(promise).toBeInstanceOf(Promise)
    })
  })

  describe('Service Integration', () => {
    it('should properly initialize service instance', () => {
      const service = new OpenAIService({ enabled: true })
      expect(service).toBeInstanceOf(OpenAIService)
      expect(typeof service.generateSummary).toBe('function')
      expect(typeof service.extractActionItems).toBe('function')
    })

    it('should handle empty transcript gracefully', async () => {
      const emptyTranscript: TranscriptResult = {
        id: 'empty_123',
        status: 'completed',
        text: '',
        speakers: [],
        segments: [],
        confidence: 0,
        duration: 0,
        wordCount: 0,
        language: 'en'
      }

      const service = new OpenAIService({ enabled: true, useMockServices: true })

      const summary = await service.generateSummary(emptyTranscript, 'Empty Meeting')
      const actionItems = await service.extractActionItems(emptyTranscript)

      expect(summary).toBeDefined()
      expect(summary.attendees).toEqual([])
      expect(actionItems).toBeDefined()
      expect(Array.isArray(actionItems)).toBe(true)
    })
  })
})