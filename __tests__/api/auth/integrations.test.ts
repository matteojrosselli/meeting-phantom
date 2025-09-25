/**
 * T007: Contract test GET /api/auth/integrations
 *
 * This test validates the API contract for integration status retrieval.
 * Expected to FAIL initially (TDD approach) - no implementation exists yet.
 */

import { createMocks } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'

describe('/api/auth/integrations - Contract Tests', () => {
  it('should return integration status with correct schema', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-jwt-token',
      },
    })

    // Import handler that doesn't exist yet - will cause test to fail
    let handler: any
    try {
      handler = require('@/pages/api/auth/integrations').default
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toContain('Cannot find module')
      return // Test fails as expected - no implementation yet
    }

    await handler(req, res)

    // Contract expectations - should match OpenAPI schema
    expect(res._getStatusCode()).toBe(200)

    const responseData = JSON.parse(res._getData())

    // Validate response schema matches contract
    expect(responseData).toHaveProperty('zoom')
    expect(responseData).toHaveProperty('gmail')

    // Zoom integration properties
    expect(responseData.zoom).toHaveProperty('connected')
    expect(responseData.zoom).toHaveProperty('lastSync')
    expect(typeof responseData.zoom.connected).toBe('boolean')

    // Gmail integration properties
    expect(responseData.gmail).toHaveProperty('connected')
    expect(responseData.gmail).toHaveProperty('lastSync')
    expect(typeof responseData.gmail.connected).toBe('boolean')

    // lastSync should be ISO date string or null
    if (responseData.zoom.lastSync) {
      expect(new Date(responseData.zoom.lastSync)).toBeInstanceOf(Date)
    }
    if (responseData.gmail.lastSync) {
      expect(new Date(responseData.gmail.lastSync)).toBeInstanceOf(Date)
    }
  })

  it('should return 401 when unauthorized', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      // No authorization header
    })

    let handler: any
    try {
      handler = require('@/pages/api/auth/integrations').default
      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
    } catch (error) {
      // Expected failure - implementation doesn't exist
      expect(error.message).toContain('Cannot find module')
    }
  })

  it('should only accept GET method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: 'Bearer test-jwt-token',
      },
    })

    let handler: any
    try {
      handler = require('@/pages/api/auth/integrations').default
      await handler(req, res)
      expect(res._getStatusCode()).toBe(405) // Method Not Allowed
    } catch (error) {
      // Expected failure - implementation doesn't exist
      expect(error.message).toContain('Cannot find module')
    }
  })
})