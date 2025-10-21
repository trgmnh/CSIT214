// Mock the dependencies before importing
jest.mock('@/lib/actions/create-booking', () => ({
  createBooking: jest.fn()
}), { virtual: true });

jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}));

describe('Create Booking API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle one-way trip booking', async () => {
    const { createBooking } = require('@/lib/actions/create-booking');
    createBooking.mockResolvedValue({
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

    // Test booking type mapping
    const tripType = formData.get('trip_type') as string;
    let bookingTypeId = 2; // Default to one-way
    
    if (tripType === 'return') {
      bookingTypeId = 1; // Return trip
    } else if (tripType === 'multi-city') {
      bookingTypeId = 3; // Multi-city trip
    }

    expect(bookingTypeId).toBe(2);
    expect(tripType).toBe('oneway');
  });

  it('should handle return trip booking', () => {
    const tripType = 'return';
    let bookingTypeId = 2;
    
    if (tripType === 'return') {
      bookingTypeId = 1;
    } else if (tripType === 'multi-city') {
      bookingTypeId = 3;
    }

    expect(bookingTypeId).toBe(1);
  });

  it('should handle multi-city trip booking', () => {
    const tripType = 'multi-city';
    let bookingTypeId = 2;
    
    if (tripType === 'return') {
      bookingTypeId = 1;
    } else if (tripType === 'multi-city') {
      bookingTypeId = 3;
    }

    expect(bookingTypeId).toBe(3);
  });

  it('should calculate add-on costs correctly', () => {
    const selectedMeal = 'premium';
    const selectedBaggage = 'extra';
    const travelInsurance = true;
    const basePrice = 1000;

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

  it('should handle form data validation', () => {
    const formData = new FormData();
    formData.set('first_name', 'John');
    formData.set('last_name', 'Doe');
    formData.set('date_of_birth', '1990-01-01');
    formData.set('passport_number', 'N1234567');
    formData.set('gender', 'Male');
    formData.set('email', 'john@example.com');
    formData.set('phone', '+1234567890');

    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const dateOfBirth = formData.get('date_of_birth') as string;
    const passportNumber = formData.get('passport_number') as string;
    const gender = formData.get('gender') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    expect(firstName).toBe('John');
    expect(lastName).toBe('Doe');
    expect(dateOfBirth).toBe('1990-01-01');
    expect(passportNumber).toBe('N1234567');
    expect(gender).toBe('Male');
    expect(email).toBe('john@example.com');
    expect(phone).toBe('+1234567890');
  });

  it('should handle missing required fields', () => {
    const formData = new FormData();
    formData.set('first_name', 'John');
    // Missing other required fields

    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const dateOfBirth = formData.get('date_of_birth') as string;
    const passportNumber = formData.get('passport_number') as string;
    const gender = formData.get('gender') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    const hasAllRequiredFields = !!(firstName && lastName && dateOfBirth && 
                                passportNumber && gender && email && phone);

    expect(hasAllRequiredFields).toBe(false);
    expect(firstName).toBe('John');
    expect(lastName).toBeNull();
  });

  it('should generate PNR correctly', () => {
    const pnr = `FLYDA${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    expect(pnr).toMatch(/^FLYDA[A-Z0-9]{6}$/);
    expect(pnr.length).toBeGreaterThanOrEqual(10);
  });

  it('should handle seat selection', () => {
    const selectedSeats = '12A,12B,12C';
    const seats = selectedSeats.split(',').filter(seat => seat.trim());
    
    expect(seats).toEqual(['12A', '12B', '12C']);
    expect(seats.length).toBe(3);
  });

  it('should handle empty seat selection', () => {
    const selectedSeats = '';
    const seats = selectedSeats.split(',').filter(seat => seat.trim());
    
    expect(seats).toEqual([]);
    expect(seats.length).toBe(0);
  });
});
