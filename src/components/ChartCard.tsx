'use client';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

const EMOJI_MAP: Record<string, string> = {
  'Entrate vs Uscite per Mese': '📊',
  'Chi Spende (per Persona)': '👥',
  'Top 15 Categorie di Spesa': '🏷️',
  'Dettaglio Spese': '📋',
  'Analisi per Categoria': '📈',
  'Trend Mensile': '📉',
};

export default function ChartCard({ title, children, height = 400 }: ChartCardProps) {
  const emoji = EMOJI_MAP[title] || '📊';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '15px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        animation: 'fadeInUp 0.5s ease',
      }}
    >
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#334155',
          margin: '0 0 1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span>{emoji}</span>
        {title}
      </h3>

      <div style={{ height: `${height}px`, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
