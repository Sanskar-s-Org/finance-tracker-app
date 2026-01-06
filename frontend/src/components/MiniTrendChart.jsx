import PropTypes from 'prop-types';

const MiniTrendChart = ({ data, color, width = 120, height = 40 }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Create SVG path
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    // Create area path
    const areaPath = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            {/* Area fill */}
            <path
                d={areaPath}
                fill={`url(#gradient-${color})`}
                opacity="0.2"
            />
            {/* Line */}
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Gradient definition */}
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

MiniTrendChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default MiniTrendChart;
