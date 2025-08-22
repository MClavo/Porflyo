import type { ReactNode } from 'react';
import { TopNav } from './TopNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <TopNav />
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
