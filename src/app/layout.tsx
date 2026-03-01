import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import DatabaseInit from '@/components/DatabaseInit';

export const metadata: Metadata = {
  title: 'Expense Monitor',
  description: 'Gestione Spese Personali - Personal Expense Tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head />
      <body>
        <DatabaseInit>
          <Header />
          <main
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '2rem',
              background: 'var(--gray-50)',
            }}
          >
            {children}
          </main>
        </DatabaseInit>
      </body>
    </html>
  );
}
