import { ServiceConfig } from './types'
import { prisma } from '@/lib/db'

interface UserTokens {
  zoomAccessToken?: string
  zoomRefreshToken?: string
  zoomExpiresAt?: Date
  gmailAccessToken?: string
  gmailRefreshToken?: string
  gmailExpiresAt?: Date
}

interface UserProfile {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
  integrations: {
    zoom: boolean
    gmail: boolean
  }
}

export class UserService {
  private config: ServiceConfig

  constructor(config: ServiceConfig) {
    this.config = config
  }

  /**
   * Get or create user profile from Clerk ID
   */
  async getOrCreateUser(clerkId: string, email: string, firstName?: string, lastName?: string): Promise<UserProfile> {
    try {
      let user = await prisma.user.findUnique({
        where: { clerkId }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName,
            lastName
          }
        })
      }

      return {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        integrations: {
          zoom: !!(user.zoomAccessToken && user.zoomExpiresAt && user.zoomExpiresAt > new Date()),
          gmail: !!(user.gmailAccessToken && user.gmailExpiresAt && user.gmailExpiresAt > new Date())
        }
      }
    } catch (error) {
      console.error('Failed to get or create user:', error)
      throw new Error('User operation failed')
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(clerkId: string, updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'email'>>): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { clerkId },
        data: updates
      })

      return {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        integrations: {
          zoom: !!(user.zoomAccessToken && user.zoomExpiresAt && user.zoomExpiresAt > new Date()),
          gmail: !!(user.gmailAccessToken && user.gmailExpiresAt && user.gmailExpiresAt > new Date())
        }
      }
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw new Error('Profile update failed')
    }
  }

  /**
   * Store OAuth tokens for integrations
   */
  async storeTokens(clerkId: string, provider: 'zoom' | 'gmail', tokens: UserTokens): Promise<void> {
    try {
      const updateData: any = {}

      if (provider === 'zoom') {
        updateData.zoomAccessToken = tokens.zoomAccessToken
        updateData.zoomRefreshToken = tokens.zoomRefreshToken
        updateData.zoomExpiresAt = tokens.zoomExpiresAt
      } else if (provider === 'gmail') {
        updateData.gmailAccessToken = tokens.gmailAccessToken
        updateData.gmailRefreshToken = tokens.gmailRefreshToken
        updateData.gmailExpiresAt = tokens.gmailExpiresAt
      }

      await prisma.user.update({
        where: { clerkId },
        data: updateData
      })
    } catch (error) {
      console.error(`Failed to store ${provider} tokens:`, error)
      throw new Error('Token storage failed')
    }
  }

  /**
   * Get valid OAuth tokens for a provider
   */
  async getValidTokens(clerkId: string, provider: 'zoom' | 'gmail'): Promise<UserTokens | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      })

      if (!user) return null

      if (provider === 'zoom') {
        if (user.zoomAccessToken && user.zoomExpiresAt && user.zoomExpiresAt > new Date()) {
          return {
            zoomAccessToken: user.zoomAccessToken,
            zoomRefreshToken: user.zoomRefreshToken || undefined,
            zoomExpiresAt: user.zoomExpiresAt
          }
        }
      } else if (provider === 'gmail') {
        if (user.gmailAccessToken && user.gmailExpiresAt && user.gmailExpiresAt > new Date()) {
          return {
            gmailAccessToken: user.gmailAccessToken,
            gmailRefreshToken: user.gmailRefreshToken || undefined,
            gmailExpiresAt: user.gmailExpiresAt
          }
        }
      }

      return null
    } catch (error) {
      console.error(`Failed to get ${provider} tokens:`, error)
      return null
    }
  }

  /**
   * Disconnect an integration by clearing tokens
   */
  async disconnectIntegration(clerkId: string, provider: 'zoom' | 'gmail'): Promise<void> {
    try {
      const updateData: any = {}

      if (provider === 'zoom') {
        updateData.zoomAccessToken = null
        updateData.zoomRefreshToken = null
        updateData.zoomExpiresAt = null
      } else if (provider === 'gmail') {
        updateData.gmailAccessToken = null
        updateData.gmailRefreshToken = null
        updateData.gmailExpiresAt = null
      }

      await prisma.user.update({
        where: { clerkId },
        data: updateData
      })
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error)
      throw new Error('Integration disconnect failed')
    }
  }

  /**
   * Get integration status for user
   */
  async getIntegrationStatus(clerkId: string): Promise<{ zoom: boolean; gmail: boolean }> {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      })

      if (!user) {
        return { zoom: false, gmail: false }
      }

      return {
        zoom: !!(user.zoomAccessToken && user.zoomExpiresAt && user.zoomExpiresAt > new Date()),
        gmail: !!(user.gmailAccessToken && user.gmailExpiresAt && user.gmailExpiresAt > new Date())
      }
    } catch (error) {
      console.error('Failed to get integration status:', error)
      return { zoom: false, gmail: false }
    }
  }
}
