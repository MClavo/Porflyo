import React from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

interface NavbarProviderProps {
  children: ReactNode;
}

// Routes where the navbar should appear
const NAVBAR_ROUTES = ['/home', '/profile', '/dashboard', '/portfolios'];

// Check if current path should show navbar
const shouldShowNavbar = (pathname: string): boolean => {
  return NAVBAR_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const location = useLocation();
  const showNavbar = shouldShowNavbar(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

export default NavbarProvider;