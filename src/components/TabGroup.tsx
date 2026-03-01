'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function TabGroup({ tabs, activeTab, onChange }: TabGroupProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: activeTab === tab.id ? 'none' : '2px solid #e5e7eb',
            background: activeTab === tab.id ? '#667eea' : 'white',
            color: activeTab === tab.id ? 'white' : '#666',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
