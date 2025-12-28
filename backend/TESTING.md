# Test Coverage - Personal Finance Tracker Backend

## Running Tests

### Standard Test Suite (177 tests)
Run all unit and integration tests with in-memory MongoDB:
```bash
npm run test:backend
```

### Test Coverage Report
Generate a detailed coverage report:
```bash
cd backend
npm run test:coverage
```

### Watch Mode (Development)
Run tests in watch mode for active development:
```bash
cd backend
npm run test:watch
```

## Test Organization

### Unit Tests (`src/tests/unit/`)
- **Models** (104 tests): Budget, Category, User, Transaction
- **Middleware** (60 tests): Auth, Validation, Error Handler  
- **Utilities** (42 tests): Helper functions

### Integration Tests (`src/tests/integration/`)
- **Auth API** (9 tests): Signup, login, protected routes
- **Transaction API** (10 tests): CRUD operations, filtering, pagination

### Database Connection Tests (`src/tests/integration/database.test.js`)
**⚠️ Excluded from standard runs** - Require real MongoDB Atlas connection

These 14 tests validate the actual production database connection and should be run separately during deployment validation.

## Testing Real MongoDB Connection

The database connection tests verify:
- MongoDB Atlas connectivity
- Environment variable configuration
- Connection state management
- CRUD operations with real database
- Connection error handling

### Run Database Tests:
```bash
# Ensure environment variables are configured in .env:
# MONGO_USER, MONGODB_PASS, MONGODB_ATLAS_CLUSTER, MONGODB_APP_NAME

cd backend
npm test -- database.test.js
```

## Test Configuration

Tests use:
- **Jest** - Test framework
- **mongodb-memory-server** - In-memory MongoDB for fast testing
- **Supertest** - HTTP assertion library for API testing
- **Custom ES Module mocks** - Chainable mock functions for middleware testing

## Current Test Coverage

- ✅ 177 passing tests
- ✅ 100% model coverage (4/4 models)
- ✅ 75% middleware coverage (3/4 components)
- ✅ 100% utility coverage (1/1 modules)
- ✅ 29% controller coverage (2/7 controllers)

## Next Steps

Optional improvements:
- Budget controller integration tests
- Category controller integration tests  
- Dashboard controller integration tests
- Export controller integration tests
- Settings controller integration tests
- Rate limiter middleware tests
