# FlyDreamAir Testing Guide

This directory contains comprehensive tests for the FlyDreamAir flight booking application.

## Test Structure

```
__tests__/
├── integration/           # Integration tests for complete flows
├── setup/                # Test data setup and utilities
├── README.md             # This file
└── ...

app/
├── api/
│   ├── booking/
│   │   └── __tests__/    # API endpoint tests
│   └── create-booking/
│       └── __tests__/    # Booking creation tests
├── confirm/
│   └── __tests__/        # Confirmation page tests
└── ...

components/
└── __tests__/            # Component tests

lib/
└── actions/
    └── __tests__/        # Action function tests
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
npm test -- --testPathPattern=booking
npm test -- --testPathPattern=PriceSummary
```

## Test Categories

### 1. Unit Tests
- **Component Tests**: Test individual React components
- **Action Tests**: Test business logic functions
- **API Tests**: Test individual API endpoints

### 2. Integration Tests
- **Booking Flow**: Complete booking creation and confirmation flow
- **Data Validation**: End-to-end data validation
- **Error Handling**: Error scenarios and recovery

### 3. Database Tests
- **CRUD Operations**: Create, read, update, delete operations
- **Data Relationships**: Foreign key relationships and constraints
- **Transaction Handling**: Database transaction integrity

## Test Data Management

### Test Data Setup
The `__tests__/setup/test-data.ts` file provides utilities for:
- Creating test data (countries, cities, airports, airlines, etc.)
- Setting up test bookings with passengers and payments
- Cleaning up test data after tests

### Usage Example
```typescript
import { createTestData, cleanupTestData, createTestBooking } from '../setup/test-data';

beforeEach(async () => {
  await createTestData();
});

afterEach(async () => {
  await cleanupTestData();
});

it('should create a booking', async () => {
  const { booking } = await createTestBooking();
  expect(booking.pnr).toBeDefined();
});
```

## Key Test Scenarios

### Booking Creation Tests
- ✅ Valid booking creation with all required fields
- ✅ Add-on cost calculations (meals, baggage, insurance)
- ✅ Different trip types (one-way, return, multi-city)
- ✅ Authentication requirements
- ✅ Field validation and error handling
- ✅ Database transaction integrity

### Booking Confirmation Tests
- ✅ Successful booking data retrieval
- ✅ Flight details display
- ✅ Passenger information display
- ✅ Booking extras display
- ✅ Price summary with add-ons
- ✅ Success notification
- ✅ Error handling for missing bookings

### Component Tests
- ✅ PriceSummary component with add-ons
- ✅ Seat selection functionality
- ✅ Form validation
- ✅ User interactions
- ✅ Responsive design

### API Endpoint Tests
- ✅ GET /api/booking/[id] - Retrieve booking data
- ✅ POST /api/create-booking - Create new booking
- ✅ Error handling for invalid requests
- ✅ Authentication requirements
- ✅ Data validation

## Mocking Strategy

### External Dependencies
- **Next.js Router**: Mocked for navigation testing
- **Authentication**: Mocked auth state for different scenarios
- **Database**: Prisma client mocked for unit tests
- **Fetch API**: Mocked for API calls

### Test Environment
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Supertest**: API endpoint testing
- **jsdom**: Browser environment simulation

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Best Practices

### Test Organization
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function/component being tested
3. **Assert**: Verify the expected outcomes

### Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Clear, descriptive names
- Test groups: Logical grouping with `describe` blocks

### Mock Management
- Reset mocks between tests
- Use specific mock implementations
- Avoid over-mocking
- Test both success and error scenarios

### Data Isolation
- Use unique test data for each test
- Clean up after tests
- Avoid shared state between tests
- Use database transactions where possible

## Debugging Tests

### Common Issues
1. **Async/Await**: Ensure proper handling of asynchronous operations
2. **Mock Timing**: Use `waitFor` for async component updates
3. **Database State**: Ensure clean database state between tests
4. **Authentication**: Mock auth state appropriately

### Debug Commands
```bash
# Run specific test with verbose output
npm test -- --verbose --testNamePattern="should create booking"

# Run tests with debugging
npm test -- --detectOpenHandles --forceExit

# Run tests with coverage and debugging
npm run test:coverage -- --verbose
```

## Continuous Integration

### GitHub Actions (if using)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
```

## Performance Testing

### Load Testing
- Test booking creation under load
- Test concurrent user scenarios
- Test database performance with large datasets

### Memory Testing
- Monitor memory usage during tests
- Test for memory leaks in components
- Test database connection pooling

## Security Testing

### Authentication
- Test unauthorized access attempts
- Test session management
- Test role-based access control

### Data Validation
- Test SQL injection prevention
- Test XSS prevention
- Test input sanitization

## Future Enhancements

### Planned Test Additions
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Security vulnerability tests
- [ ] Accessibility tests
- [ ] Mobile responsiveness tests

### Test Automation
- [ ] Automated test data generation
- [ ] Test result reporting
- [ ] Flaky test detection
- [ ] Test parallelization
