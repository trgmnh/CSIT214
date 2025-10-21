import { prisma } from '@/lib/prisma';

export const createTestData = async () => {
  // Create test countries
  const australia = await prisma.country.create({
    data: { countryName: 'Australia' }
  });

  const uk = await prisma.country.create({
    data: { countryName: 'United Kingdom' }
  });

  // Create test cities
  const sydney = await prisma.city.create({
    data: {
      cityName: 'Sydney',
      countryId: australia.id
    }
  });

  const london = await prisma.city.create({
    data: {
      cityName: 'London',
      countryId: uk.id
    }
  });

  // Create test airports
  const sydAirport = await prisma.airport.create({
    data: {
      cityId: sydney.id,
      code: 'SYD',
      name: 'Sydney Kingsford Smith Airport'
    }
  });

  const lhrAirport = await prisma.airport.create({
    data: {
      cityId: london.id,
      code: 'LHR',
      name: 'London Heathrow Airport'
    }
  });

  // Create test airline
  const flydreamair = await prisma.airline.create({
    data: { name: 'FlyDreamAir' }
  });

  // Create booking classes
  const economy = await prisma.bookingClass.create({
    data: {
      className: 'Economy',
      itemOrder: 1
    }
  });

  const business = await prisma.bookingClass.create({
    data: {
      className: 'Business',
      itemOrder: 2
    }
  });

  // Create booking types
  const oneWay = await prisma.bookingType.create({
    data: { typeName: 'One-way' }
  });

  const returnTrip = await prisma.bookingType.create({
    data: { typeName: 'Return' }
  });

  const multiCity = await prisma.bookingType.create({
    data: { typeName: 'Multi-city' }
  });

  // Create test flight supply
  const flightSupply = await prisma.flightSupply.create({
    data: {
      flightNo: 'FA-123',
      airlineId: flydreamair.id,
      departureTime: new Date('2025-03-18T08:30:00Z'),
      departingAirportId: sydAirport.id,
      arrivingAirportId: lhrAirport.id
    }
  });

  // Create seat supplies
  await prisma.seatSupply.create({
    data: {
      flightSupplyId: flightSupply.id,
      bookingClassId: economy.id,
      noSeats: 100,
      basePrice: 1000,
      currency: 'AUD'
    }
  });

  await prisma.seatSupply.create({
    data: {
      flightSupplyId: flightSupply.id,
      bookingClassId: business.id,
      noSeats: 20,
      basePrice: 2500,
      currency: 'AUD'
    }
  });

  return {
    countries: { australia, uk },
    cities: { sydney, london },
    airports: { sydAirport, lhrAirport },
    airline: flydreamair,
    bookingClasses: { economy, business },
    bookingTypes: { oneWay, returnTrip, multiCity },
    flightSupply
  };
};

export const cleanupTestData = async () => {
  // Delete in reverse order to handle foreign key constraints
  await prisma.bookedSeat.deleteMany();
  await prisma.bookedFlight.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seatSupply.deleteMany();
  await prisma.flightSupply.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.bookingClass.deleteMany();
  await prisma.bookingType.deleteMany();
};

export const createTestBooking = async (userId: string = 'test-user-id') => {
  const testData = await createTestData();
  
  const booking = await prisma.booking.create({
    data: {
      userId,
      bookingTypeId: testData.bookingTypes.oneWay.id,
      pnr: 'FLYDA123456'
    }
  });

  const passenger = await prisma.passenger.create({
    data: {
      bookingId: booking.id,
      fullName: 'John Doe',
      dob: new Date('1990-01-01'),
      email: 'john@example.com',
      phone: '+1234567890'
    }
  });

  const bookedFlight = await prisma.bookedFlight.create({
    data: {
      bookingId: booking.id,
      flightSupplyId: testData.flightSupply.id,
      bookingClassId: testData.bookingClasses.economy.id,
      fareAmount: 1000,
      fareCurrency: 'AUD'
    }
  });

  await prisma.bookedSeat.create({
    data: {
      bookedFlightId: bookedFlight.id,
      passengerId: passenger.id,
      seatNo: '12A'
    }
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: 1000,
      currency: 'AUD',
      method: 'CARD-MOCK',
      status: 'SUCCESS',
      txRef: 'TXN_123456'
    }
  });

  return { booking, passenger, bookedFlight, testData };
};
