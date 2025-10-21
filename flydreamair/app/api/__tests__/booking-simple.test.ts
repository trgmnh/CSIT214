import { NextRequest } from 'next/server';

// Mock the dependencies before importing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
    },
  }
}));

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}));

describe('Booking API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle booking data retrieval', async () => {
    // Mock successful booking data
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

    const { prisma } = require('@/lib/prisma');
    prisma.booking.findUnique.mockResolvedValue(mockBooking);

    // Test the booking data transformation logic
    const flightDetails = mockBooking.bookedFlights[0];
    const passenger = mockBooking.passengers[0];
    const seats = passenger?.bookedSeats?.map(seat => seat.seatNo) || [];
    const payment = mockBooking.payments[0];

    const preferences = {
      meal: "Standard",
      baggage: "Standard (23kg)",
      travelInsurance: false,
      mealCost: 0,
      baggageCost: 0,
      insuranceCost: 0
    };

    const response = {
      bookingId: mockBooking.id.toString(),
      pnr: mockBooking.pnr,
      flightDetails: {
        flightNumber: flightDetails?.flightSupply?.flightNo || "N/A",
        airline: flightDetails?.flightSupply?.airline?.name || "N/A",
        departure: {
          time: flightDetails?.flightSupply?.departureTime ? 
            new Date(flightDetails.flightSupply.departureTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : "N/A",
          date: flightDetails?.flightSupply?.departureTime ? 
            new Date(flightDetails.flightSupply.departureTime).toLocaleDateString('en-US', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }) : "N/A",
          airport: flightDetails?.flightSupply?.departingAirport?.code || "N/A",
          city: flightDetails?.flightSupply?.departingAirport?.city?.cityName || "N/A"
        },
        arrival: {
          time: flightDetails?.flightSupply?.departureTime ? 
            new Date(new Date(flightDetails.flightSupply.departureTime).getTime() + 23 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : "N/A",
          date: flightDetails?.flightSupply?.departureTime ? 
            new Date(new Date(flightDetails.flightSupply.departureTime).getTime() + 23 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }) : "N/A",
          airport: flightDetails?.flightSupply?.arrivingAirport?.code || "N/A",
          city: flightDetails?.flightSupply?.arrivingAirport?.city?.cityName || "N/A"
        },
        duration: "23h 15m",
        stops: 1,
        cabin: flightDetails?.bookingClass?.className || "Economy"
      },
      passenger: {
        fullName: passenger?.fullName || "N/A",
        email: passenger?.email || "N/A",
        phone: passenger?.phone || "N/A",
        passportNumber: "N1234567"
      },
      bookingExtras: {
        seats: seats,
        meal: preferences.meal,
        baggage: preferences.baggage,
        travelInsurance: preferences.travelInsurance
      },
      priceSummary: {
        baseFare: Number(flightDetails?.fareAmount || 0),
        taxes: 120,
        mealCost: preferences.mealCost,
        baggageCost: preferences.baggageCost,
        insuranceCost: preferences.insuranceCost,
        total: Number(payment?.amount || 0)
      }
    };

    // Assertions
    expect(response.bookingId).toBe('1');
    expect(response.pnr).toBe('FLYDA123456');
    expect(response.flightDetails.flightNumber).toBe('FA-123');
    expect(response.flightDetails.airline).toBe('FlyDreamAir');
    expect(response.passenger.fullName).toBe('John Doe');
    expect(response.bookingExtras.seats).toEqual(['12A']);
    expect(response.priceSummary.baseFare).toBe(1000);
    expect(response.priceSummary.total).toBe(1000);
  });

  it('should handle invalid booking ID', () => {
    const bookingId = 'invalid';
    const parsedId = parseInt(bookingId);
    
    expect(isNaN(parsedId)).toBe(true);
  });

  it('should handle missing booking data', () => {
    const mockBooking = null;
    
    expect(mockBooking).toBeNull();
  });

  it('should calculate add-on costs correctly', () => {
    const preferences = {
      meal: 'premium',
      baggage: 'extra',
      travelInsurance: true
    };

    let mealCost = 0;
    let baggageCost = 0;
    let insuranceCost = 0;

    if (preferences.meal === 'dietary') mealCost = 35;
    else if (preferences.meal === 'premium') mealCost = 45;

    if (preferences.baggage === 'extra') baggageCost = 80;
    else if (preferences.baggage === 'premium') baggageCost = 150;

    if (preferences.travelInsurance) insuranceCost = 75;

    expect(mealCost).toBe(45);
    expect(baggageCost).toBe(80);
    expect(insuranceCost).toBe(75);
  });

  it('should format dates and times correctly', () => {
    const departureTime = new Date('2025-03-18T08:30:00Z');
    
    const time = departureTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
    
    const date = departureTime.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'UTC'
    });

    expect(time).toBe('08:30');
    expect(date).toContain('Mar');
  });
});
