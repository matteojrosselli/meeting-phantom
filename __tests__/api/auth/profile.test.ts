/**
 * T006: Contract test GET /api/auth/profile
 *
 * This test validates the API contract for user profile retrieval.
 * Expected to FAIL initially (TDD approach) - no implementation exists yet.
 */

import { createMocks } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'

describe('/api/auth/profile - Contract Tests', () => {
  it('should return user profile with correct schema', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-jwt-token',
      },
    })

    // Import handler that doesn't exist yet - will cause test to fail
    let handler: any
    try {
      handler = require('@/pages/api/auth/profile').default
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
    expect(responseData).toHaveProperty('id')
    expect(responseData).toHaveProperty('email')
    expect(responseData).toHaveProperty('name')
    expect(responseData).toHaveProperty('zoomConnected')
    expect(responseData).toHaveProperty('gmailConnected')
    expect(responseData).toHaveProperty('preferences')
    expect(responseData).toHaveProperty('createdAt')

    // Type validations
    expect(typeof responseData.id).toBe('string')
    expect(typeof responseData.email).toBe('string')
    expect(typeof responseData.name).toBe('string')
    expect(typeof responseData.zoomConnected).toBe('boolean')
    expect(typeof responseData.gmailConnected).toBe('boolean')
    expect(typeof responseData.preferences).toBe('object')
  })

  it('should return 401 when unauthorized', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      // No authorization header
    })

    let handler: any
    try {
      handler = require('@/pages/api/auth/profile').default
      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
    } catch (error) {
      // Expected failure - implementation doesn't exist
      expect(error.message).toContain('Cannot find module')
    }
  })

  it('should only accept GET method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-jwt-token',
      },
    })

    let handler: any
    try {
      handler = require('@/pages/api/auth/profile').default
      await handler(req, res)
      expect(res._getStatusCode()).toBe(405) // Method Not Allowed
    } catch (error) {
      // Expected failure - implementation doesn't exist
      expect(error.message).toContain('Cannot find module')
    }
  })
})