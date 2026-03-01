'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1e293b',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: '0.95rem',
            color: '#64748b',
            marginTop: '4px',
            margin: '4px 0 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
