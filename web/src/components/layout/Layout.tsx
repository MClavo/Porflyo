import type { ReactNode } from 'react';
import { TopNav } from './TopNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
