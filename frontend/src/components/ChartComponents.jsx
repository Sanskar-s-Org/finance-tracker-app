import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p
                        key={index}
                        style={{
                            color: entry.color,
                            margin: '0.25rem 0',
                            fontSize: '0.875rem',
                        }}
                    >
                        {entry.name}:{' '}
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency,
                        }).format(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Spending Trends Line Chart
export const SpendingTrendsChart = ({ data, currency = 'USD' }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Category Breakdown Pie Chart
export const CategoryPieChart = ({ data }) => {
    const COLORS = [
        '#6366f1',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981',
        '#3b82f6',
        '#ef4444',
        '#14b8a6',
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Monthly Comparison Bar Chart
export const MonthlyComparisonChart = ({ data, currency = 'USD' }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Simplified Line Chart for trends
export const SimpleTrendChart = ({ data, dataKey, color, currency = 'USD' }) => {
    return (
        <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
            </LineChart>
        </ResponsiveContainer>
    );
};
