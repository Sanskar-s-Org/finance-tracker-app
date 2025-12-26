# Personal Finance Tracker - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Transactions](#managing-transactions)
4. [Setting Budgets](#setting-budgets)
5. [Viewing Reports](#viewing-reports)
6. [Settings](#settings)

---

## Getting Started

### Creating an Account

1. Navigate to the application at `http://localhost:5173`
2. Click **Sign Up**
3. Fill in your details:
   - Name
   - Email address
   - Password (minimum 6 characters)
   - Preferred currency
4. Click **Create Account**

### Logging In

1. Enter your email and password
2. Click **Login**
3. You'll be redirected to your Dashboard

---

## Dashboard

The Dashboard provides a complete overview of your financial health.

### Key Features:

**Summary Cards**
- **Total Income** - All income this month
- **Total Expenses** - All spending this month
- **Net Balance** - Income minus expenses

**Financial Insights**
- AI-powered recommendations based on your spending
- Budget alerts when approaching limits
- Spending pattern analysis

**Spending by Category**
- Visual breakdown of expenses by category
- Percentage of total spending
- Number of transactions per category

**Recent Transactions**
- Latest 10 transactions
- Quick overview of recent activity

**Refresh Button**
- Click to reload all dashboard data

---

## Managing Transactions

### Adding a Transaction

1. Go to **Transactions** page
2. Click **➕ Add Transaction**
3. Fill in transaction details:
   - **Type**: Income or Expense
   - **Amount**: Transaction value
   - **Category**: Select from dropdown
   - **Description**: Optional details
   - **Date**: Transaction date
   - **Payment Method**: Cash, Credit Card, etc.
4. Click **Add Transaction**

### Viewing Transactions

- All transactions are listed in chronological order
- Each shows:
  - Date
  - Category with icon
  - Description
  - Amount (green for income, red for expenses)

### Editing a Transaction

1. Find the transaction in the list
2. Click **Edit** button
3. Update desired fields
4. Click **Save Changes**

### Deleting a Transaction

1. Find the transaction
2. Click **Delete** button
3. Confirm deletion

### Filtering Transactions

Use the filter options to find specific transactions:
- **Date Range**: Start and end dates
- **Type**: Income or Expense
- **Category**: Specific category
- **Search**: Search by description

---

## Setting Budgets

Budgets help you control spending in specific categories.

### Creating a Budget

1. Go to **Budgets** page
2. Click **Create Budget**
3. Set budget details:
   - **Category**: What to budget for
   - **Amount**: Monthly limit
   - **Month & Year**: Time period
   - **Alert Threshold**: Warning percentage (e.g., 90%)
4. Click **Create**

### Monitoring Budgets

Each budget card shows:
- Category name and icon
- Amount spent / Budget limit
- Progress bar (changes color when approaching limit)
- Percentage used
- Warning alerts at 90% and 100%

### Budget Alerts

- **Yellow Warning**: 90% of budget used
- **Red Alert**: Budget exceeded
- Email notifications (if enabled in settings)

### Editing/Deleting Budgets

- Click **Edit** to modify budget amount or period
- Click **Delete** to remove budget

---

## Viewing Reports

The Reports page provides advanced analysis and export options.

### Generating Reports

1. Go to **Reports** page
2. Set filter criteria:
   - Start Date
   - End Date
   - Category (optional)
   - Type (optional)
3. Click **🔍 Generate Report**

### Report Summary

View totals for the selected period:
- Total Income
- Total Expenses
- Net Balance

### Exporting Data

**CSV Export**
1. Set your filters
2. Click **📄 Export as CSV**
3. Open in Excel or Google Sheets for analysis

**PDF Report**
1. Set your filters
2. Click **📑 Export PDF Report**
3. Get a professionally formatted report with:
   - Summary statistics
   - Transaction list
   - Period information

**Use Cases:**
- Tax preparation
- Financial planning
- Expense reimbursement
- Personal records

---

## Settings

Customize your experience in the Settings page.

### Profile Settings

Update your personal information:
- Name
- Email address
- Currency preference

### Password

Change your account password:
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click **Update Password**

### Preferences

**Notifications**
- Email Notifications (on/off)
- Budget Alerts (on/off)
- Weekly Summary Reports (on/off)

**Appearance**
- Theme: Dark Mode or Light Mode

### Danger Zone

**Delete Account**
- Permanently deletes all your data
-Transaction history, budgets, categories
- Cannot be undone
- Requires multiple confirmations

---

## Tips & Best Practices

### For Accurate Tracking:
1. **Record transactions immediately** - Don't wait until later
2. **Use descriptive names** - Make transactions easy to identify
3. **Create custom categories** - Tailor to your specific needs
4. **Review dashboard daily** - Stay aware of your spending

### For Better Budgeting:
1. **Start conservative** - Set realistic budgets
2. **Review monthly** - Adjust based on actual spending
3. **Set alert thresholds** - Get warnings before overspending
4. **Track trends** - Use reports to spot patterns

### For Organization:
1. **Export monthly reports** - Keep records for taxes
2. **Use payment methods** - Track where money goes
3. **Add descriptions** - Remember what purchases were for
4. **Regular backups** -Export CSV files periodically

---

## Keyboard Shortcuts

- `Ctrl + /` - Focus search
- `Esc` - Close modals
- `Tab` - Navigate form fields

---

## Troubleshooting

### Can't log in?
- Verify email and password are correct
- Clear browser cache and try again
- Use "Forgot Password" feature (if available)

### Transactions not showing?
- Check filters are not too restrictive
- Click refresh button on dashboard
- Verify transaction was successfully created

### Budget not tracking correctly?
- Ensure transactions have correct category
- Check budget date range includes transactions
- Verify amounts are accurate

---

## Need Help?

For additional support or questions, please refer to:
- API Documentation: `API_DOCUMENTATION.md`
- README: `README.md`
- GitHub Issues: [Report a bug or request feature]

---

**Happy budgeting! 💰**
