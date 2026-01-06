import PropTypes from 'prop-types';

const DonutChart = ({ data, title, centerValue, centerLabel }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📊</div>
        <p>No expense data available</p>
      </div>
    );
  }

  // Modern, clean proportions
  const size = 220;
  const radius = 75;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const segmentLength = (percentage / 100) * circumference;
    const segment = {
      ...item,
      percentage,
      offset: currentOffset,
      length: segmentLength,
    };
    currentOffset += segmentLength;
    return segment;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Main container with chart and legend side by side */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3rem',
        flexWrap: 'wrap'
      }}>
        {/* Chart */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{
              transform: 'rotate(-90deg)',
              filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))'
            }}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(51, 65, 85, 0.2)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((segment, index) => (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.length} ${circumference}`}
                strokeDashoffset={-segment.offset}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </svg>

          {/* Center info */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              fontSize: '0.625rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.375rem'
            }}>
              {centerLabel || 'TOTAL'}
            </div>
            <div style={{
              fontSize: '1.625rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              {centerValue}
            </div>
          </div>
        </div>

        {/* Legend - Clean and organized */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          minWidth: '220px',
          maxWidth: '280px',
          flex: '1'
        }}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              className="legend-item-hover"
            >
              {/* Color dot */}
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0,
                boxShadow: `0 0 0 4px ${item.color}20`
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}>
                    {item.icon && <span style={{ fontSize: '1.0625rem' }}>{item.icon}</span>}
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: '800',
                    color: item.color,
                    marginLeft: '0.5rem'
                  }}>
                    {item.percentage?.toFixed(1)}%
                  </div>
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '600'
                }}>
                  {item.formattedValue || item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .legend-item-hover:hover {
            transform: translateX(2px);
          }
        `}
      </style>
    </div>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      icon: PropTypes.string,
      formattedValue: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  centerValue: PropTypes.string,
  centerLabel: PropTypes.string,
};

export default DonutChart;
