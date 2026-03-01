'use client';

export interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function MetricCard({ label, value, icon, gradient, trend }: MetricCardProps) {
  // Extract the first color from gradient for box-shadow
  const colorMatch = gradient.match(/#[0-9a-f]{6}/i);
  const shadowColor = colorMatch ? colorMatch[0] : '#667eea';

  return (
    <div
      style={{
        background: gradient,
        borderRadius: '15px',
        padding: '1.5rem',
        color: 'white',
        boxShadow: `0 8px 24px ${shadowColor}4d`,
        animation: 'fadeInUp 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        {trend && (
          <div
            style={{
              fontSize: '0.875rem',
              color: trend.isPositive ? '#4ade80' : '#f87171',
              fontWeight: 600,
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p
          style={{
            fontSize: '0.875rem',
            opacity: 0.9,
            margin: '0 0 0.5rem 0',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
