'use client';

import { useEffect } from 'react';
import { seedDatabase } from '@/lib/seed';

interface DatabaseInitProps {
  children: React.ReactNode;
}

export default function DatabaseInit({ children }: DatabaseInitProps) {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  return <>{children}</>;
}
