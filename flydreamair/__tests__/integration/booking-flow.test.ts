import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';
import { POST as createBookingPOST } from '../../app/api/create-booking/route';
import { GET as getBookingGET } from '../../app/api/booking/[id]/route';
import { createBooking } from '../../lib/actions/create-booking';
import { prisma } from '../../lib/prisma';
import { auth } from '../../auth';

// Mock dependencies
jest.mock('../../lib/actions/create-booking');
jest.mock('../../lib/prisma');
jest.mock('../../auth');

const mockCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Booking Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication
    mockAuth.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    } as any);
  });

  describe('Complete Booking Flow', () => {
    it('should handle complete booking creation and retrieval flow', async () => {
      // Mock successful booking creation
      mockCreateBooking.mockResolvedValue({
        success: true,
        bookingId: 1,
        pnr: 'FLYDA123456'
      });

      // Mock booking data for retrieval
      const mockBookingData = {
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

      mockPrisma.booking.findUnique.mockResolvedValue(mockBookingData as any);

      // Step 1: Create booking
      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'John');
      formData.set('last_name', 'Doe');
      formData.set('date_of_birth', '1990-01-01');
      formData.set('passport_number', 'N1234567');
      formData.set('gender', 'Male');
      formData.set('email', 'john@example.com');
      formData.set('phone', '+1234567890');
      formData.set('flight_id', 'FA-123');
      formData.set('airline', 'FlyDreamAir');
      formData.set('flight_number', 'FA-123');
      formData.set('price', '1000');
      formData.set('selected_seats', '12A');
      formData.set('selected_meal', 'standard');
      formData.set('selected_baggage', 'standard');
      formData.set('travel_insurance', 'false');

      const createRequest = new NextRequest('http://localhost:3000/api/create-booking', {
        method: 'POST',
        body: formData
      });

      const createResponse = await createBookingPOST(createRequest);
      expect(createResponse.status).toBe(307);

      // Step 2: Retrieve booking
      const getRequest = new NextRequest('http://localhost:3000/api/booking/1');
      const getResponse = await getBookingGET(getRequest, { params: { id: '1' } });
      const bookingData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(bookingData).toMatchObject({
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

    it('should handle booking creation with add-ons', async () => {
      // Mock booking creation with add-ons
      mockCreateBooking.mockResolvedValue({
        success: true,
        bookingId: 2,
        pnr: 'FLYDA789012'
      });

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'Jane');
      formData.set('last_name', 'Smith');
      formData.set('date_of_birth', '1985-05-15');
      formData.set('passport_number', 'N7654321');
      formData.set('gender', 'Female');
      formData.set('email', 'jane@example.com');
      formData.set('phone', '+1987654321');
      formData.set('flight_id', 'FA-456');
      formData.set('airline', 'FlyDreamAir');
      formData.set('flight_number', 'FA-456');
      formData.set('price', '1500');
      formData.set('selected_seats', '15B');
      formData.set('selected_meal', 'premium');
      formData.set('selected_baggage', 'extra');
      formData.set('travel_insurance', 'true');

      const request = new NextRequest('http://localhost:3000/api/create-booking', {
        method: 'POST',
        body: formData
      });

      const response = await createBookingPOST(request);

      expect(response.status).toBe(307);
      expect(mockCreateBooking).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should handle authentication errors', async () => {
      mockAuth.mockResolvedValue(null);

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'John');
      formData.set('last_name', 'Doe');

      const request = new NextRequest('http://localhost:3000/api/create-booking', {
        method: 'POST',
        body: formData
      });

      const response = await createBookingPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('You need to be logged in to create a booking');
    });

    it('should handle database errors during booking creation', async () => {
      mockCreateBooking.mockRejectedValue(new Error('Database connection failed'));

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'John');
      formData.set('last_name', 'Doe');

      const request = new NextRequest('http://localhost:3000/api/create-booking', {
        method: 'POST',
        body: formData
      });

      const response = await createBookingPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create booking');
    });

    it('should handle booking not found error', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/booking/999');
      const response = await getBookingGET(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Booking not found');
    });

    it('should handle invalid booking ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking/invalid');
      const response = await getBookingGET(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid booking ID');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields in booking creation', async () => {
      mockCreateBooking.mockResolvedValue({
        error: 'All fields are required'
      });

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      // Missing required fields

      const request = new NextRequest('http://localhost:3000/api/create-booking', {
        method: 'POST',
        body: formData
      });

      const response = await createBookingPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('All fields are required');
    });

    it('should handle different trip types correctly', async () => {
      const tripTypes = [
        { type: 'oneway', expectedBookingTypeId: '2' },
        { type: 'return', expectedBookingTypeId: '1' },
        { type: 'multi-city', expectedBookingTypeId: '3' }
      ];

      for (const { type, expectedBookingTypeId } of tripTypes) {
        mockCreateBooking.mockResolvedValue({
          success: true,
          bookingId: 1,
          pnr: 'FLYDA123456'
        });

        const formData = new FormData();
        formData.set('trip_type', type);
        formData.set('first_name', 'John');
        formData.set('last_name', 'Doe');
        formData.set('date_of_birth', '1990-01-01');
        formData.set('passport_number', 'N1234567');
        formData.set('gender', 'Male');
        formData.set('email', 'john@example.com');
        formData.set('phone', '+1234567890');
        formData.set('flight_id', 'FA-123');
        formData.set('airline', 'FlyDreamAir');
        formData.set('flight_number', 'FA-123');
        formData.set('price', '1000');
        formData.set('selected_seats', '12A');
        formData.set('selected_meal', 'standard');
        formData.set('selected_baggage', 'standard');
        formData.set('travel_insurance', 'false');

        const request = new NextRequest('http://localhost:3000/api/create-booking', {
          method: 'POST',
          body: formData
        });

        await createBookingPOST(request);

        const calledFormData = mockCreateBooking.mock.calls[mockCreateBooking.mock.calls.length - 1][0];
        expect(calledFormData.get('booking_type_id')).toBe(expectedBookingTypeId);
      }
    });
  });
});
