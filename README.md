# Personal Finance Tracker

A modern, industry-standard fullstack application for managing personal finances. Track expenses and income, set budgets, and gain insights into your financial health.

## 🌟 Features

### Core Features
- **User Authentication**: Secure signup/login with JWT
- **Transaction Management**: Add, edit, delete income and expenses
- **Category System**: Organize transactions by categories with custom icons
- **Budget Tracking**: Set monthly budgets with alert thresholds
- **Dashboard**: Interactive visual overview of financial health
- **Financial Insights**: AI-powered spending analysis and recommendations

### Advanced Features ✨
- **📊 Interactive Charts**: Recharts-powered data visualization
  - Spending trends over time
  - Category breakdown pie charts  
  - Monthly income vs expense comparison
- **📄 Reports & Export**: Generate and download reports
  - Export to CSV for spreadsheet analysis
  - PDF reports with professional formatting
  - Custom date range filtering
- **🔔 Smart Notifications**: Real-time toast notifications
  - Budget alerts at 90% and 100%
  - Success/error feedback
  - Transaction confirmations
- **⚙️ Comprehensive Settings**:
  - Profile management
  - Password change
  - Currency preferences (6 currencies)
  - Notification preferences
  - Dark/Light theme toggle
- **🎨 Enhanced UI/UX**:
  - Error boundary for graceful error handling
  - 404 custom page
  - Loading states
  - Smooth animations
  - Responsive design

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with design tokens

## 📁 Project Structure

```
sample-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, logger configuration
│   │   ├── models/         # Mongoose models
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── utils/          # Helper functions
│   │   ├── tests/          # Unit & integration tests
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── package.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js
├── package.json            # Root workspace config
├── .env.example            # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**

   ```bash
   cd sample-app
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB credentials (already provided in the template)

4. **Start the development servers**

   **Option 1: Run both together**

   ```bash
   npm run dev
   ```

   **Option 2: Run separately**

   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Transactions

- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets

- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/alerts` - Get budget alerts
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Dashboard

- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/trends` - Get spending trends
- `GET /api/dashboard/insights` - Get financial insights

### Reports & Export

- `GET /api/export/transactions/csv` - Export transactions as CSV
- `GET /api/export/report/pdf` - Export formatted PDF report

### Settings

- `PUT /api/settings/profile` - Update user profile
- `PUT /api/settings/password` - Change password
- `PUT /api/settings/preferences` - Update user preferences
- `DELETE /api/settings/account` - Delete account

### Health Check

- `GET /api/health` - API health status

## 🧪 Testing

### Backend Tests

Run all tests:

```bash
npm run test:backend
```

Run with coverage:

```bash
cd backend
npm run test:coverage
```

Run integration tests only:

```bash
cd backend
npm run test:integration
```

## 📊 Database Models

### User

- name, email, password (hashed)
- currency preference
- monthly budget

### Transaction

- type (income/expense)
- amount, category, description
- date, payment method
- user reference

### Category

- name, type, icon, color
- default/custom flag
- user reference

### Budget

- category, amount, period
- month, year
- spent amount, alert threshold
- user reference

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication with httpOnly cookies
- Input validation with Joi
- MongoDB injection prevention
- Rate limiting on API requests
- CORS configuration
- Helmet security headers

## 🎨 Default Categories

The app creates default categories on signup:

**Expense Categories:**

- Food & Dining 🍔
- Transportation 🚗
- Shopping 🛍️
- Entertainment 🎬
- Bills & Utilities 📱
- Healthcare 🏥
- Education 📚
- Other 📊

**Income Categories:**

- Salary 💰
- Freelance 💼
- Investment 📈
- Other Income 💵

## 👨‍💻 Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Environment Variables

Required variables in `.env`:

```
# MongoDB
MONGODB_USER=your_user
MONGODB_PASS=your_password
MONGODB_ATLAS_CLUSTER=your_cluster
MONGODB_APP_NAME=your_app_name

# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@financetracker.com
```

## 🐳 Docker (Optional)

Build and run with Docker:

```bash
docker-compose up
```

## 📱 Usage

1. **Sign Up**: Create a new account with email and password
2. **Add Transactions**: Record your income and expenses
3. **Set Budgets**: Create monthly budgets for different categories
4. **View Dashboard**: See your financial overview with insights
5. **Track Spending**: Monitor your expenses against budgets

## 🤝 Contributing

This is a sample application for demonstration purposes.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Built with industry-standard practices
- Follows RESTful API design principles
- Implements secure authentication patterns
- Uses modern React patterns and hooks

---

**Built with ❤️ for better financial management**
