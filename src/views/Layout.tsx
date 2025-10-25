import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavigationButton } from '../components/NavigationButton';
import { NavigationMenu } from '../components/NavigationMenu';
import { useStore } from '../store/useStore';

export function Layout() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const shouldShowNavigation = isAuthenticated && location.pathname !== '/login';

  return (
    <div className="h-screen bg-[#0D0D0D] overflow-hidden">
      {shouldShowNavigation && (
        <>
          <NavigationButton onClick={() => setIsNavOpen(true)} />
          <NavigationMenu isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        </>
      )}

      <Outlet />
    </div>
  );
}
