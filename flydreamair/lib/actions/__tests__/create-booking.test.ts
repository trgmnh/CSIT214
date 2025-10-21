import { createBooking } from '../create-booking';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Mock the dependencies
jest.mock('@/lib/prisma');
jest.mock('@/auth');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('createBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication
    mockAuth.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    } as any);
  });

  it('should create a booking successfully with all required fields', async () => {
    // Mock Prisma responses
    mockPrisma.booking.create.mockResolvedValue({
      id: 1,
      userId: 'test-user-id',
      bookingTypeId: 2,
      pnr: 'FLYDA123456',
      createdAt: new Date(),
    } as any);

    mockPrisma.passenger.create.mockResolvedValue({
      id: 1,
      bookingId: 1,
      fullName: 'John Doe',
      dob: new Date('1990-01-01'),
      email: 'john@example.com',
      phone: '+1234567890',
    } as any);

    mockPrisma.bookedFlight.create.mockResolvedValue({
      id: 1,
      bookingId: 1,
      flightSupplyId: 1,
      bookingClassId: 1,
      fareAmount: 1000,
      fareCurrency: 'AUD',
    } as any);

    mockPrisma.bookedSeat.create.mockResolvedValue({
      bookedFlightId: 1,
      passengerId: 1,
      seatNo: '12A',
    } as any);

    mockPrisma.payment.create.mockResolvedValue({
      id: 1,
      bookingId: 1,
      amount: 1000,
      currency: 'AUD',
      method: 'CARD-MOCK',
      status: 'SUCCESS',
      txRef: 'TXN_123456',
      paidAt: new Date(),
    } as any);

    // Create form data
    const formData = new FormData();
    formData.set('first_name', 'John');
    formData.set('last_name', 'Doe');
    formData.set('date_of_birth', '1990-01-01');
    formData.set('passport_number', 'N1234567');
    formData.set('gender', 'Male');
    formData.set('email', 'john@example.com');
    formData.set('phone', '+1234567890');
    formData.set('booking_type_id', '2');
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
      pnr: expect.stringMatching(/^FLYDA[A-Z0-9]{6}$/)
    });

    // Verify Prisma calls
    expect(mockPrisma.booking.create).toHaveBeenCalledWith({
      data: {
        userId: 'test-user-id',
        bookingTypeId: 2,
        pnr: expect.stringMatching(/^FLYDA[A-Z0-9]{6}$/),
      },
    });

    expect(mockPrisma.passenger.create).toHaveBeenCalled();
    expect(mockPrisma.bookedFlight.create).toHaveBeenCalled();
    expect(mockPrisma.bookedSeat.create).toHaveBeenCalled();
    expect(mockPrisma.payment.create).toHaveBeenCalled();
  });

  it('should calculate add-on costs correctly', async () => {
    // Mock Prisma responses
    mockPrisma.booking.create.mockResolvedValue({ id: 1 } as any);
    mockPrisma.passenger.create.mockResolvedValue({ id: 1 } as any);
    mockPrisma.bookedFlight.create.mockResolvedValue({ id: 1 } as any);
    mockPrisma.bookedSeat.create.mockResolvedValue({} as any);
    mockPrisma.payment.create.mockResolvedValue({} as any);

    // Test with premium meal and extra baggage
    const formData = new FormData();
    formData.set('first_name', 'John');
    formData.set('last_name', 'Doe');
    formData.set('date_of_birth', '1990-01-01');
    formData.set('passport_number', 'N1234567');
    formData.set('gender', 'Male');
    formData.set('email', 'john@example.com');
    formData.set('phone', '+1234567890');
    formData.set('booking_type_id', '2');
    formData.set('price', '1000');
    formData.set('selected_meal', 'premium');
    formData.set('selected_baggage', 'extra');
    formData.set('travel_insurance', 'true');

    await createBooking(formData);

    // Verify payment was created with correct total (1000 + 45 + 80 + 75 = 1200)
    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        bookingId: 1,
        amount: 1200, // 1000 + 45 (premium meal) + 80 (extra baggage) + 75 (insurance)
        currency: 'AUD',
        method: 'CARD-MOCK',
        status: 'SUCCESS',
        txRef: expect.any(String),
      },
    });
  });

  it('should return error when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const formData = new FormData();
    formData.set('first_name', 'John');
    formData.set('last_name', 'Doe');

    const result = await createBooking(formData);

    expect(result).toEqual({
      error: 'You need to be logged in to create a booking'
    });
  });

  it('should return error when required fields are missing', async () => {
    const formData = new FormData();
    formData.set('first_name', 'John');
    // Missing last_name, date_of_birth, etc.

    const result = await createBooking(formData);

    expect(result).toEqual({
      error: 'All fields are required'
    });
  });

  it('should handle database errors gracefully', async () => {
    mockPrisma.booking.create.mockRejectedValue(new Error('Database error'));

    const formData = new FormData();
    formData.set('first_name', 'John');
    formData.set('last_name', 'Doe');
    formData.set('date_of_birth', '1990-01-01');
    formData.set('passport_number', 'N1234567');
    formData.set('gender', 'Male');
    formData.set('email', 'john@example.com');
    formData.set('phone', '+1234567890');
    formData.set('booking_type_id', '2');
    formData.set('price', '1000');

    await expect(createBooking(formData)).rejects.toThrow('Database error');
  });
});
