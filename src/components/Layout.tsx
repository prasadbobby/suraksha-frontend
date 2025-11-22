import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '@/lib/api';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide bottom navigation on login screen or if not authenticated
  const shouldShowBottomNav = isAuthenticated() && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Bottom Navigation - only show when authenticated */}
      {shouldShowBottomNav && <BottomNavigation />}
    </div>
  );
};

export default Layout;