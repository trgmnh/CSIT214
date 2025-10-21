import { render, screen, fireEvent } from '@testing-library/react';
import PriceSummary from '../PriceSummary';

describe('PriceSummary', () => {
  const defaultProps = {
    basePrice: 1000,
    taxes: 120,
    selectedSeats: ['12A', '12B'],
    selectedMeal: 'standard',
    selectedBaggage: 'standard',
    travelInsurance: false,
    onContinue: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render price summary with base fare and taxes', () => {
    render(<PriceSummary {...defaultProps} />);

    expect(screen.getByText('Base Fare')).toBeInTheDocument();
    expect(screen.getByText('AUD 1000')).toBeInTheDocument();
    expect(screen.getByText('Taxes & Fees')).toBeInTheDocument();
    expect(screen.getByText('AUD 120')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('AUD 1120')).toBeInTheDocument();
  });

  it('should show selected seats', () => {
    render(<PriceSummary {...defaultProps} />);

    expect(screen.getByText('Selected Seats')).toBeInTheDocument();
    expect(screen.getByText('12A')).toBeInTheDocument();
    expect(screen.getByText('12B')).toBeInTheDocument();
  });

  it('should not show add-ons when they are standard/included', () => {
    render(<PriceSummary {...defaultProps} />);

    expect(screen.queryByText('Meal Selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Baggage Upgrade')).not.toBeInTheDocument();
    expect(screen.queryByText('Travel Insurance')).not.toBeInTheDocument();
  });

  it('should show premium meal cost when selected', () => {
    render(<PriceSummary {...defaultProps} selectedMeal="premium" />);

    expect(screen.getByText('Meal Selection')).toBeInTheDocument();
    expect(screen.getByText('AUD 45')).toBeInTheDocument();
    expect(screen.getByText('AUD 1165')).toBeInTheDocument(); // 1000 + 120 + 45
  });

  it('should show dietary meal cost when selected', () => {
    render(<PriceSummary {...defaultProps} selectedMeal="dietary" />);

    expect(screen.getByText('Meal Selection')).toBeInTheDocument();
    expect(screen.getByText('AUD 35')).toBeInTheDocument();
    expect(screen.getByText('AUD 1155')).toBeInTheDocument(); // 1000 + 120 + 35
  });

  it('should show extra baggage cost when selected', () => {
    render(<PriceSummary {...defaultProps} selectedBaggage="extra" />);

    expect(screen.getByText('Baggage Upgrade')).toBeInTheDocument();
    expect(screen.getByText('AUD 80')).toBeInTheDocument();
    expect(screen.getByText('AUD 1200')).toBeInTheDocument(); // 1000 + 120 + 80
  });

  it('should show premium baggage cost when selected', () => {
    render(<PriceSummary {...defaultProps} selectedBaggage="premium" />);

    expect(screen.getByText('Baggage Upgrade')).toBeInTheDocument();
    expect(screen.getByText('AUD 150')).toBeInTheDocument();
    expect(screen.getByText('AUD 1270')).toBeInTheDocument(); // 1000 + 120 + 150
  });

  it('should show travel insurance cost when selected', () => {
    render(<PriceSummary {...defaultProps} travelInsurance={true} />);

    expect(screen.getByText('Travel Insurance')).toBeInTheDocument();
    expect(screen.getByText('AUD 75')).toBeInTheDocument();
    expect(screen.getByText('AUD 1195')).toBeInTheDocument(); // 1000 + 120 + 75
  });

  it('should show all add-ons when multiple are selected', () => {
    render(
      <PriceSummary 
        {...defaultProps} 
        selectedMeal="premium"
        selectedBaggage="extra"
        travelInsurance={true}
      />
    );

    expect(screen.getByText('Meal Selection')).toBeInTheDocument();
    expect(screen.getByText('AUD 45')).toBeInTheDocument();
    expect(screen.getByText('Baggage Upgrade')).toBeInTheDocument();
    expect(screen.getByText('AUD 80')).toBeInTheDocument();
    expect(screen.getByText('Travel Insurance')).toBeInTheDocument();
    expect(screen.getByText('AUD 75')).toBeInTheDocument();
    expect(screen.getByText('AUD 1320')).toBeInTheDocument(); // 1000 + 120 + 45 + 80 + 75
  });

  it('should call onContinue when continue button is clicked', () => {
    const mockOnContinue = jest.fn();
    render(<PriceSummary {...defaultProps} onContinue={mockOnContinue} />);

    const continueButton = screen.getByText('Continue to Payment');
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('should not show selected seats when no seats are selected', () => {
    render(<PriceSummary {...defaultProps} selectedSeats={[]} />);

    expect(screen.queryByText('Selected Seats')).not.toBeInTheDocument();
  });

  it('should display terms and conditions', () => {
    render(<PriceSummary {...defaultProps} />);

    expect(screen.getByText('By continuing, you agree to our Terms & Conditions')).toBeInTheDocument();
  });
});
