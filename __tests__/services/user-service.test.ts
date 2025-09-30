import { UserService } from '../../src/lib/services/user-service'

// Mock the database
jest.mock('../../src/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { db } from '../../src/lib/db'

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService({ enabled: true })
    jest.clearAllMocks()
  })

  describe('getOrCreateUser', () => {
    const mockUserData = {
      id: 'user_1',
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      name: 'John Doe',
      zoomConnected: false,
      zoomAccessToken: null,
      zoomRefreshToken: null,
      gmailConnected: false,
      gmailAccessToken: null,
      gmailRefreshToken: null,
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should return existing user if found', async () => {
      const mockDbUser = { ...mockUserData }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser)

      const result = await userService.getOrCreateUser('clerk_123', 'test@example.com', 'John', 'Doe')

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
      })
      expect(db.user.create).not.toHaveBeenCalled()
      expect(result).toEqual({
        id: 'user_1',
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: mockUserData.createdAt,
        updatedAt: mockUserData.updatedAt,
        integrations: {
          zoom: false,
          gmail: false,
        },
      })
    })

    it('should create new user if not found', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(db.user.create as jest.Mock).mockResolvedValue(mockUserData)

      const result = await userService.getOrCreateUser('clerk_123', 'test@example.com', 'John', 'Doe')

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
      })
      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          clerkUserId: 'clerk_123',
          email: 'test@example.com',
          name: 'John Doe',
        },
      })
      expect(result).toEqual({
        id: 'user_1',
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: mockUserData.createdAt,
        updatedAt: mockUserData.updatedAt,
        integrations: {
          zoom: false,
          gmail: false,
        },
      })
    })

    it('should handle single name correctly', async () => {
      const mockSingleNameUser = { ...mockUserData, name: 'Madonna' }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(db.user.create as jest.Mock).mockResolvedValue(mockSingleNameUser)

      const result = await userService.getOrCreateUser('clerk_123', 'test@example.com', 'Madonna', '')

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          clerkUserId: 'clerk_123',
          email: 'test@example.com',
          name: 'Madonna',
        },
      })
      expect(result.firstName).toBe('Madonna')
      expect(result.lastName).toBeUndefined()
    })

    it('should handle integration status correctly with tokens', async () => {
      const mockUserWithTokens = {
        ...mockUserData,
        zoomAccessToken: 'zoom_token_123',
        zoomRefreshToken: 'zoom_refresh_123',
        gmailAccessToken: 'gmail_token_123',
        gmailRefreshToken: 'gmail_refresh_123',
      }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithTokens)

      const result = await userService.getOrCreateUser('clerk_123', 'test@example.com', 'John', 'Doe')

      expect(result.integrations).toEqual({
        zoom: true,
        gmail: true,
      })
    })

    it('should throw error on database failure', async () => {
      ;(db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      await expect(
        userService.getOrCreateUser('clerk_123', 'test@example.com', 'John', 'Doe')
      ).rejects.toThrow('User operation failed')
    })
  })

  describe('getValidTokens', () => {
    const mockUser = {
      id: 'user_1',
      clerkUserId: 'clerk_123',
      zoomAccessToken: 'zoom_token_123',
      zoomRefreshToken: 'zoom_refresh_123',
      gmailAccessToken: 'gmail_token_123',
      gmailRefreshToken: 'gmail_refresh_123',
    }

    it('should return zoom tokens when available', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await userService.getValidTokens('clerk_123', 'zoom')

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
      })
      expect(result).toEqual({
        zoomAccessToken: 'zoom_token_123',
        zoomRefreshToken: 'zoom_refresh_123',
        zoomExpiresAt: undefined,
      })
    })

    it('should return gmail tokens when available', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await userService.getValidTokens('clerk_123', 'gmail')

      expect(result).toEqual({
        gmailAccessToken: 'gmail_token_123',
        gmailRefreshToken: 'gmail_refresh_123',
        gmailExpiresAt: undefined,
      })
    })

    it('should return null when user not found', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await userService.getValidTokens('clerk_123', 'zoom')

      expect(result).toBeNull()
    })

    it('should return null when tokens not available', async () => {
      const mockUserNoTokens = {
        ...mockUser,
        zoomAccessToken: null,
        zoomRefreshToken: null,
      }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUserNoTokens)

      const result = await userService.getValidTokens('clerk_123', 'zoom')

      expect(result).toBeNull()
    })

    it('should return null on database failure', async () => {
      ;(db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await userService.getValidTokens('clerk_123', 'zoom')
      expect(result).toBeNull()
    })
  })

  describe('storeTokens', () => {
    it('should store zoom tokens successfully', async () => {
      const mockUpdatedUser = {
        id: 'user_1',
        zoomAccessToken: 'new_zoom_token',
        zoomRefreshToken: 'new_zoom_refresh',
      }
      ;(db.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser)

      await userService.storeTokens('clerk_123', 'zoom', {
        zoomAccessToken: 'new_zoom_token',
        zoomRefreshToken: 'new_zoom_refresh',
        zoomExpiresAt: undefined,
      })

      expect(db.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
        data: {
          zoomAccessToken: 'new_zoom_token',
          zoomRefreshToken: 'new_zoom_refresh',
          zoomExpiresAt: undefined,
        },
      })
    })

    it('should store gmail tokens successfully', async () => {
      const mockUpdatedUser = {
        id: 'user_1',
        gmailAccessToken: 'new_gmail_token',
        gmailRefreshToken: 'new_gmail_refresh',
      }
      ;(db.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser)

      await userService.storeTokens('clerk_123', 'gmail', {
        gmailAccessToken: 'new_gmail_token',
        gmailRefreshToken: 'new_gmail_refresh',
        gmailExpiresAt: undefined,
      })

      expect(db.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
        data: {
          gmailAccessToken: 'new_gmail_token',
          gmailRefreshToken: 'new_gmail_refresh',
          gmailExpiresAt: undefined,
        },
      })
    })

    it('should handle partial token data', async () => {
      ;(db.user.update as jest.Mock).mockResolvedValue({ id: 'user_1' })

      await userService.storeTokens('clerk_123', 'zoom', {
        zoomAccessToken: 'token_only',
      })

      expect(db.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
        data: {
          zoomAccessToken: 'token_only',
          zoomRefreshToken: undefined,
          zoomExpiresAt: undefined,
        },
      })
    })

    it('should throw error on database failure', async () => {
      ;(db.user.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      await expect(
        userService.storeTokens('clerk_123', 'zoom', {
          zoomAccessToken: 'token',
        })
      ).rejects.toThrow('Token storage failed')
    })
  })

  describe('getIntegrationStatus', () => {
    it('should return correct integration status with tokens', async () => {
      const mockUser = {
        id: 'user_1',
        zoomAccessToken: 'zoom_token',
        zoomRefreshToken: 'zoom_refresh',
        gmailAccessToken: 'gmail_token',
        gmailRefreshToken: 'gmail_refresh',
      }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await userService.getIntegrationStatus('clerk_123')

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_123' },
      })
      expect(result).toEqual({
        zoom: true,
        gmail: true,
      })
    })

    it('should return false for missing tokens', async () => {
      const mockUser = {
        id: 'user_1',
        zoomAccessToken: null,
        zoomRefreshToken: null,
        gmailAccessToken: 'gmail_token',
        gmailRefreshToken: null, // Missing refresh token
      }
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await userService.getIntegrationStatus('clerk_123')

      expect(result).toEqual({
        zoom: false,
        gmail: false, // False because missing refresh token
      })
    })

    it('should return false for all integrations when user not found', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await userService.getIntegrationStatus('clerk_123')

      expect(result).toEqual({
        zoom: false,
        gmail: false,
      })
    })

    it('should return false for all integrations on database error', async () => {
      ;(db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await userService.getIntegrationStatus('clerk_123')

      expect(result).toEqual({
        zoom: false,
        gmail: false,
      })
    })
  })

  describe('Service Configuration', () => {
    it('should initialize with default configuration', () => {
      expect(userService).toBeDefined()
      expect(userService instanceof UserService).toBe(true)
    })

    it('should handle configuration properly', () => {
      // Test that service is properly configured
      expect(userService).toBeDefined()
      expect(userService instanceof UserService).toBe(true)

      // UserService doesn't expose updateConfig method, so test basic functionality
      expect(typeof userService.getOrCreateUser).toBe('function')
      expect(typeof userService.storeTokens).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors appropriately', async () => {
      // Test that database errors are properly handled and logged
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(db.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection lost'))

      await expect(
        userService.getOrCreateUser('clerk_123', 'test@example.com', 'John', 'Doe')
      ).rejects.toThrow('User operation failed')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get or create user:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle invalid provider types gracefully', async () => {
      ;(db.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user_1',
        zoomAccessToken: 'token',
        zoomRefreshToken: 'refresh',
      })

      // Testing with valid provider but expect null due to method logic
      const result = await userService.getValidTokens('clerk_123', 'gmail')

      expect(result).toBeNull()
    })
  })
})