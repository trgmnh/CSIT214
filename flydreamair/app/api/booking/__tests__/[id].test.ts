import { GET } from '../[id]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/booking/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return booking data successfully', async () => {
    const mockBooking = {
      id: 1,
      pnr: 'FLYDA123456',
      passengers: [{
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bookedSeats: [{
          seatNo: '12A',
          bookedFlight: {
            id: 1,
            flightSupply: {
              flightNo: 'FA-123',
              airline: { name: 'FlyDreamAir' },
              departureTime: new Date('2025-03-18T08:30:00Z'),
              departingAirport: {
                code: 'SYD',
                city: { cityName: 'Sydney' }
              },
              arrivingAirport: {
                code: 'LHR',
                city: { cityName: 'London' }
              }
            },
            bookingClass: { className: 'Economy' }
          }
        }]
      }],
      bookedFlights: [{
        id: 1,
        fareAmount: 1000,
        fareCurrency: 'AUD',
        flightSupply: {
          flightNo: 'FA-123',
          airline: { name: 'FlyDreamAir' },
          departureTime: new Date('2025-03-18T08:30:00Z'),
          departingAirport: {
            code: 'SYD',
            city: { cityName: 'Sydney' }
          },
          arrivingAirport: {
            code: 'LHR',
            city: { cityName: 'London' }
          }
        },
        bookingClass: { className: 'Economy' }
      }],
      payments: [{
        amount: 1000,
        currency: 'AUD'
      }]
    };

    mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any);

    const request = new NextRequest('http://localhost:3000/api/booking/1');
    const response = await GET(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      bookingId: '1',
      pnr: 'FLYDA123456',
      flightDetails: {
        flightNumber: 'FA-123',
        airline: 'FlyDreamAir',
        cabin: 'Economy'
      },
      passenger: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      bookingExtras: {
        seats: ['12A'],
        meal: 'Standard',
        baggage: 'Standard (23kg)',
        travelInsurance: false
      },
      priceSummary: {
        baseFare: 1000,
        total: 1000
      }
    });
  });

  it('should return 400 for invalid booking ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/booking/invalid');
    const response = await GET(request, { params: { id: 'invalid' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid booking ID');
  });

  it('should return 404 when booking not found', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/booking/999');
    const response = await GET(request, { params: { id: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Booking not found');
  });

  it('should handle database errors', async () => {
    mockPrisma.booking.findUnique.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/booking/1');
    const response = await GET(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch booking data');
  });
});
