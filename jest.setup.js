import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id', sessionId: 'test-session' })),
  currentUser: jest.fn(),
  ClerkProvider: ({ children }) => children,
  SignIn: () => <div data-testid="sign-in">Sign In Mock</div>,
  SignUp: () => <div data-testid="sign-up">Sign Up Mock</div>,
  UserButton: () => <div data-testid="user-button">User Button Mock</div>,
}))

// Mock Prisma database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    meeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))