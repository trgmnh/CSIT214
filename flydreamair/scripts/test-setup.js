#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Setting up FlyDreamAir test environment...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Check if test database is configured
const envPath = path.join(process.cwd(), '.env.test');
if (!fs.existsSync(envPath)) {
  console.log('🔧 Creating test environment configuration...');
  const testEnvContent = `# Test Database Configuration
DATABASE_URL="postgresql://test:test@localhost:5432/flydreamair_test?schema=public"

# Test Environment
NODE_ENV=test
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"
`;
  
  fs.writeFileSync(envPath, testEnvContent);
  console.log('✅ Test environment file created\n');
}

// Run database setup if needed
console.log('🗄️  Setting up test database...');
try {
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
} catch (error) {
  console.warn('⚠️  Prisma setup may need manual configuration');
}

console.log('🎯 Running tests...\n');

// Run the tests
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.log('\n❌ Some tests failed. Check the output above for details.');
  process.exit(1);
}

console.log('\n📊 Test Summary:');
console.log('- Unit tests: Component and function testing');
console.log('- Integration tests: End-to-end booking flow');
console.log('- API tests: Endpoint functionality');
console.log('- Database tests: Data persistence and relationships');
console.log('\n🚀 Ready for development!');
