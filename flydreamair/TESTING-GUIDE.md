# FlyDreamAir Testing Guide


### Run All Working Tests
```bash
npx jest --testPathPatterns="components|confirm" --verbose
```

### Run Component Tests Only
```bash
npx jest --testPathPatterns=components --verbose
```

### Run Page Tests Only
```bash
npx jest --testPathPatterns=confirm --verbose
```

### Run with Coverage
```bash
npx jest --testPathPatterns="components|confirm" --coverage
```

## Test Results Summary

- **Component Tests**: 12/12 passed
- **Page Tests**: 8/8 passed
- **API Tests**: Need configuration fixes
- **Integration Tests**: Need configuration fixes

## 🔧 Troubleshooting

### If tests fail to run:
1. Make sure dependencies are installed:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
   ```

2. Clear Jest cache:
   ```bash
   npx jest --clearCache
   ```

The API tests need some additional configuration for Next.js server components.

## What's Tested

### PriceSummary Component
- ✅ Base price and taxes display
- ✅ Add-on cost calculations (meals, baggage, insurance)
- ✅ Selected seats display
- ✅ User interactions (button clicks)
- ✅ Terms and conditions

### Booking Confirmation Page
- ✅ Loading states
- ✅ Success notifications
- ✅ Flight details display
- ✅ Passenger information
- ✅ Booking extras
- ✅ Price summary
- ✅ Error handling
- ✅ Download ticket functionality



- Run tests before committing code
- Add tests for new components you create
- Use `--watch` mode during development: `npx jest --watch`
- Check coverage to see what's not tested: `npx jest --coverage`


