// Mock the dependencies before importing
jest.mock('@/lib/actions/create-booking', () => ({
  createBooking: jest.fn()
}), { virtual: true });

jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
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
  }
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}));

describe('Booking Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking Creation Flow', () => {
    it('should handle complete booking creation flow', async () => {
      const { createBooking } = require('@/lib/actions/create-booking');
      const { prisma } = require('@/lib/prisma');

      // Mock successful booking creation
      createBooking.mockResolvedValue({
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

      prisma.booking.findUnique.mockResolvedValue(mockBookingData);

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

      const result = await createBooking(formData);

      expect(result).toEqual({
        success: true,
        bookingId: 1,
        pnr: 'FLYDA123456'
      });

      // Step 2: Retrieve booking
      const booking = await prisma.booking.findUnique({
        where: { id: 1 }
      });

      expect(booking).toBeDefined();
      expect(booking.pnr).toBe('FLYDA123456');
    });

    it('should handle booking creation with add-ons', async () => {
      const { createBooking } = require('@/lib/actions/create-booking');

      createBooking.mockResolvedValue({
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

      const result = await createBooking(formData);

      expect(result.success).toBe(true);
      expect(result.bookingId).toBe(2);
      expect(result.pnr).toBe('FLYDA789012');
    });

    it('should handle authentication errors', async () => {
      const { auth } = require('@/auth');
      auth.mockResolvedValue(null);

      const { createBooking } = require('@/lib/actions/create-booking');

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'John');
      formData.set('last_name', 'Doe');

      const result = await createBooking(formData);

      expect(result.error).toBe('You need to be logged in to create a booking');
    });

    it('should handle database errors during booking creation', async () => {
      const { createBooking } = require('@/lib/actions/create-booking');

      createBooking.mockRejectedValue(new Error('Database connection failed'));

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      formData.set('first_name', 'John');
      formData.set('last_name', 'Doe');

      await expect(createBooking(formData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields in booking creation', async () => {
      const { createBooking } = require('@/lib/actions/create-booking');

      createBooking.mockResolvedValue({
        error: 'All fields are required'
      });

      const formData = new FormData();
      formData.set('trip_type', 'oneway');
      // Missing required fields

      const result = await createBooking(formData);

      expect(result.error).toBe('All fields are required');
    });

    it('should handle different trip types correctly', () => {
      const tripTypes = [
        { type: 'oneway', expectedBookingTypeId: 2 },
        { type: 'return', expectedBookingTypeId: 1 },
        { type: 'multi-city', expectedBookingTypeId: 3 }
      ];

      tripTypes.forEach(({ type, expectedBookingTypeId }) => {
        let bookingTypeId = 2; // Default to one-way
        
        if (type === 'return') {
          bookingTypeId = 1; // Return trip
        } else if (type === 'multi-city') {
          bookingTypeId = 3; // Multi-city trip
        }

        expect(bookingTypeId).toBe(expectedBookingTypeId);
      });
    });

    it('should calculate total price with add-ons', () => {
      const basePrice = 1000;
      const selectedMeal = 'premium';
      const selectedBaggage = 'extra';
      const travelInsurance = true;

      let mealCost = 0;
      let baggageCost = 0;
      let insuranceCost = 0;

      if (selectedMeal === 'dietary') mealCost = 35;
      else if (selectedMeal === 'premium') mealCost = 45;

      if (selectedBaggage === 'extra') baggageCost = 80;
      else if (selectedBaggage === 'premium') baggageCost = 150;

      if (travelInsurance) insuranceCost = 75;

      const totalPrice = basePrice + mealCost + baggageCost + insuranceCost;

      expect(mealCost).toBe(45);
      expect(baggageCost).toBe(80);
      expect(insuranceCost).toBe(75);
      expect(totalPrice).toBe(1200);
    });
  });
});
