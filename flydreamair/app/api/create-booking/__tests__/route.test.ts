import { POST } from '../route';
import { createBooking } from '@/lib/actions/create-booking';
import { NextRequest } from 'next/server';

// Mock the createBooking action
jest.mock('@/lib/actions/create-booking');
const mockCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>;

describe('/api/create-booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create booking successfully for one-way trip', async () => {
    mockCreateBooking.mockResolvedValue({
      success: true,
      bookingId: 1,
      pnr: 'FLYDA123456'
    });

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

    const request = new NextRequest('http://localhost:3000/api/create-booking', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(307); // Redirect status
    expect(mockCreateBooking).toHaveBeenCalledWith(expect.any(FormData));
    
    // Check that booking_type_id was set correctly for one-way
    const calledFormData = mockCreateBooking.mock.calls[0][0];
    expect(calledFormData.get('booking_type_id')).toBe('2');
  });

  it('should create booking successfully for return trip', async () => {
    mockCreateBooking.mockResolvedValue({
      success: true,
      bookingId: 1,
      pnr: 'FLYDA123456'
    });

    const formData = new FormData();
    formData.set('trip_type', 'return');
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

    const response = await POST(request);

    expect(response.status).toBe(307);
    
    // Check that booking_type_id was set correctly for return
    const calledFormData = mockCreateBooking.mock.calls[0][0];
    expect(calledFormData.get('booking_type_id')).toBe('1');
  });

  it('should create booking successfully for multi-city trip', async () => {
    mockCreateBooking.mockResolvedValue({
      success: true,
      bookingId: 1,
      pnr: 'FLYDA123456'
    });

    const formData = new FormData();
    formData.set('trip_type', 'multi-city');
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

    const response = await POST(request);

    expect(response.status).toBe(307);
    
    // Check that booking_type_id was set correctly for multi-city
    const calledFormData = mockCreateBooking.mock.calls[0][0];
    expect(calledFormData.get('booking_type_id')).toBe('3');
  });

  it('should return 400 when createBooking returns error', async () => {
    mockCreateBooking.mockResolvedValue({
      error: 'All fields are required'
    });

    const formData = new FormData();
    formData.set('trip_type', 'oneway');

    const request = new NextRequest('http://localhost:3000/api/create-booking', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('All fields are required');
  });

  it('should return 500 when createBooking throws error', async () => {
    mockCreateBooking.mockRejectedValue(new Error('Database connection failed'));

    const formData = new FormData();
    formData.set('trip_type', 'oneway');

    const request = new NextRequest('http://localhost:3000/api/create-booking', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create booking');
  });

  it('should redirect to confirm page with booking ID', async () => {
    mockCreateBooking.mockResolvedValue({
      success: true,
      bookingId: 123,
      pnr: 'FLYDA123456'
    });

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

    const request = new NextRequest('http://localhost:3000/api/create-booking', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/confirm?bookingId=123');
  });
});
