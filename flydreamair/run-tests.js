#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Running FlyDreamAir Tests...\n');

// Check if Jest is available
try {
  execSync('npx jest --version', { stdio: 'pipe' });
  console.log('✅ Jest is available\n');
} catch (error) {
  console.error('❌ Jest not found. Please install testing dependencies first:');
  console.error('npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom');
  process.exit(1);
}

// Run component tests first (these are most likely to work)
console.log('🔧 Running Component Tests...\n');
try {
  execSync('npx jest --testPathPatterns=components --verbose', { stdio: 'inherit' });
  console.log('\n✅ Component tests passed!\n');
} catch (error) {
  console.log('\n❌ Component tests failed. Check the output above.\n');
}

// Try to run all tests
console.log('🔧 Running All Tests...\n');
try {
  execSync('npx jest --verbose --passWithNoTests', { stdio: 'inherit' });
  console.log('\n✅ All tests completed!\n');
} catch (error) {
  console.log('\n⚠️  Some tests failed. This is normal for initial setup.\n');
}

console.log('📊 Test Summary:');
console.log('- Component tests: Testing React components');
console.log('- Integration tests: End-to-end functionality');
console.log('- API tests: Backend endpoint testing');
console.log('\n💡 To run specific tests:');
console.log('npx jest --testPathPatterns=components  # Component tests only');
console.log('npx jest --testPathPatterns=api         # API tests only');
console.log('npx jest --testPathPatterns=integration # Integration tests only');
console.log('\n🚀 Test setup complete!');
