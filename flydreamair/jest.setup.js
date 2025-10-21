import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js auth
jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}), { virtual: true })

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    passenger: {
      create: jest.fn(),
    },
    bookedFlight: {
      create: jest.fn(),
    },
    bookedSeat: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    flightSupply: {
      findMany: jest.fn(),
    },
    airline: {
      findMany: jest.fn(),
    },
    airport: {
      findMany: jest.fn(),
    },
    city: {
      findMany: jest.fn(),
    },
    country: {
      findMany: jest.fn(),
    },
    bookingClass: {
      findMany: jest.fn(),
    },
    bookingType: {
      findMany: jest.fn(),
    },
  }
}), { virtual: true })

// Mock fetch globally
global.fetch = jest.fn()

// Mock crypto for PNR generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
})
