import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import BookingConfirmPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

// Mock fetch
global.fetch = jest.fn();

describe('BookingConfirmPage', () => {
  const mockBookingData = {
    bookingId: '1',
    pnr: 'FLYDA123456',
    flightDetails: {
      flightNumber: 'FA-123',
      airline: 'FlyDreamAir',
      departure: {
        time: '08:30',
        date: 'Sat, 15 Nov 2025',
        airport: 'SYD',
        city: 'Sydney'
      },
      arrival: {
        time: '20:45',
        date: 'Sun, 16 Nov 2025',
        airport: 'LHR',
        city: 'London'
      },
      duration: '23h 15m',
      stops: 1,
      cabin: 'Economy'
    },
    passenger: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+61 412 345 678',
      passportNumber: 'N1234567'
    },
    bookingExtras: {
      seats: ['12A'],
      meal: 'Standard',
      baggage: 'Standard (23kg)',
      travelInsurance: false
    },
    priceSummary: {
      baseFare: 1299,
      taxes: 120,
      mealCost: 0,
      baggageCost: 0,
      insuranceCost: 0,
      total: 1419
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should show loading state initially', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BookingConfirmPage />);

    expect(screen.getByText('Loading booking confirmation...')).toBeInTheDocument();
  });

  it('should show error when no booking data is found', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('No booking data found.')).toBeInTheDocument();
    });
  });

  it('should display booking confirmation with all details', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingData)
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      // Check header
      expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Reference: FLYDA123456')).toBeInTheDocument();

      // Check flight details
      expect(screen.getByText('Flight Details')).toBeInTheDocument();
      expect(screen.getByText('FlyDreamAir • FA-123')).toBeInTheDocument();
      expect(screen.getByText('08:30')).toBeInTheDocument();
      expect(screen.getByText('20:45')).toBeInTheDocument();
      expect(screen.getByText('SYD')).toBeInTheDocument();
      expect(screen.getByText('LHR')).toBeInTheDocument();

      // Check passenger information
      expect(screen.getByText('Passenger Information')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+61 412 345 678')).toBeInTheDocument();

      // Check booking extras
      expect(screen.getByText('Booking Extras')).toBeInTheDocument();
      expect(screen.getByText('12A')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Standard (23kg)')).toBeInTheDocument();

      // Check price summary
      expect(screen.getByText('Price Summary')).toBeInTheDocument();
      expect(screen.getByText('AUD 1299')).toBeInTheDocument();
      expect(screen.getByText('AUD 120')).toBeInTheDocument();
      expect(screen.getByText('AUD 1419')).toBeInTheDocument();

      // Check quick actions
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Modify Booking')).toBeInTheDocument();
      expect(screen.getByText('Change Dates')).toBeInTheDocument();
      expect(screen.getByText('Add Baggage')).toBeInTheDocument();
      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();

      // Check support section
      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(screen.getByText('Our support team is available 24/7')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });
  });

  it('should show success notification when booking data loads', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingData)
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Your flight has been successfully booked')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('No booking data found.')).toBeInTheDocument();
    });
  });

  it('should display download ticket button', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingData)
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('Download Ticket')).toBeInTheDocument();
    });
  });

  it('should show cabin class badge', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingData)
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('Economy')).toBeInTheDocument();
    });
  });

  it('should display flight duration and stops', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?bookingId=1'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingData)
    });

    render(<BookingConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('23h 15m')).toBeInTheDocument();
      expect(screen.getByText('1 stop')).toBeInTheDocument();
    });
  });
});
