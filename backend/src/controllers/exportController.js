import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

export const exportTransactionsCSV = async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon')
      .sort({ date: -1 });

    // Create CSV data
    const csvData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      type: t.type,
      category: t.category.name,
      description: t.description || '',
      amount: t.amount,
      paymentMethod: t.paymentMethod || '',
    }));

    // Convert to CSV string
    const csvHeader = 'Date,Type,Category,Description,Amount,Payment Method\n';
    const csvRows = csvData
      .map(
        row =>
          `${row.date},${row.type},${row.category},"${row.description}",${row.amount},${row.paymentMethod}`
      )
      .join('\n');
    const csvString = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon')
      .sort({ date: -1 });

    // Get user's currency
    const userCurrency = req.user.currency || 'USD';

    // Calculate summary
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    // Format currency based on user's preference
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: userCurrency,
      }).format(amount);
    };

    // Generate HTML report that can be printed to PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Financial Report</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 40px; max-width: 1200px; }
    h1 { color: #333; border-bottom: 3px solid #6366f1; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
    .summary { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; display: flex; flex-wrap: wrap; gap: 20px; }
    .summary-item { flex: 1; min-width: 200px; }
    .label { font-weight: bold; color: #666; font-size: 0.9em; margin-bottom: 5px; }
    .value { font-size: 1.4em; color: #333; font-weight: bold; }
    .income { color: #10b981; }
    .expense { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #6366f1; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f8f9fa; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 0.9em; }
    
    /* Floating Action Buttons */
    .action-buttons {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 1000;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 180px;
    }
    
    .btn-primary {
      background: #6366f1;
      color: white;
    }
    
    .btn-primary:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    
    .btn-success {
      background: #10b981;
      color: white;
    }
    
    .btn-success:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }
    
    .btn:active {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="action-buttons no-print">
    <button class="btn btn-primary" onclick="window.print()">
      <span>📥</span>
      <span>Save as PDF</span>
    </button>
    <button class="btn btn-success" onclick="generateCSV()">
      <span>📄</span>
      <span>Download CSV</span>
    </button>
  </div>

  <h1>📊 Financial Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Period:</strong> ${filter.date?.$gte ? new Date(filter.date.$gte).toLocaleDateString() : 'All time'} - ${filter.date?.$lte ? new Date(filter.date.$lte).toLocaleDateString() : 'Present'}</p>
  
  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Transactions</div>
      <div class="value">${transactions.length}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Income</div>
      <div class="value income">${formatCurrency(income)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Expense</div>
      <div class="value expense">${formatCurrency(expense)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Net Balance</div>
      <div class="value" style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">${balance >= 0 ? '+' : ''}${formatCurrency(balance)}</div>
    </div>
  </div>

  <h2>Transactions</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Category</th>
        <th>Description</th>
        <th style="text-align: right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map(t => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td style="text-transform: capitalize">${t.type}</td>
          <td>${t.category.icon} ${t.category.name}</td>
          <td>${t.description || '-'}</td>
          <td class="${t.type === 'income' ? 'income' : 'expense'}" style="text-align: right; font-weight: 600">${formatCurrency(t.amount)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Generated by Finance Tracker</strong> | ${new Date().toISOString()}</p>
    <p><em>Currency: ${userCurrency}</em></p>
  </div>

  <script>
    function generateCSV() {
      const transactions = ${JSON.stringify(transactions.map(t => ({
      date: t.date,
      type: t.type,
      category: t.category.name,
      description: t.description || '',
      amount: t.amount
    })))};

      const csvHeader = 'Date,Type,Category,Description,Amount\\n';
      const csvRows = transactions.map(t => 
        \`\${new Date(t.date).toLocaleDateString()},\${t.type},\${t.category},"\${t.description}",\${t.amount}\`
      ).join('\\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions_${new Date().toISOString().split('T')[0]}.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
