# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in cookies.

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD"
  }
}
```

### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/logout
Logout current user (clears JWT cookie).

### GET /auth/me
Get current user information (Protected).

---

## Transactions

### GET /transactions
Get all transactions for current user (Protected).

**Query Parameters:**
- `type` - Filter by income/expense
- `category` - Filter by category ID
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `limit` - Number of results (default: 50)
- `page` - Page number

### POST /transactions
Create a new transaction (Protected).

**Request Body:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "category": "category_id",
  "description": "Groceries",
  "date": "2025-12-26",
  "paymentMethod": "credit_card"
}
```

### PUT /transactions/:id
Update existing transaction (Protected).

### DELETE /transactions/:id
Delete transaction (Protected).

---

## Categories

### GET /categories
Get all categories (Protected).

### POST /categories
Create custom category (Protected).

**Request Body:**
```json
{
  "name": "Custom Category",
  "type": "expense",
  "icon": "🏠",
  "color": "#ff6b6b"
}
```

### PUT /categories/:id
Update category (Protected).

### DELETE /categories/:id
Delete category (Protected).

---

## Budgets

### GET /budgets
Get all budgets (Protected).

### GET /budgets/alerts
Get budget alerts when overspending (Protected).

### POST /budgets
Create new budget (Protected).

**Request Body:**
```json
{
  "category": "category_id",
  "amount": 500,
  "period": "monthly",
  "month": 12,
  "year": 2025,
  "alertThreshold": 90
}
```

### PUT /budgets/:id
Update budget (Protected).

### DELETE /budgets/:id
Delete budget (Protected).

---

## Dashboard

### GET /dashboard/summary
Get financial summary with income, expense, balance, and recent transactions (Protected).

### GET /dashboard/trends
Get spending trends (Protected).

**Query Parameters:**
- `months` - Number of months (default: 6)

### GET /dashboard/insights
Get AI-generated financial insights and recommendations (Protected).

---

## Reports & Export

### GET /export/transactions/csv
Export transactions as CSV file (Protected).

**Query Parameters:**
- Same as GET /transactions

**Response:** CSV file download

### GET /export/report/pdf
Export financial report as PDF (Protected).

**Query Parameters:**
- Same as GET /transactions

**Response:** PDF file download

---

## Settings

###PUT /settings/profile
Update user profile (Protected).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "currency": "EUR"
}
```

### PUT /settings/password
Change password (Protected).

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### PUT /settings/preferences
Update user preferences (Protected).

**Request Body:**
```json
{
  "preferences": {
    "emailNotifications": true,
    "budgetAlerts": true,
    "weeklyReports": false,
    "theme": "dark"
  }
}
```

### DELETE /settings/account
Delete user account and all data (Protected).

---

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-12-26T..."
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
