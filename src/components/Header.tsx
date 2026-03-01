'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, List, Upload, BarChart3, Home, Settings } from 'lucide-react';

const TAB_CONFIG = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'transactions', label: 'Transazioni', icon: List, href: '/transactions' },
  { id: 'upload', label: 'Upload', icon: Upload, href: '/upload' },
  { id: 'analytics', label: 'Analisi', icon: BarChart3, href: '/views/per-persona' },
  { id: 'casa', label: 'Casa S. Severa', icon: Home, href: '/views/casa-santa-severa' },
  { id: 'settings', label: 'Impostazioni', icon: Settings, href: '/settings' },
];

export default function Header() {
  const pathname = usePathname();

  const isActiveTab = (tabId: string, href: string) => {
    if (tabId === 'dashboard') return pathname === '/';
    if (tabId === 'analytics') return pathname.startsWith('/views/') && !pathname.startsWith('/views/casa-santa-severa');
    if (tabId === 'casa') return pathname.startsWith('/views/casa-santa-severa');
    return pathname.startsWith(href);
  };

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 2rem 0 2rem',
      }}
    >
      {/* Header Title Area */}
      <div style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <h1
          style={{
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          💼 Expense Monitor
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            margin: '4px 0 0 0',
          }}
        >
          Gestione Spese Personali
        </p>
      </div>

      {/* Tab Navigation */}
      <nav
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          scrollBehavior: 'smooth',
        }}
      >
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.id, tab.href);

          return (
            <Link key={tab.id} href={tab.href}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: isActive ? 'white' : 'transparent',
                  color: isActive ? '#667eea' : 'rgba(255, 255, 255, 0.8)',
                  border: isActive ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
