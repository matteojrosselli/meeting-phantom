/**
 * Performance Tests: API Response Time (<200ms requirement)
 * Constitutional requirement: All API endpoints must respond within 200ms
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

// Import API route handlers
import authProfileHandler from '../../pages/api/auth/profile';
import authIntegrationsHandler from '../../pages/api/auth/integrations';
import meetingsHandler from '../../pages/api/meetings';
import meetingByIdHandler from '../../pages/api/meetings/[id]';

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  getAuth: jest.fn(() => ({ userId: 'test-user-id' })),
}));

// Mock database
jest.mock('../../src/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    meeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { db } from '../../src/lib/db';

describe('API Performance Tests (<200ms)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock database responses
    (db.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-user-id',
      clerkUserId: 'test-user-id',
      email: 'test@example.com',
      zoomAccessToken: null,
      gmailAccessToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (db.meeting.findMany as jest.Mock).mockResolvedValue([]);
    (db.meeting.findUnique as jest.Mock).mockResolvedValue({
      id: 'meeting-123',
      userId: 'test-user-id',
      zoomMeetingId: '123456789',
      title: 'Test Meeting',
      status: 'scheduled',
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  /**
   * Measures execution time for an API handler
   */
  const measureResponseTime = async (
    handler: any,
    method: string,
    url: string,
    body?: any
  ): Promise<number> => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method,
      url,
      body,
    });

    const startTime = performance.now();
    await handler(req, res);
    const endTime = performance.now();

    return endTime - startTime;
  };

  describe('Authentication Endpoints', () => {
    it('GET /api/auth/profile should respond within 200ms', async () => {
      const responseTime = await measureResponseTime(
        authProfileHandler,
        'GET',
        '/api/auth/profile'
      );

      expect(responseTime).toBeLessThan(200);
      console.log(`✓ GET /api/auth/profile: ${responseTime.toFixed(2)}ms`);
    });

    it('GET /api/auth/integrations should respond within 200ms', async () => {
      const responseTime = await measureResponseTime(
        authIntegrationsHandler,
        'GET',
        '/api/auth/integrations'
      );

      expect(responseTime).toBeLessThan(200);
      console.log(`✓ GET /api/auth/integrations: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('Meeting Endpoints', () => {
    it('GET /api/meetings should respond within 200ms', async () => {
      const responseTime = await measureResponseTime(
        meetingsHandler,
        'GET',
        '/api/meetings'
      );

      expect(responseTime).toBeLessThan(200);
      console.log(`✓ GET /api/meetings: ${responseTime.toFixed(2)}ms`);
    });

    it('POST /api/meetings should respond within 200ms', async () => {
      (db.meeting.create as jest.Mock).mockResolvedValue({
        id: 'new-meeting-id',
        userId: 'test-user-id',
        zoomMeetingId: '987654321',
        title: 'New Test Meeting',
        status: 'scheduled',
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const responseTime = await measureResponseTime(
        meetingsHandler,
        'POST',
        '/api/meetings',
        {
          zoomMeetingId: '987654321',
          title: 'New Test Meeting',
          startTime: new Date().toISOString(),
        }
      );

      expect(responseTime).toBeLessThan(200);
      console.log(`✓ POST /api/meetings: ${responseTime.toFixed(2)}ms`);
    });

    it('GET /api/meetings/[id] should respond within 200ms', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/meetings/meeting-123',
        query: { id: 'meeting-123' },
      });

      const startTime = performance.now();
      await meetingByIdHandler(req, res);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      console.log(`✓ GET /api/meetings/[id]: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Statistics', () => {
    it('should generate performance report for all critical endpoints', async () => {
      const endpoints = [
        { handler: authProfileHandler, method: 'GET', url: '/api/auth/profile', name: 'Auth Profile' },
        { handler: authIntegrationsHandler, method: 'GET', url: '/api/auth/integrations', name: 'Auth Integrations' },
        { handler: meetingsHandler, method: 'GET', url: '/api/meetings', name: 'List Meetings' },
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const responseTime = await measureResponseTime(
            endpoint.handler,
            endpoint.method,
            endpoint.url
          );
          return { name: endpoint.name, time: responseTime };
        })
      );

      console.log('\n📊 Performance Report:');
      console.log('━'.repeat(50));

      results.forEach((result) => {
        const status = result.time < 200 ? '✓' : '✗';
        console.log(`${status} ${result.name}: ${result.time.toFixed(2)}ms`);
      });

      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      const maxTime = Math.max(...results.map((r) => r.time));

      console.log('━'.repeat(50));
      console.log(`Average: ${avgTime.toFixed(2)}ms`);
      console.log(`Maximum: ${maxTime.toFixed(2)}ms`);
      console.log(`Constitutional Requirement: <200ms`);
      console.log('━'.repeat(50));

      // All endpoints must meet the <200ms requirement
      expect(maxTime).toBeLessThan(200);
    });
  });

  describe('Load Testing Simulation', () => {
    it('should maintain <200ms response under concurrent requests', async () => {
      // Simulate 10 concurrent requests
      const concurrentRequests = 10;

      const promises = Array.from({ length: concurrentRequests }, () =>
        measureResponseTime(authProfileHandler, 'GET', '/api/auth/profile')
      );

      const responseTimes = await Promise.all(promises);
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      console.log(`\n⚡ Concurrent Load Test (${concurrentRequests} requests):`);
      console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Maximum: ${maxResponseTime.toFixed(2)}ms`);

      // Under concurrent load, average should still be under 200ms
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
});
