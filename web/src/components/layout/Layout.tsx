import type { ReactNode } from 'react';
import { TopNav } from './TopNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1584968143694-8fa8bbde5247?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "",
        backgroundRepeat: "repeat",
        minHeight: '100vh',
      }}>
      <TopNav />
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
